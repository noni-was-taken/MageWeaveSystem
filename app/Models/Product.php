<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'product_id';
    public $timestamps = true;

    protected $fillable = [
        'product_name',
        'product_qty',
        'product_price',
        'low_stock_since',
    ];

    protected $casts = [
        'low_stock_since' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}