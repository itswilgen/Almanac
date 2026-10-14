<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SymptomEntry extends Model
{
    protected $fillable = ['date', 'observations'];

    protected $hidden = ['user_id'];

    protected function casts(): array
    {
        return ['date' => 'encrypted', 'observations' => 'encrypted:array'];
    }
}
