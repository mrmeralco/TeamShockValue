<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::get('/login', fn () => view('auth.login'))->name('login');
Route::get('/signup', fn () => view('auth.signup'))->name('signup');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/signup', [AuthController::class, 'signup'])->name('signup.submit');
Route::get('/dashboard', fn () => view('dashboard'))->middleware('auth')->name('dashboard');

Route::prefix('api')->group(function () {
    Route::get('/session', [AuthController::class, 'session']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::put('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
