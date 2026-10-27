<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('credential_id')->nullable()->constrained('credentials')->onDelete('set null');
            $table->string('lookup_type'); // 'verification_id', 'hash', 'qr_scan'
            $table->string('lookup_value');
            $table->string('result'); // 'VALID', 'INVALID', 'REVOKED', 'SUPERSEDED', 'NOT_FOUND'
            $table->string('requester_category'); // 'public', 'company'
            $table->foreignUuid('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['company_id', 'created_at']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->onDelete('set null');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action');
            $table->string('target_type')->nullable();
            $table->uuid('target_id')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tenant_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('verification_logs');
    }
};
