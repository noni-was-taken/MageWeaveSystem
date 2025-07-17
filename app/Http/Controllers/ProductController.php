<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = DB::select("SELECT * FROM products");
        return response()->json($products);
    }

    public function show($id)
    {
        $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        DB::insert("INSERT INTO products (product_name, product_qty, product_price) VALUES (?, ?, ?)", [
            $request->product_name,
            $request->product_qty,
            $request->product_price
        ]);

        return response()->json(['message' => 'Product created']);
    }

    public function update(Request $request, $id)
{
    $threshold = 50; // Set your low stock threshold
    $newQty = $request->product_qty;

    // Fetch current low_stock_since
    $product = DB::select("SELECT * FROM products WHERE product_id = ?", [$id]);
    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    $currentLowSince = $product[0]->low_stock_since;

    // Determine if we should set low_stock_since
    if ($newQty < $threshold && !$currentLowSince) {
        // Product just went low
        DB::update("UPDATE products SET product_name = ?, product_qty = ?, product_price = ?, low_stock_since = NOW() WHERE product_id = ?", [
            $request->product_name,
            $newQty,
            $request->product_price,
            $id
        ]);
    } else {
        // Update product without changing low_stock_since
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
}

