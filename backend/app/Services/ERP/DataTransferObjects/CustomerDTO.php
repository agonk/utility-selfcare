<?php

namespace App\Services\ERP\DataTransferObjects;

class CustomerDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $address,
        public ?string $heatmeterId,
        public float $balance,
        public string $status = 'active',
        public array $metadata = []
    ) {}

    public static function fromERPNext(array $data): self
    {
        return new self(
            id: $data['name'],
            name: $data['customer_name'] ?? '',
            address: $data['primary_address'] ?? $data['customer_primary_address'] ?? '',
            heatmeterId: $data['custom_heatmeter_id'] ?? null,
            balance: (float) ($data['outstanding_amount'] ?? 0),
            status: ($data['disabled'] ?? 0) == 1 ? 'inactive' : 'active',
            metadata: $data
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            name: $data['name'],
            address: $data['address'] ?? '',
            heatmeterId: $data['heatmeterId'] ?? $data['heatmeter_id'] ?? null,
            balance: (float) ($data['balance'] ?? 0),
            status: $data['status'] ?? 'active',
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'heatmeter_id' => $this->heatmeterId,
            'balance' => $this->balance,
            'status' => $this->status,
        ];
    }
}