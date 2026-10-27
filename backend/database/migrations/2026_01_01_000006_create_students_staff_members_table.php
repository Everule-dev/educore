<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('restrict');
            $table->string('student_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('status')->default('active'); // 'active', 'graduated', 'withdrawn', 'suspended'
            $table->timestamps();

            $table->unique(['tenant_id', 'student_number']);
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('restrict');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('staff_number');
            $table->string('name');
            $table->string('department')->nullable();
            $table->string('designation')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['tenant_id', 'staff_number']);
        });

        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('restrict');
            $table->string('membership_number');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['tenant_id', 'membership_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
        Schema::dropIfExists('staff');
        Schema::dropIfExists('students');
    }
};
