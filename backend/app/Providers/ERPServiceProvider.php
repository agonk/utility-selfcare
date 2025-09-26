<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ERP\ERPManager;

class ERPServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ERPManager::class, function ($app) {
            return new ERPManager($app);
        });

        $this->app->alias(ERPManager::class, 'erp');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
