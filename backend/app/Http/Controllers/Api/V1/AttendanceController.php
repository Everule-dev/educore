<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrection;
use App\Models\AttendanceExportJob;
use App\Models\AttendanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $query = AttendanceRecord::where('tenant_id', $tenant->id)
            ->with(['recorder', 'corrections.modifier'])
            ->orderBy('attendance_date', 'desc');

        if ($request->has('date') && $request->date) {
            $query->whereDate('attendance_date', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('person_type') && $request->person_type) {
            $query->where('person_type', $request->person_type);
        }

        return response()->json($query->paginate(30));
    }

    public function store(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'person_type' => 'required|in:student,staff,member',
            'person_id' => 'required|string',
            'attendance_date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'source' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = AttendanceRecord::updateOrCreate(
            [
                'tenant_id' => $tenant->id,
                'person_id' => $request->person_id,
                'attendance_date' => $request->attendance_date,
            ],
            [
                'person_type' => $request->person_type,
                'status' => $request->status,
                'source' => $request->source ?? 'manual',
                'recorded_by' => $user->id,
            ]
        );

        return response()->json([
            'message' => 'Attendance logged successfully.',
            'record' => $record,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,absent,late,excused',
            'reason' => 'required|string|min:4',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = AttendanceRecord::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $previousStatus = $record->status;
        $newStatus = $request->status;

        DB::transaction(function () use ($record, $user, $previousStatus, $newStatus, $request) {
            $record->update(['status' => $newStatus]);

            AttendanceCorrection::create([
                'attendance_record_id' => $record->id,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'reason' => $request->reason,
                'modified_by' => $user->id,
            ]);
        });

        return response()->json([
            'message' => 'Attendance record corrected and audited.',
            'record' => $record->fresh('corrections.modifier'),
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $job = AttendanceExportJob::create([
            'tenant_id' => $tenant->id,
            'requested_by' => $user->id,
            'status' => 'completed',
            'filter_summary' => $request->input('summary', 'Full institutional roster export'),
            'record_count' => AttendanceRecord::where('tenant_id', $tenant->id)->count(),
            'download_url' => sprintf('/api/v1/attendance/download/%s.csv', uuid_create()),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'message' => 'Attendance export job generated.',
            'job' => $job,
        ], 202);
    }
}
