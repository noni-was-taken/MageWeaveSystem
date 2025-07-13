<?php
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;


// Show the login page (Inertia/React)
Route::get('/', fn() => Inertia::render('login'));
Route::get('/login', fn() => Inertia::render('login'));

// Handle login POST from React/Inertia
Route::post('/custom-login', [AuthController::class, 'login']);

Route::post('/logout', function () {
    Session::flush(); // Clear all session data
    return Inertia::location('/login');
})->name('logout');

Route::middleware(['auth.session'])->group(function () {
        Route::post('/products', [ProductController::class, 'store'])->name('products');

        Route::post('/products/{id}/restock', function (Illuminate\Http\Request $request, $id) {
        $qty = (int) $request->input('quantity');

        if ($qty <= 0) {
            return response()->json(['message' => 'Invalid quantity'], 400);
        }

        $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $currentQty = $product[0]->product_qty;
        $newQty = $currentQty + $qty;

        // Update product
        DB::update("UPDATE products SET product_qty = ? WHERE product_id = ?", [$newQty, $id]);

        // Insert into updateinfo
        DB::insert("INSERT INTO updateinfo (value_update, product_id, description) VALUES (?, ?, ?)", [
            $qty, // Positive = restock
            $id,
            'Restocked'
        ]);

        return response()->json(['message' => 'Restock recorded']);
    });

        Route::post('/products/{id}/sale', function (Illuminate\Http\Request $request, $id) {
        $qty = (int) $request->input('quantity');
        $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $currentQty = $product[0]->product_qty;

        if ($qty > $currentQty) {
            return response()->json(['message' => 'Not enough stock'], 400);
        }

        $newQty = $currentQty - $qty;

        // 1. Update product
        DB::update("UPDATE products SET product_qty = ? WHERE product_id = ?", [$newQty, $id]);

        // 2. Insert log
        DB::insert("INSERT INTO updateinfo (value_update, product_id, description) VALUES (?, ?, ?)", [
            -$qty, // Negative value = sale
            $id,
            'Sale'
        ]);

        return response()->json(['message' => 'Sale recorded']);
    });

        Route::delete('/products/{id}', function ($id) {
        DB::delete("DELETE FROM products WHERE product_id = ?", [$id]);
        //DB::delete("DELETE FROM updateinfo WHERE product_id = ?", [$id]); // optional: delete logs
        return response()->json(['message' => 'Product deleted']);
    });

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

Route::fallback(function () {
    if (!Session::has('user_id')) {
        return Inertia::location('/login');
    }
});

require __DIR__.'/settings.php';
