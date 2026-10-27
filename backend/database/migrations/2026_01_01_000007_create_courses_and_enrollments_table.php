<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->date('starts_at');
            $table->date('ends_at');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->string('course_type')->default('standard');
            $table->text('description')->nullable();
            $table->integer('credits')->default(0);
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignUuid('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignUuid('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignUuid('academic_period_id')->nullable()->constrained('academic_periods')->onDelete('set null');
            $table->string('status')->default('enrolled'); // 'enrolled', 'completed', 'dropped'
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('person_type'); // 'student', 'staff', 'member'
            $table->uuid('person_id');
            $table->date('attendance_date');
            $table->string('status')->default('present'); // 'present', 'absent', 'late', 'excused'
            $table->string('source')->default('manual'); // 'manual', 'biometric_release_2'
            $table->foreignUuid('recorded_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['tenant_id', 'attendance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('academic_periods');
    }
};
