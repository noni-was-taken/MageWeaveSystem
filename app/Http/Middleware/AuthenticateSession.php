<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;

class AuthenticateSession
{
    public function handle(Request $request, Closure $next)
    {
        
        if (!Session::has('user_id')) {
            return redirect('/logins');
        }

        return $next($request);
    }
}
