<?php

namespace Tests\Unit;

use App\Domain\CycleSummary;
use App\Domain\FertilityPolicy;
use PHPUnit\Framework\TestCase;

class CycleSummaryTest extends TestCase
{
    private function calculate(array $starts, string $today = '2024-04-01'): array
    {
        return (new CycleSummary)->calculate(array_map(fn ($s) => ['start_date' => $s, 'end_date' => null], $starts), $today);
    }

    public function test_empty_and_partial_records_never_create_a_default_prediction(): void
    {
        foreach ([[], ['2024-01-01'], ['2024-01-01', '2024-01-29', '2024-02-26']] as $s) {
            $this->assertNull($this->calculate($s)['estimate']);
        }
    }

    public function test_leap_year_and_month_boundaries(): void
    {
        $r = $this->calculate(['2024-03-28', '2024-01-01', '2024-02-01', '2024-02-29'], '2024-04-01');
        $this->assertSame([31, 28, 28], array_column($r['completed_cycles'], 'days'));
        $this->assertSame('2024-04-23', $r['estimate']['from']);
        $this->assertSame('2024-04-30', $r['estimate']['to']);
        $this->assertSame(5, $r['cycle_day']);
    }

    public function test_last_ongoing_cycle_is_not_completed(): void
    {
        $r = $this->calculate(['2024-01-01', '2024-01-29']);
        $this->assertCount(1, $r['completed_cycles']);
    }

    public function test_irregular_history_and_expired_ranges_are_withheld(): void
    {
        $this->assertNull($this->calculate(['2024-01-01', '2024-01-29', '2024-03-20', '2024-04-01'])['estimate']);
        $this->assertNull($this->calculate(['2024-01-01', '2024-01-29', '2024-02-26', '2024-03-25'], '2024-05-01')['estimate']);
    }

    public function test_edit_and_delete_recompute_estimates(): void
    {
        $before = $this->calculate(['2024-01-01', '2024-01-29', '2024-02-26', '2024-03-25']);
        $after = $this->calculate(['2024-01-01', '2024-01-29', '2024-02-26', '2024-03-26']);
        $this->assertNotEquals($before['estimate'], $after['estimate']);
        $this->assertNull($this->calculate(['2024-01-01', '2024-01-29', '2024-02-26'])['estimate']);
    }

    public function test_fertility_fails_closed_for_every_circumstance(): void
    {
        foreach (['insufficient_history', 'missing_records', 'contradictory_records', 'irregular_cycles', 'absent_periods', 'postpartum', 'breastfeeding', 'hormonal_contraception', 'apparently_regular', 'admin_enabled'] as $case) {
            $r = (new FertilityPolicy)->evaluate([], [$case => true]);
            $this->assertFalse($r['available']);
            $this->assertNull($r['classification']);
            $this->assertSame('unreviewed-v1', $r['policy_version']);
        }
    }
}
