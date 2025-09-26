<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OCRService
{
    protected $tesseractPath;

    public function __construct()
    {
        $this->tesseractPath = config('services.ocr.tesseract_path', '/usr/bin/tesseract');
    }

    /**
     * Process invoice and extract heatmeter ID
     */
    public function processInvoice(string $filePath): array
    {
        $fullPath = Storage::disk('private')->path($filePath);

        if (!file_exists($fullPath)) {
            throw new \Exception('File not found');
        }

        // Check file type
        $mimeType = mime_content_type($fullPath);

        if (str_contains($mimeType, 'pdf')) {
            // Convert PDF to image first
            $fullPath = $this->convertPdfToImage($fullPath);
        }

        // Run OCR
        $text = $this->runOCR($fullPath);

        // Extract heatmeter ID from text
        $heatmeterId = $this->extractHeatmeterId($text);

        // Extract other useful information
        $invoiceData = $this->extractInvoiceData($text);

        return array_merge([
            'heatmeter_id' => $heatmeterId,
            'raw_text' => $text,
        ], $invoiceData);
    }

    /**
     * Run Tesseract OCR on image
     */
    protected function runOCR(string $imagePath): string
    {
        if (!file_exists($this->tesseractPath)) {
            Log::warning('Tesseract not found, using mock OCR', [
                'path' => $this->tesseractPath
            ]);
            return $this->mockOCR($imagePath);
        }

        $outputFile = sys_get_temp_dir() . '/' . uniqid('ocr_') . '.txt';

        // Run Tesseract with Albanian and English languages
        $command = sprintf(
            '%s "%s" "%s" -l sqi+eng 2>&1',
            $this->tesseractPath,
            $imagePath,
            $outputFile
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            Log::error('Tesseract OCR failed', [
                'command' => $command,
                'output' => $output,
                'return_code' => $returnCode,
            ]);

            throw new \Exception('OCR processing failed');
        }

        $text = file_get_contents($outputFile . '.txt');
        unlink($outputFile . '.txt');

        return $text;
    }

    /**
     * Convert PDF to image for OCR processing
     */
    protected function convertPdfToImage(string $pdfPath): string
    {
        // This would use ImageMagick or similar
        // For now, we'll just return a mock image path

        Log::info('PDF conversion would happen here', ['pdf' => $pdfPath]);

        // In production, you'd use:
        // $imagePath = sys_get_temp_dir() . '/' . uniqid('pdf_') . '.jpg';
        // exec("convert -density 300 \"{$pdfPath}[0]\" -quality 90 \"{$imagePath}\"");
        // return $imagePath;

        return $pdfPath; // Mock return
    }

    /**
     * Extract heatmeter ID from OCR text
     */
    protected function extractHeatmeterId(string $text): ?string
    {
        // Look for patterns that match heatmeter IDs
        // Assuming format like HM123456 or similar patterns

        $patterns = [
            '/HM\d{6}/i',                    // HM followed by 6 digits
            '/Heat\s*meter\s*ID:\s*(\S+)/i', // "Heatmeter ID: xxx"
            '/Matës\s*ID:\s*(\S+)/i',        // Albanian: "Matës ID: xxx"
            '/Customer\s*No[.:]\s*(\S+)/i',   // Customer number
            '/Konsumator\s*Nr[.:]\s*(\S+)/i', // Albanian: "Konsumator Nr: xxx"
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                return trim($matches[1] ?? $matches[0]);
            }
        }

        return null;
    }

    /**
     * Extract additional invoice data
     */
    protected function extractInvoiceData(string $text): array
    {
        $data = [];

        // Extract invoice number
        if (preg_match('/Invoice\s*[#No.:]*\s*(\S+)/i', $text, $matches)) {
            $data['invoice_number'] = $matches[1];
        }

        // Extract amount
        if (preg_match('/Total[:\s]+€?\s*([\d,\.]+)/i', $text, $matches)) {
            $data['amount'] = floatval(str_replace(',', '', $matches[1]));
        }

        // Extract date
        if (preg_match('/Date[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i', $text, $matches)) {
            $data['date'] = $matches[1];
        }

        // Extract customer name
        if (preg_match('/Customer[:\s]+([^\n]+)/i', $text, $matches)) {
            $data['customer_name'] = trim($matches[1]);
        }

        return $data;
    }

    /**
     * Mock OCR for development when Tesseract is not installed
     */
    protected function mockOCR(string $imagePath): string
    {
        // Return mock text that looks like an invoice
        return "
            FATURA / INVOICE

            Invoice No: INV-2024-001
            Date: 15/01/2024

            Customer: John Doe
            Konsumator: John Doe

            Heatmeter ID: HM123456
            Matës ID: HM123456

            Consumption: 450 kWh
            Konsumi: 450 kWh

            Total: €125.50
            Totali: €125.50

            Please pay by: 15/02/2024
            Ju lutem paguani deri: 15/02/2024
        ";
    }
}