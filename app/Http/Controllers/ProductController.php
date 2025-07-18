<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Product;     
use Illuminate\Support\Carbon;  

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        Product::create([
            'product_name' => $request->product_name,
            'product_qty' => $request->product_qty,
            'product_price' => $request->product_price,
        ]);

        return response()->json(['message' => 'Product created']);
    }

    public function update(Request $request, $id)
{
        $threshold = 50;
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->product_name = $request->product_name;
        $product->product_qty = $request->product_qty;
        $product->product_price = $request->product_price;

        if ($product->product_qty < $threshold && !$product->low_stock_since) {
            $product->low_stock_since = Carbon::now();
        }

        $product->save();

        return response()->json(['message' => 'Product updated']);
    }


    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}

