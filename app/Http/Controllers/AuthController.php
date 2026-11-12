<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function payload(?User $user): ?array
    {
        return $user ? ['userId' => $user->user_id, 'username' => $user->name, 'email' => $user->email] : null;
    }

    public function session(): JsonResponse
    {
        return response()->json(['authenticated' => Auth::check(), 'user' => $this->payload(Auth::user())]);
    }

    public function signup(Request $request): JsonResponse|RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'unique:users,email'], 'password' => ['required', 'min:6']]);
        $user = User::create(['name' => explode('@', strtolower($data['email']))[0], 'email' => strtolower($data['email']), 'user_id' => '#' . random_int(100000000, 999999999), 'password' => Hash::make($data['password'])]);
        Auth::login($user);
        $request->session()->regenerate();
        if (!$request->expectsJson()) return redirect()->route('dashboard');
        return response()->json(['ok' => true, 'user' => $this->payload($user)]);
    }

    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required']]);
        if (!Auth::attempt(['email' => strtolower($data['email']), 'password' => $data['password']])) {
            throw ValidationException::withMessages(['email' => ['Incorrect email or password.']]);
        }
        $request->session()->regenerate();
        if (!$request->expectsJson()) return redirect()->route('dashboard');
        return response()->json(['ok' => true, 'user' => $this->payload(Auth::user())]);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);
        $data = $request->validate(['username' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'unique:users,email,' . $user->id]]);
        $user->name = $data['username'];
        $user->email = strtolower($data['email']);
        $user->save();
        return response()->json(['ok' => true, 'user' => $this->payload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['ok' => true]);
    }
}
