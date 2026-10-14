<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class JournalTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::factory()->create(['timezone' => 'Asia/Manila']);
    }

    public function test_registration_login_failure_and_logout(): void
    {
        $data = ['name' => 'Test Reader', 'email' => 'reader@example.test', 'password' => 'private journal phrase', 'password_confirmation' => 'private journal phrase', 'timezone' => 'Asia/Manila'];
        $this->postJson('/api/register', $data)->assertCreated()->assertJsonPath('name', 'Test Reader');
        $this->getJson('/api/user')->assertOk();
        $this->postJson('/api/logout')->assertNoContent();
        app('auth')->forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
        $this->postJson('/api/login', ['email' => $data['email'], 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/login', ['email' => $data['email'], 'password' => $data['password']])->assertOk();
        $this->postJson('/api/register', $data)->assertUnprocessable();
    }

    public function test_period_validation_and_encrypted_storage(): void
    {
        $u = $this->user();
        $this->actingAs($u);
        foreach ([['2024-02-30', null], ['2099-01-01', null], ['2024-03-01', '2024-02-28']] as [$s,$e]) {
            $this->postJson('/api/periods', ['start_date' => $s, 'end_date' => $e])->assertUnprocessable();
        }
        $id = $this->postJson('/api/periods', ['start_date' => '2024-02-28', 'end_date' => '2024-03-02'])->assertCreated()->json('id');
        $this->assertNotSame('2024-02-28', DB::table('period_entries')->where('id', $id)->value('start_date'));
        $this->postJson('/api/periods', ['start_date' => '2024-03-02', 'end_date' => '2024-03-05'])->assertUnprocessable();
        $this->putJson('/api/periods/'.$id, ['start_date' => '2024-02-28', 'end_date' => '2024-03-01'])->assertOk();
        $this->postJson('/api/periods', ['start_date' => '2024-03-28', 'end_date' => null])->assertCreated();
        $this->postJson('/api/periods', ['start_date' => '2024-04-28', 'end_date' => null])->assertUnprocessable();
        $this->getJson('/api/journal')->assertJsonPath('summary.completed_cycles.0.days', 29)->assertJsonPath('fertility.available', false);
    }

    public function test_ownership_on_every_record_and_private_export(): void
    {
        $a = $this->user();
        $b = $this->user();
        $p = $a->periods()->create(['start_date' => '2024-01-01', 'end_date' => '2024-01-04']);
        $s = $a->symptoms()->create(['date' => '2024-01-01', 'observations' => ['bleeding' => 'light', 'cramps' => 'mild', 'mood' => 'calm', 'notes' => 'private-owner-note']]);
        $this->actingAs($b)->getJson('/api/journal')->assertJsonCount(0, 'periods')->assertJsonCount(0, 'symptoms');
        $this->putJson('/api/periods/'.$p->id, ['start_date' => '2024-01-01', 'end_date' => null])->assertNotFound();
        $this->deleteJson('/api/periods/'.$p->id)->assertNotFound();
        $this->putJson('/api/symptoms/'.$s->id, ['date' => '2024-01-01', 'bleeding' => 'none', 'cramps' => 'none', 'mood' => 'calm'])->assertNotFound();
        $this->deleteJson('/api/symptoms/'.$s->id)->assertNotFound();
        $export = $this->get('/api/export')->assertOk()->assertHeader('cache-control', 'no-store, private')->streamedContent();
        $this->assertStringNotContainsString('private-owner-note', $export);
        $this->assertNotSame('private-owner-note', DB::table('symptom_entries')->where('id', $s->id)->value('observations'));
    }

    public function test_symptoms_crud_and_csv_formula_escape(): void
    {
        $this->actingAs($this->user());
        $d = ['date' => '2024-01-01', 'bleeding' => 'moderate', 'cramps' => 'mild', 'mood' => 'low', 'notes' => '=SUM(1,2)'];
        $id = $this->postJson('/api/symptoms', $d)->assertCreated()->json('id');
        $this->postJson('/api/symptoms', $d)->assertUnprocessable();
        $text = $this->get('/api/export')->streamedContent();
        $this->assertStringContainsString("'=SUM", $text);
        $this->assertStringContainsString('recorded_symptoms', $text);
        $this->putJson('/api/symptoms/'.$id, array_merge($d, ['notes' => 'changed']))->assertOk();
        $this->deleteJson('/api/symptoms/'.$id)->assertNoContent();
        $this->getJson('/api/journal')->assertJsonCount(0, 'symptoms');
    }

    public function test_account_deletion_requires_password_and_cascades(): void
    {
        $u = $this->user();
        $u->password = 'private journal phrase';
        $u->save();
        $u->periods()->create(['start_date' => '2024-01-01']);
        $u->symptoms()->create(['date' => '2024-01-01', 'observations' => []]);
        $this->actingAs($u)->deleteJson('/api/account', ['password' => 'wrong'])->assertUnprocessable();
        $this->assertDatabaseCount('users', 1);
        $this->deleteJson('/api/account', ['password' => 'private journal phrase'])->assertNoContent();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('period_entries', 0);
        $this->assertDatabaseCount('symptom_entries', 0);
    }

    public function test_recovery_is_private_and_reset_tokens_are_single_use(): void
    {
        Notification::fake();
        $u = $this->user();
        $this->postJson('/api/forgot-password', ['email' => $u->email])->assertOk();
        Notification::assertSentTo($u, ResetPassword::class);
        $token = Password::createToken($u);
        $data = ['email' => $u->email, 'token' => $token, 'password' => 'new private passphrase', 'password_confirmation' => 'new private passphrase'];
        $this->postJson('/api/reset-password', $data)->assertOk();
        $this->assertTrue(Hash::check($data['password'], $u->fresh()->password));
        $this->postJson('/api/reset-password', $data)->assertUnprocessable();
        $this->postJson('/api/forgot-password', ['email' => 'missing@example.test'])->assertOk()->assertJsonPath('message', 'If an account matches that email, a recovery link has been sent.');
    }

    public function test_settings_and_unauthenticated_access(): void
    {
        $this->getJson('/api/journal')->assertUnauthorized();
        $this->getJson('/api/export')->assertUnauthorized();
        $u = $this->user();
        $this->actingAs($u)->putJson('/api/settings', ['name' => 'Updated', 'timezone' => 'UTC', 'onboarded' => true, 'preferences' => ['goal' => 'awareness', 'remind_logging' => true, 'remind_period' => false]])->assertOk()->assertJsonPath('onboarded', true);
        $this->assertStringNotContainsString('awareness', DB::table('users')->where('id', $u->id)->value('preferences'));
    }

    public function test_articles_and_csrf_bootstrap_are_public(): void
    {
        $this->seed();
        $this->getJson('/api/articles')->assertOk()->assertJsonCount(4);
        $this->getJson('/api/csrf')->assertOk()->assertJsonStructure(['token']);
    }
}
