<?php

namespace App\Domain;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class Journal
{
    public function savePeriod(User $user, array $data, ?int $id = null)
    {
        return DB::transaction(function () use ($user, $data, $id) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $entry = $id ? $user->periods()->findOrFail($id) : $user->periods()->make();
            foreach ($user->periods()->get() as $other) {
                if ($other->id === $id) {
                    continue;
                }
                if ($data['start_date'] <= ($other->end_date ?? '9999-12-31') && ($data['end_date'] ?? '9999-12-31') >= $other->start_date) {
                    throw ValidationException::withMessages(['start_date' => 'These dates overlap another period. End an ongoing period or correct the dates first.']);
                }
            }
            $entry->fill($data)->save();

            return $entry;
        });
    }

    public function saveSymptom(User $user, array $data, ?int $id = null)
    {
        return DB::transaction(function () use ($user, $data, $id) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $entry = $id ? $user->symptoms()->findOrFail($id) : $user->symptoms()->make();
            foreach ($user->symptoms()->get() as $other) {
                if ($other->id !== $id && $other->date === $data['date']) {
                    throw ValidationException::withMessages(['date' => 'A check-in already exists for this date. Edit it from your journal.']);
                }
            }
            $entry->fill(['date' => $data['date'], 'observations' => collect($data)->except('date')->all()])->save();

            return $entry;
        });
    }
}
