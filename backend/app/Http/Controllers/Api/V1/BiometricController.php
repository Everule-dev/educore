<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\BiometricDevice;
use App\Models\BiometricIdentityMapping;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BiometricController extends Controller
{
    /**
     * Ingest Biometric Attendance Event from Hardware Device (e.g. Edge Terminal)
     */
    public function ingestEvent(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'event_id' => 'required|string',
            'device_person_reference' => 'required|string',
            'device_timestamp' => 'required|string',
            'signature' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify device authorization
        $device = BiometricDevice::where('tenant_id', $tenant->id)
            ->where('device_id', $request->device_id)
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Unauthorized or unregistered biometric terminal.'], 403);
        }

        // Resolve person mapping
        $mapping = BiometricIdentityMapping::where('tenant_id', $tenant->id)
            ->where('device_person_reference', $request->device_person_reference)
            ->first();

        if (!$mapping) {
            return response()->json([
                'message' => 'Biometric fingerprint recognized on device but no institutional student or staff identity mapping exists.',
            ], 404);
        }

        $date = substr($request->device_timestamp, 0, 10);

        // Record or update attendance
        $record = AttendanceRecord::updateOrCreate(
            [
                'tenant_id' => $tenant->id,
                'person_id' => $mapping->person_id,
                'attendance_date' => $date,
            ],
            [
                'person_type' => $mapping->person_type,
                'status' => 'present',
                'source' => 'biometric_device',
            ]
        );

        $device->update([
            'last_heartbeat' => now(),
            'status' => 'online',
        ]);

        return response()->json([
            'success' => true,
            'message' => sprintf('Biometric scan validated. %s marked present.', $mapping->person_name),
            'attendance_id' => $record->id,
            'event_id' => $request->event_id,
        ]);
    }

    /**
     * List Biometric Terminals
     */
    public function devices(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $devices = BiometricDevice::where('tenant_id', $tenant->id)->get();
        return response()->json($devices);
    }

    /**
     * Register New Hardware Terminal
     */
    public function registerDevice(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'name' => 'required|string',
            'model' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $device = BiometricDevice::create([
            'tenant_id' => $tenant->id,
            'device_id' => $request->device_id,
            'name' => $request->name,
            'model' => $request->model ?? 'BioStation Optical Reader',
            'location' => $request->location ?? 'Main Campus Entrance',
            'api_key_fingerprint' => 'sha256_' . Str::random(16),
            'status' => 'online',
            'last_heartbeat' => now(),
        ]);

        return response()->json(['message' => 'Device enrolled.', 'device' => $device], 201);
    }

    /**
     * List Biometric Mappings
     */
    public function mappings(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $mappings = BiometricIdentityMapping::where('tenant_id', $tenant->id)->get();
        return response()->json($mappings);
    }

    /**
     * Create Biometric Identity Mapping
     */
    public function createMapping(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $validator = Validator::make($request->all(), [
            'device_person_reference' => 'required|string',
            'person_id' => 'required|string',
            'person_name' => 'required|string',
            'person_type' => 'nullable|string',
            'enrolled_finger' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mapping = BiometricIdentityMapping::create([
            'tenant_id' => $tenant->id,
            'device_person_reference' => $request->device_person_reference,
            'person_id' => $request->person_id,
            'person_name' => $request->person_name,
            'person_type' => $request->person_type ?? 'student',
            'enrolled_finger' => $request->enrolled_finger ?? 'Right Index',
            'enrolled_at' => now(),
        ]);

        return response()->json(['message' => 'Biometric template mapped to student profile.', 'mapping' => $mapping], 201);
    }
}
