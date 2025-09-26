<?php

namespace App\Services\ERP;

use App\Services\ERP\Contracts\ERPInterface;
use Illuminate\Support\Manager;

class ERPManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return $this->config->get('erp.default', 'mock');
    }

    protected function createErpnextDriver(): ERPInterface
    {
        $config = $this->config->get('erp.providers.erpnext');

        return $this->container->make($config['adapter'], [
            'config' => $config
        ]);
    }

    protected function createMockDriver(): ERPInterface
    {
        $config = $this->config->get('erp.providers.mock');

        return $this->container->make($config['adapter']);
    }

    public function driver($driver = null): ERPInterface
    {
        return parent::driver($driver);
    }
}