<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SymptomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return ['date' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.now($this->user()->timezone)->toDateString()], 'bleeding' => 'required|in:none,spotting,light,moderate,heavy', 'cramps' => 'required|in:none,mild,moderate,severe', 'mood' => 'required|in:unrecorded,calm,energized,low,anxious,irritable', 'notes' => 'nullable|string|max:2000'];
    }
}
