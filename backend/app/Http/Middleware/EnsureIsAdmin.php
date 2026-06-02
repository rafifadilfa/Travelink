<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Token Sanctum yang disertakan harus milik model Admin
        if (!($request->user() instanceof Admin)) {
            return response()->json([
                'message' => 'Akses ditolak. Halaman ini hanya untuk administrator.',
            ], 403);
        }

        return $next($request);
    }
}
