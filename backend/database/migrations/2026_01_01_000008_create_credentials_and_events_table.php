<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credentials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('restrict');
            $table->string('recipient_type'); // 'student', 'trainee', 'member', 'staff'
            $table->uuid('recipient_id');
            $table->string('recipient_name');
            $table->string('credential_number');
            $table->string('credential_type'); // 'degree', 'diploma', 'certificate_of_completion', etc.
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('issuer_user_id')->constrained('users');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->string('status')->default('draft'); // 'draft', 'pending_approval', 'approved', 'issued', 'revoked', 'superseded'
            $table->string('canonical_data_version')->default('1.0');
            $table->string('hash_algorithm')->default('SHA-256');
            $table->string('credential_hash', 64)->nullable();
            $table->string('verification_id', 64)->unique();
            $table->text('document_path')->nullable();
            $table->foreignUuid('supersedes_credential_id')->nullable()->constrained('credentials')->onDelete('set null');
            $table->text('revocation_reason')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index('credential_hash');
            $table->index('verification_id');
        });

        Schema::create('credential_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('credential_id')->constrained('credentials')->onDelete('cascade');
            $table->string('event_type'); // 'created', 'submitted', 'approved', 'issued', 'revoked', 'superseded'
            $table->foreignUuid('actor_id')->nullable()->constrained('users');
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credential_events');
        Schema::dropIfExists('credentials');
    }
};
