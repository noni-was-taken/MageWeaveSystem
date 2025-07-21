<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Optional: check role for filtering hidden products
        $userRole = session('user_role'); // Adjust if using other session structure

        if ($userRole === 'Admin') {
            $products = DB::select("SELECT * FROM products");
        } else {
            $products = DB::select("SELECT * FROM products WHERE is_hidden = false");
        }

        return response()->json($products);
    }

    public function show($id)
    {
        $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product[0]);
    }

    public function store(Request $request)
    {
        DB::insert("INSERT INTO products (product_name, product_qty, product_price, is_hidden) VALUES (?, ?, ?, ?)", [
            $request->product_name,
            $request->product_qty,
            $request->product_price,
            false
        ]);

        return response()->json(['message' => 'Product created']);
    }

    public function update(Request $request, $id)
    {
        $threshold = 50;

        $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $existing = $product[0];
        $newQty = $request->product_qty;
        $lowSince = $existing->low_stock_since;

        if ($newQty < $threshold && !$lowSince) {
            // Set low_stock_since
            DB::update("UPDATE products SET product_name = ?, product_qty = ?, product_price = ?, low_stock_since = NOW() WHERE product_id = ?", [
                $request->product_name,
                $newQty,
                $request->product_price,
                $id
            ]);
        } else {
            // Just update values, keep low_stock_since as is
            DB::update("UPDATE products SET product_name = ?, product_qty = ?, product_price = ? WHERE product_id = ?", [
                $request->product_name,
                $newQty,
                $request->product_price,
                $id
            ]);
        }

        return response()->json(['message' => 'Product updated']);
    }

    public function destroy($id)
    {
        DB::delete("DELETE FROM products WHERE product_id = ?", [$id]);
        return response()->json(['message' => 'Product deleted']);
    }

    public function toggleVisibility($id)
    {
        $product = DB::select("SELECT is_hidden FROM products WHERE product_id = ?", [$id]);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $isHidden = $product[0]->is_hidden;
        $newState = !$isHidden;

        DB::update("UPDATE products SET is_hidden = ? WHERE product_id = ?", [
            $newState,
            $id
        ]);

        return response()->json(['message' => 'Product visibility updated', 'is_hidden' => $newState]);
    }
}
