<?php

namespace App\Services\ERP\DataTransferObjects;

use DateTime;

class PaymentDTO
{
    public function __construct(
        public string $customerId,
        public string $invoiceId,
        public float $amount,
        public DateTime $paymentDate,
        public string $reference,
        public string $paymentMethod = 'Card',
        public ?string $id = null,
        public array $metadata = []
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            customerId: $data['customer_id'],
            invoiceId: $data['invoice_id'],
            amount: (float) $data['amount'],
            paymentDate: new DateTime($data['payment_date'] ?? 'now'),
            reference: $data['reference'],
            paymentMethod: $data['payment_method'] ?? 'Card',
            id: $data['id'] ?? null,
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'customer_id' => $this->customerId,
            'invoice_id' => $this->invoiceId,
            'amount' => $this->amount,
            'payment_date' => $this->paymentDate->format('Y-m-d'),
            'reference' => $this->reference,
            'payment_method' => $this->paymentMethod,
        ];
    }
}