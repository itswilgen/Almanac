<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'timezone', 'preferences', 'onboarded'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'preferences' => 'encrypted:array', 'onboarded' => 'boolean'];
    }

    public function periods()
    {
        return $this->hasMany(PeriodEntry::class);
    }

    public function symptoms()
    {
        return $this->hasMany(SymptomEntry::class);
    }
}
