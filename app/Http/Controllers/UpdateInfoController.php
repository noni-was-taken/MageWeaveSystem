<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UpdateInfoController extends Controller
{
    
    public function index()
    {
        $logs = DB::select("SELECT * FROM updateinfo ORDER BY update_id DESC");
        return response()->json($logs);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'value_update' => 'required|integer',
            'product_id' => 'required|integer',
            'description' => 'nullable|string|max:100'
        ]);

        DB::insert(
            "INSERT INTO updateinfo (value_update, product_id, user_id, description) VALUES (?, ?, ?, ?)",
            [
                $request->value_update,
                $request->product_id,
                session('user_id'), // 👈 this gets the currently logged-in user
                $request->description
            ]
        );

        return response()->json(['message' => 'Update log created successfully'], 201);
    }

    
    public function show($id)
    {
        $log = DB::select("SELECT * FROM updateinfo WHERE update_id = ?", [$id]);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        return response()->json($log[0]);
    }

    // DELETE a log by ID
    public function destroy($id)
    {
        DB::delete("DELETE FROM updateinfo WHERE update_id = ?", [$id]);
        return response()->json(['message' => 'Update log deleted successfully']);
    }
}