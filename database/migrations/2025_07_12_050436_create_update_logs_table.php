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
        Schema::create('updateinfo', function (Blueprint $table) {
        $table->id('update_id');
        $table->integer('value_update');
        $table->unsignedBigInteger('product_id');
        $table->string('description');
        $table->timestamp('update_date')->useCurrent();
        $table->timestamps();

        // Optional: foreign key constraint if you want
        //$table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('update_logs');
    }
};
