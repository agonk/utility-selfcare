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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('heatmeter_id')->nullable()->after('phone');
            $table->boolean('is_verified')->default(false)->after('email_verified_at');
            $table->enum('verification_type', ['otp', 'invoice', 'pending'])->nullable()->after('is_verified');
            $table->timestamp('verified_at')->nullable()->after('verification_type');
            $table->string('language', 2)->default('sq')->after('verified_at');
            $table->boolean('is_admin')->default(false)->after('language');
            $table->timestamp('last_login_at')->nullable()->after('is_admin');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->integer('login_attempts')->default(0)->after('last_login_ip');
            $table->timestamp('locked_until')->nullable()->after('login_attempts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'heatmeter_id',
                'is_verified',
                'verification_type',
                'verified_at',
                'language',
                'is_admin',
                'last_login_at',
                'last_login_ip',
                'login_attempts',
                'locked_until'
            ]);
        });
    }
};
