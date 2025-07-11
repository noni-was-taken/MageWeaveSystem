<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;


// Show the login page (Inertia/React)
Route::get('/', fn() => Inertia::render('logins'));
Route::get('/logins', fn() => Inertia::render('logins'));

// Handle login POST from React/Inertia
Route::post('/custom-login', [AuthController::class, 'login']);

// (Optional) Test page
Route::get('/test', fn() => Inertia::render('Test'));

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
