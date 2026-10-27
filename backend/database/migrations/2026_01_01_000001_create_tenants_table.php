<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('tenant_type'); // 'school', 'organization'
            $table->string('institution_type'); // 'traditional', 'vocational', 'culinary', 'ngo', etc.
            $table->string('registration_number')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('state')->nullable();
            $table->string('lga')->nullable();
            $table->string('country_code', 2)->default('NG');
            $table->string('status')->default('pending'); // 'pending', 'active', 'suspended', 'rejected', 'closed'
            $table->timestamp('approved_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->index(['tenant_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
