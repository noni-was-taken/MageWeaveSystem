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

Route::middleware(['auth.session'])->group(function () {
    Route::get('/dashboard', function () {
        //dd(Session::get('user_id')); 
        $products = DB::select('SELECT * FROM products');
        $logs = DB::select("SELECT * FROM updateinfo ORDER BY update_id DESC");
        return Inertia::render('dashboard', [
            'products' => $products,
            'updateLogs' => $logs,
        ]);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
