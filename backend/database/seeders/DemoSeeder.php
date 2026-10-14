<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\CarbonImmutable as Date;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            throw new \RuntimeException('Synthetic demo seeding is local-only.');
        }
        $password = bin2hex(random_bytes(10));
        $u = User::firstOrCreate(['email' => 'demo@almanac.test'], ['name' => 'Demo journal (synthetic)', 'password' => $password, 'onboarded' => true, 'preferences' => ['goal' => 'monitoring', 'remind_logging' => false, 'remind_period' => false]]);
        if (! $u->wasRecentlyCreated) {
            $this->command->info('Demo already exists; no records changed.');

            return;
        }
        foreach ([99, 70, 41, 12] as $days) {
            $start = Date::now('Asia/Manila')->subDays($days);
            $u->periods()->create(['start_date' => $start->toDateString(), 'end_date' => $start->addDays(4)->toDateString()]);
        }
        $this->command->info('Synthetic demo only: demo@almanac.test / '.$password);
    }
}
