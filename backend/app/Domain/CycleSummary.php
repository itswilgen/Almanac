<?php

namespace App\Domain;

use Carbon\CarbonImmutable as Date;

class CycleSummary
{
    public function calculate(array $periods, string $today): array
    {
        usort($periods, fn ($a, $b) => strcmp($a['start_date'], $b['start_date']));
        $cycles = [];
        for ($i = 1; $i < count($periods); $i++) {
            $cycles[] = ['start_date' => $periods[$i - 1]['start_date'], 'next_start' => $periods[$i]['start_date'], 'days' => (int) Date::parse($periods[$i - 1]['start_date'], 'UTC')->diffInDays(Date::parse($periods[$i]['start_date'], 'UTC'))];
        }
        $recent = array_slice(array_column($cycles, 'days'), -6);
        $result = ['completed_cycles' => $cycles, 'history_count' => count($recent), 'estimate' => null, 'reason' => 'Log at least four period starts to build three completed cycles.', 'cycle_day' => null];
        if (! $periods) {
            return $result;
        }
        $last = end($periods);
        $result['cycle_day'] = (int) Date::parse($last['start_date'], 'UTC')->diffInDays(Date::parse($today, 'UTC')) + 1;
        if (count($recent) < 3) {
            return $result;
        }
        // Conservative product heuristic, not a validated medical or contraceptive method.
        if (min($recent) < 21 || max($recent) > 35 || max($recent) - min($recent) > 7) {
            $result['reason'] = 'Your recorded cycles vary. A useful period range is unavailable; keep recording and discuss changes with a healthcare professional.';

            return $result;
        }
        $start = Date::parse($last['start_date'], 'UTC');
        $from = $start->addDays(min($recent) - 2)->toDateString();
        $to = $start->addDays(max($recent) + 2)->toDateString();
        if ($today > $to) {
            $result['reason'] = 'The previous estimated range has passed. Check for missing entries; calendar dates cannot explain a late period.';

            return $result;
        }
        $result['estimate'] = ['from' => $from, 'to' => $to, 'kind' => 'estimated_period_start', 'method_version' => 'period-range-v1'];
        $result['reason'] = 'Based on your last '.count($recent).' completed cycles: shortest to longest cycle, with two days added on either side. Your next period may fall outside this range. This is not a fertility estimate.';

        return $result;
    }
}
