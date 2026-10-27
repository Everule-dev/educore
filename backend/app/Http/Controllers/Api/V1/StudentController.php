<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $query = Student::where('tenant_id', $tenant->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', $term)
                  ->orWhere('last_name', 'like', $term)
                  ->orWhere('student_number', 'like', $term)
                  ->orWhere('email', 'like', $term);
            });
        }

        return response()->json($query->paginate(25));
    }

    public function store(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'student_number' => 'required|string|max:100',
            'email' => 'nullable|email|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify uniqueness within tenant
        $exists = Student::where('tenant_id', $tenant->id)
            ->where('student_number', $request->student_number)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Student registration number already exists in this institution.'], 422);
        }

        $student = Student::create([
            'tenant_id' => $tenant->id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'student_number' => $request->student_number,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'status' => 'active',
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'student.enrolled',
            'target_type' => 'student',
            'target_id' => $student->id,
            'payload' => ['student_number' => $student->student_number],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Student enrolled successfully.',
            'student' => $student,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $student = Student::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->with(['enrollments.course', 'credentials'])
            ->firstOrFail();

        return response()->json($student);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $student = Student::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $student->update($request->only([
            'first_name',
            'last_name',
            'email',
            'gender',
            'date_of_birth',
            'status',
        ]));

        return response()->json(['message' => 'Student record updated.', 'student' => $student]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $student = Student::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        // Check if student has issued credentials
        if ($student->credentials()->where('status', 'issued')->exists()) {
            return response()->json([
                'message' => 'Cannot delete student with authoritative issued credentials on the immutable ledger. Use archive instead.',
            ], 422);
        }

        $student->delete();
        return response()->json(['message' => 'Student record removed.']);
    }

    public function archive(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $student = Student::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $student->update(['status' => 'withdrawn']);
        return response()->json(['message' => 'Student marked as withdrawn/archived.', 'student' => $student]);
    }
}
