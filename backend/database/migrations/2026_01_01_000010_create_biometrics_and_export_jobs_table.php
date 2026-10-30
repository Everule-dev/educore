<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biometric_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('device_id');
            $table->string('name');
            $table->string('model')->default('ZKTeco BioStation Pro');
            $table->string('location')->default('Main Entrance');
            $table->string('firmware_version')->default('v2.4.1');
            $table->string('api_key_fingerprint');
            $table->string('status')->default('online'); // 'online', 'offline', 'syncing'
            $table->timestamp('last_heartbeat')->nullable();
            $table->integer('pending_sync_count')->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'device_id']);
        });

        Schema::create('biometric_identity_mappings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('device_person_reference');
            $table->uuid('person_id');
            $table->string('person_name');
            $table->string('person_type')->default('student');
            $table->string('enrolled_finger')->default('Right Index');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();

            $table->unique(['tenant_id', 'device_person_reference'], 'bio_mappings_tenant_device_unique');
        });

        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attendance_record_id')->constrained('attendance_records')->onDelete('cascade');
            $table->string('previous_status');
            $table->string('new_status');
            $table->text('reason');
            $table->foreignUuid('modified_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('attendance_export_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignUuid('requested_by')->constrained('users');
            $table->string('status')->default('queued'); // 'queued', 'processing', 'completed'
            $table->string('filter_summary');
            $table->integer('record_count')->default(0);
            $table->text('download_url')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_export_jobs');
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('biometric_identity_mappings');
        Schema::dropIfExists('biometric_devices');
    }
};
