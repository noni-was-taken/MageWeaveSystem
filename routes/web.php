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

Route::get('/logout', function () {
    Session::flush(); // clear all session data
    return redirect('/logins')->with('success', 'Logged out successfully');
});

Route::middleware(['auth.session'])->group(function () {
        Route::put('/products/{id}', function ($id, Request $request) {
        $request->validate([
            'product_name' => 'required|string|max:100',
            'product_qty' => 'required|integer|min:0',
            'product_price' => 'required|numeric|min:0',
            'old_qty' => 'required|integer', // for computing difference
        ]);

        // 1. Update product
        DB::update("UPDATE products SET product_name = ?, product_qty = ?, product_price = ? WHERE product_id = ?", [
            $request->product_name,
            $request->product_qty,
            $request->product_price,
            $id
        ]);

        // 2. Compute quantity difference
        $diff = $request->product_qty - $request->old_qty;

        // 3. Insert update log
        DB::insert("INSERT INTO updateinfo (value_update, product_id, description) VALUES (?, ?, ?)", [
            $diff,
            $id,
            'Manual update'
        ]);

        return response()->json(['message' => 'Product updated successfully']);
    });

    Route::get('/dashboard', function () {
        //dd(Session::get('user_id')); 
        $products = DB::select('SELECT * FROM products');
        $logs = DB::select("SELECT * FROM updateinfo ORDER BY update_id DESC");
        return Inertia::render('dashboard', [
            'products' => $products,
            'updateLogs' => $logs,
            'user' => [
                'name' => Session::get('user_name'),
                'role' => Session::get('user_role'),
            ],       
        ]);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
