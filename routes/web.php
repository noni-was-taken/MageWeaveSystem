<?php
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

// Show the login page (Inertia/React)
Route::get('/', fn() => Inertia::render('logins'));
Route::get('/login', fn() => Inertia::render('logins'));

// Handle login POST from React/Inertia
Route::post('/custom-login', [AuthController::class, 'login']);

Route::get('/logout', function () {
    Session::flush(); // clear all session data
    return redirect('/login')->with('success', 'Logged out successfully');
});

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

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $weeklyLogs = DB::select("
            SELECT 
                p.product_name,
                ui.product_id,
                ui.value_update,
                p.product_price,
                ui.description,
                ui.update_date
            FROM updateinfo ui
            JOIN products p ON ui.product_id = p.product_id
            WHERE ui.update_date BETWEEN ? AND ?
        ", [$startOfWeek, $endOfWeek]);

        $salesMap = [];
        $totalOrderedQty = 0;
        $totalSalesRevenue = 0;

        foreach ($weeklyLogs as $log) {
            $pid = $log->product_id;
            $value = (int) $log->value_update;
            $name = $log->product_name;
            $price = (float) $log->product_price;

            if (!isset($salesMap[$pid])) {
                $salesMap[$pid] = [
                    'product_id' => $pid,
                    'product_name' => $name,
                    'total_sold_qty' => 0,
                    'total_sales' => 0,
                ];
            }

            if ($value < 0) {
                $salesMap[$pid]['total_sold_qty'] += abs($value);
                $salesMap[$pid]['total_sales'] += abs($value) * $price;
                $totalOrderedQty += abs($value);
                $totalSalesRevenue += abs($value) * $price;
            }
        }

        $topSales = collect($salesMap)->sortByDesc('total_sales')->take(3)->values()->all();
        $leastSold = collect($salesMap)->sortBy('total_sold_qty')->take(3)->values()->all();

        return Inertia::render('dashboard', [
            'products' => $products,
            'updateLogs' => $logs,
            'user' => [
                'name' => Session::get('user_name'),
                'role' => Session::get('user_role'),
            ],
            'summaryData' => [
                'weekRange' => 'Week of ' . $startOfWeek->format('F j') . ' - ' . $endOfWeek->format('F j'),
                'date' => 'as of ' . now()->format('F j, Y'),
                'topSales' => $topSales,
                'leastSold' => $leastSold,
                'totalOrders' => [
                    'totalStocksOrdered' => $totalOrderedQty,
                    'totalSalesRevenue' => $totalSalesRevenue,
                ]
            ]
        ]);
    });
});

require __DIR__.'/settings.php';
//require __DIR__.'/auth.php';
