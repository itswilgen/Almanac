<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodEntry extends Model
{
    protected $fillable = ['start_date', 'end_date'];

    protected $hidden = ['user_id'];

    protected function casts(): array
    {
        return ['start_date' => 'encrypted', 'end_date' => 'encrypted'];
    }
}
