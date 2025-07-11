<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UpdateInfoController;

// Product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);

// Update info routes
Route::get('/update-logs', [UpdateInfoController::class, 'index']);
Route::post('/update-logs', [UpdateInfoController::class, 'store']);
Route::get('/update-logs/{id}', [UpdateInfoController::class, 'show']);
Route::delete('/update-logs/{id}', [UpdateInfoController::class, 'destroy']);

