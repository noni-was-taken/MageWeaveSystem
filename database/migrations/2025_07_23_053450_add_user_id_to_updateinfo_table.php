<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('updateinfo', function (Illuminate\Database\Schema\Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('updateinfo', function (Illuminate\Database\Schema\Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }
};
