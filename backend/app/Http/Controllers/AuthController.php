<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $r->merge(['email' => strtolower((string) $r->input('email'))]);
        $data = $r->validate(['name' => 'required|string|max:80', 'email' => 'required|email|max:254|unique:users,email', 'password' => ['required', 'confirmed', 'max:1024', PasswordRule::min(12)], 'timezone' => 'required|timezone']);
        $data['email'] = strtolower($data['email']);
        $user = User::create($data);
        Auth::guard('web')->login($user);
        $r->session()->regenerate();

        return response()->json($user, 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate(['email' => 'required|email|max:254', 'password' => 'required|string|max:1024']);
        $d['email'] = strtolower($d['email']);
        if (! Auth::guard('web')->attempt($d)) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }
        $r->session()->regenerate();

        return response()->json(Auth::guard('web')->user());
    }

    public function logout(Request $r)
    {
        Auth::guard('web')->logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return response()->noContent();
    }

    public function forgot(Request $r)
    {
        $d = $r->validate(['email' => 'required|email|max:254']);
        $d['email'] = strtolower($d['email']);
        $status = Password::sendResetLink($d);
        if (! in_array($status, [Password::ResetLinkSent, Password::InvalidUser])) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return ['message' => 'If an account matches that email, a recovery link has been sent.'];
    }

    public function reset(Request $r)
    {
        $d = $r->validate(['token' => 'required|string|max:512', 'email' => 'required|email|max:254', 'password' => ['required', 'confirmed', 'max:1024', PasswordRule::min(12)]]);
        $status = Password::reset($d, function (User $u, string $p) {
            $u->forceFill(['password' => Hash::make($p), 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $u->id)->delete();
        });
        if ($status !== Password::PasswordReset) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }
        $this->logout($r);

        return ['message' => 'Password updated. Sign in with your new password.'];
    }

    public function settings(Request $r)
    {
        $d = $r->validate(['name' => 'required|string|max:80', 'timezone' => 'required|timezone', 'onboarded' => 'required|boolean', 'preferences' => 'required|array:goal,remind_logging,remind_period', 'preferences.goal' => 'required|in:monitoring,awareness', 'preferences.remind_logging' => 'required|boolean', 'preferences.remind_period' => 'required|boolean']);
        $r->user()->update($d);

        return $r->user()->fresh();
    }

    public function delete(Request $r)
    {
        $r->validate(['password' => 'required|current_password:web']);
        $u = $r->user();
        // Logout before deleting: logout rotates remember_token and must not save a deleted user.
        $this->logout($r);
        DB::transaction(function () use ($u) {
            DB::table('sessions')->where('user_id', $u->id)->delete();
            DB::table('password_reset_tokens')->where('email', $u->email)->delete();
            $u->delete();
        });

        return response()->noContent();
    }
}
