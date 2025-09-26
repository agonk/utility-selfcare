<?php

use App\Services\ERP\Adapters\ERPNextAdapter;
use App\Services\ERP\Adapters\MockAdapter;

return [
    'default' => env('ERP_PROVIDER', 'mock'),

    'providers' => [
        'erpnext' => [
            'adapter' => ERPNextAdapter::class,
            'url' => env('ERPNEXT_URL'),
            'api_key' => env('ERPNEXT_API_KEY'),
            'api_secret' => env('ERPNEXT_API_SECRET'),
            'timeout' => env('ERPNEXT_TIMEOUT', 30),
        ],

        'mock' => [
            'adapter' => MockAdapter::class,
        ],
    ],
];