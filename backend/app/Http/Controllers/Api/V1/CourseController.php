<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $query = Course::where('tenant_id', $tenant->id)
            ->withCount('enrollments')
            ->orderBy('name', 'asc');

        if ($request->has('search') && $request->search) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('code', 'like', $term);
            });
        }

        return response()->json($query->paginate(25));
    }

    public function store(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'course_type' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'credits' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = Course::where('tenant_id', $tenant->id)
            ->where('code', $request->code)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Course code already exists in this institution.'], 422);
        }

        $course = Course::create([
            'tenant_id' => $tenant->id,
            'code' => strtoupper($request->code),
            'name' => $request->name,
            'course_type' => $request->course_type ?? 'standard',
            'description' => $request->description,
            'credits' => $request->credits ?? 3,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $course = Course::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->with('enrollments.student')
            ->firstOrFail();

        return response()->json($course);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $course = Course::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $course->update($request->only([
            'name',
            'course_type',
            'description',
            'credits',
            'status',
        ]));

        return response()->json(['message' => 'Course updated.', 'course' => $course]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $course = Course::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $course->delete();
        return response()->json(['message' => 'Course removed.']);
    }
}
