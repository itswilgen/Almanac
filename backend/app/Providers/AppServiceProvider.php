<?php

namespace App\Providers;

use App\Mail\PreviewTransport;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('auth', fn ($r) => [Limit::perMinute(10)->by($r->ip()), Limit::perMinute(5)->by(hash('sha256', strtolower((string) $r->input('email')).$r->ip()))]);
        RateLimiter::for('exports', fn ($r) => Limit::perMinute(5)->by('export:'.$r->user()->id));
        RateLimiter::for('sensitive', fn ($r) => Limit::perMinute(5)->by('sensitive:'.$r->user()->id));
        Mail::extend('preview', fn () => new PreviewTransport);
        ResetPassword::createUrlUsing(fn ($user, $token) => config('app.url').'/reset-password?token='.urlencode($token).'&email='.urlencode($user->email));
    }
}
