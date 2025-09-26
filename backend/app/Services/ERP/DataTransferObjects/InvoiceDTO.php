<?php

namespace App\Services\ERP\DataTransferObjects;

use DateTime;

class InvoiceDTO
{
    public function __construct(
        public string $id,
        public string $customerId,
        public DateTime $date,
        public DateTime $dueDate,
        public float $amount,
        public float $paid,
        public float $outstanding,
        public string $status,
        public float $kwhConsumed = 0,
        public float $volumeM3 = 0,
        public ?float $gcalEquivalent = null,
        public ?DateTime $readingDate = null,
        public array $items = [],
        public array $rawERPData = []
    ) {}

    public static function fromERPNext(array $data): self
    {
        $status = match(strtolower($data['status'] ?? '')) {
            'draft' => 'draft',
            'unpaid', 'overdue', 'partly paid' => 'unpaid',
            'paid' => 'paid',
            'cancelled', 'canceled' => 'cancelled',
            default => 'unknown',
        };

        return new self(
            id: $data['name'],
            customerId: $data['customer'],
            date: new DateTime($data['posting_date'] ?? $data['due_date']),
            dueDate: new DateTime($data['due_date']),
            amount: (float) ($data['grand_total'] ?? 0),
            paid: (float) ($data['paid_amount'] ?? 0),
            outstanding: (float) ($data['outstanding_amount'] ?? 0),
            status: $status,
            kwhConsumed: (float) ($data['custom_kwh_consumed'] ?? 0),
            volumeM3: (float) ($data['custom_volume_m3'] ?? 0),
            gcalEquivalent: isset($data['custom_gcal']) ? (float) $data['custom_gcal'] : null,
            readingDate: isset($data['custom_reading_date']) ? new DateTime($data['custom_reading_date']) : null,
            items: $data['items'] ?? [],
            rawERPData: $data
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            customerId: $data['customer_id'],
            date: new DateTime($data['date']),
            dueDate: new DateTime($data['due_date']),
            amount: (float) $data['amount'],
            paid: (float) ($data['paid'] ?? 0),
            outstanding: (float) ($data['outstanding'] ?? $data['amount']),
            status: $data['status'],
            kwhConsumed: (float) ($data['kwh_consumed'] ?? 0),
            volumeM3: (float) ($data['volume_m3'] ?? 0),
            gcalEquivalent: isset($data['gcal']) ? (float) $data['gcal'] : null,
            readingDate: isset($data['reading_date']) ? new DateTime($data['reading_date']) : null,
            items: $data['items'] ?? [],
            rawERPData: $data['raw_data'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customerId,
            'date' => $this->date->format('Y-m-d'),
            'due_date' => $this->dueDate->format('Y-m-d'),
            'amount' => $this->amount,
            'paid' => $this->paid,
            'outstanding' => $this->outstanding,
            'status' => $this->status,
            'kwh_consumed' => $this->kwhConsumed,
            'volume_m3' => $this->volumeM3,
            'gcal' => $this->gcalEquivalent,
            'reading_date' => $this->readingDate?->format('Y-m-d'),
        ];
    }
}