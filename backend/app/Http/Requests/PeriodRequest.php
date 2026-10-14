<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $today = now($this->user()->timezone)->toDateString();

        return ['start_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.$today], 'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date', 'before_or_equal:'.$today]];
    }
}
