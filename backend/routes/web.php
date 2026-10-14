<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\JournalController;
use App\Http\Middleware\PrivateHeaders;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->middleware(PrivateHeaders::class)->group(function () {
    Route::get('/csrf', fn () => response()->json(['token' => csrf_token()]));
    Route::get('/articles', fn () => Article::orderBy('id')->get());
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgot']);
        Route::post('/reset-password', [AuthController::class, 'reset']);
    });
    Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
        Route::get('/user', fn (Request $r) => response()->json($r->user()));
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/settings', [AuthController::class, 'settings']);
        Route::delete('/account', [AuthController::class, 'delete'])->middleware('throttle:sensitive');
        Route::get('/journal', [JournalController::class, 'index']);
        Route::post('/periods', [JournalController::class, 'period']);
        Route::put('/periods/{id}', [JournalController::class, 'period'])->whereNumber('id');
        Route::delete('/periods/{id}', [JournalController::class, 'deletePeriod'])->whereNumber('id');
        Route::post('/symptoms', [JournalController::class, 'symptom']);
        Route::put('/symptoms/{id}', [JournalController::class, 'symptom'])->whereNumber('id');
        Route::delete('/symptoms/{id}', [JournalController::class, 'deleteSymptom'])->whereNumber('id');
        Route::get('/export', [JournalController::class, 'export'])->middleware('throttle:exports');
    });
});
Route::get('/{path?}', function () {
    $file = public_path('app/index.html');
    abort_unless(file_exists($file), 503, 'Build the frontend with npm run build.');

    return response()->file($file, ['Cache-Control' => 'no-cache', 'Content-Security-Policy' => "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'", 'Referrer-Policy' => 'same-origin', 'X-Content-Type-Options' => 'nosniff']);
})->where('path','^(?!api|sanctum|app/).*$');
