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
        DB::insert("INSERT INTO products (product_id, product_name, product_qty, product_price) VALUES (?, ?, ?, ?)", [
            $request->product_id,
            $request->product_name,
            $request->product_qty,
            $request->product_price
        ]);
        return response()->json(['message' => 'Product created']);
    }

    public function update(Request $request, $id)
    {
        DB::update("UPDATE products SET product_name = ?, product_qty = ?, product_price = ? WHERE product_id = ?", [
            $request->product_name,
            $request->product_qty,
            $request->product_price,
            $id
        ]);
        return response()->json(['message' => 'Product updated']);
    }

    public function destroy($id)
    {
        DB::delete("DELETE FROM products WHERE product_id = ?", [$id]);
        return response()->json(['message' => 'Product deleted']);
    }
}

