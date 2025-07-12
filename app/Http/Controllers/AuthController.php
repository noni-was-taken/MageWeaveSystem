<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        // Validate inputs
        $request->validate([
            'user_id' => 'required',
            'password' => 'required',
        ]);

        // Get user from userInfo table
        $user = DB::select("SELECT * FROM userInfo WHERE user_id = ?", [$request->user_id]);

        if (!$user) {
            return back()->withErrors(['user_id' => 'User ID not found']);
        }

        $user = $user[0]; // Because DB::select returns an array

        // Check password
        if (Hash::check($request->password, $user->password)) {
            Session::put('user_id', $user->user_id);
            return redirect('/dashboard')->with('success', 'Login successful');
        } else {
            return redirect()->back()->withErrors(['password' => 'Incorrect password']);
        }
    }
}