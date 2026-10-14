<?php

namespace App\Http\Controllers;

use App\Domain\CycleSummary;
use App\Domain\FertilityPolicy;
use App\Domain\Journal;
use App\Http\Requests\PeriodRequest;
use App\Http\Requests\SymptomRequest;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $r, CycleSummary $summary, FertilityPolicy $fertility)
    {
        $u = $r->user();
        $periods = $u->periods()->get()->sortBy('start_date')->values();
        $symptoms = $u->symptoms()->get()->sortByDesc('date')->values();

        return ['periods' => $periods, 'symptoms' => $symptoms, 'summary' => $summary->calculate($periods->toArray(), now($u->timezone)->toDateString()), 'fertility' => $fertility->evaluate()];
    }

    public function period(PeriodRequest $r, Journal $journal, ?int $id = null)
    {
        return $journal->savePeriod($r->user(), $r->validated(), $id);
    }

    public function symptom(SymptomRequest $r, Journal $journal, ?int $id = null)
    {
        return $journal->saveSymptom($r->user(), $r->validated(), $id);
    }

    public function deletePeriod(Request $r, int $id)
    {
        $r->user()->periods()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function deleteSymptom(Request $r, int $id)
    {
        $r->user()->symptoms()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function export(Request $r, CycleSummary $summary)
    {
        $u = $r->user();
        $periods = $u->periods()->get()->sortBy('start_date')->values();
        $symptoms = $u->symptoms()->get()->sortBy('date');
        $result = $summary->calculate($periods->toArray(), now($u->timezone)->toDateString());

        return response()->streamDownload(function () use ($periods, $symptoms, $result) {
            $f = fopen('php://output', 'w');
            $write = function ($row) use ($f) {
                fputcsv($f, array_map(fn ($s) => is_string($s) && preg_match('/^[\s]*[=+@\-]/u', $s) ? "'".$s : $s, $row), ',', '"', '');
            };
            $write(['type', 'start_date', 'end_date', 'cycle_days', 'bleeding', 'cramps', 'mood', 'notes']);
            foreach ($periods as $p) {
                $write(['recorded_period', $p->start_date, $p->end_date ?? 'ongoing', '', '', '', '', '']);
            }
            foreach ($symptoms as $s) {
                $write(['recorded_symptoms', $s->date, '', '', $s->observations['bleeding'], $s->observations['cramps'], $s->observations['mood'], $s->observations['notes'] ?? '']);
            }
            foreach ($result['completed_cycles'] as $c) {
                $write(['derived_completed_cycle', $c['start_date'], $c['next_start'], $c['days'], '', '', '', '']);
            }
            if ($e = $result['estimate']) {
                $write(['estimated_period_start_range', $e['from'], $e['to'], '', '', '', '', $result['reason']]);
            }
            fclose($f);
        }, 'almanac-records.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }
}
