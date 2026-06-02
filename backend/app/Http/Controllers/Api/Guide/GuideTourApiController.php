<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller untuk manajemen paket tour oleh pemandu wisata.
 * Semua endpoint di sini dilindungi oleh middleware EnsureGuideIsVerified —
 * hanya guide dengan verification_status = 'verified' yang bisa mengaksesnya.
 *
 * Saat ini berisi stub (placeholder) — logika bisnis akan diisi saat
 * pengerjaan fitur guide tours dimulai.
 */
class GuideTourApiController extends Controller
{
    /** GET /api/guide/tours — daftar semua tour milik guide yang login */
    public function index(Request $request): JsonResponse
    {
        // TODO: return tour milik $request->user() dengan pagination
        return response()->json([
            'message' => 'Endpoint daftar tour guide — belum diimplementasi.',
            'guide'   => $request->user()->only(['id', 'name', 'verification_status']),
        ], 200);
    }

    /** POST /api/guide/tours — buat paket tour baru */
    public function store(Request $request): JsonResponse
    {
        // TODO: validasi input, simpan tour, upload gambar, dsb.
        return response()->json([
            'message' => 'Endpoint buat tour baru — belum diimplementasi.',
            'guide'   => $request->user()->only(['id', 'name', 'verification_status']),
        ], 200);
    }

    /** GET /api/guide/tours/{id} — detail satu tour */
    public function show(Request $request, int $id): JsonResponse
    {
        // TODO: cek kepemilikan tour, return detail
        return response()->json([
            'message' => "Endpoint detail tour #{$id} — belum diimplementasi.",
        ], 200);
    }

    /** PUT /api/guide/tours/{id} — update paket tour */
    public function update(Request $request, int $id): JsonResponse
    {
        // TODO: validasi input, update tour
        return response()->json([
            'message' => "Endpoint update tour #{$id} — belum diimplementasi.",
        ], 200);
    }

    /** DELETE /api/guide/tours/{id} — hapus (soft delete) paket tour */
    public function destroy(Request $request, int $id): JsonResponse
    {
        // TODO: soft delete tour
        return response()->json([
            'message' => "Endpoint hapus tour #{$id} — belum diimplementasi.",
        ], 200);
    }
}

