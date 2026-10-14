<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PrivateHeaders
{
    public function handle(Request $r, Closure $next)
    {
        $response = $next($r);
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'same-origin');
        $response->headers->set('X-Frame-Options', 'DENY');

        return $response;
    }
}
