<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_heatmeters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('heatmeter_id', 100);
            $table->string('customer_name', 255)->nullable();
            $table->string('customer_id', 100)->nullable()->comment('ERPNext customer ID');
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_method', 20)->nullable()->comment('otp or invoice');
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_owner')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'heatmeter_id'], 'idx_user_heatmeter');
            $table->unique(['user_id', 'heatmeter_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_heatmeters');
    }
};