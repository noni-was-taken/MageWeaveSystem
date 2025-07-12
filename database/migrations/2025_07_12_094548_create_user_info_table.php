<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('userInfo', function (Blueprint $table) {
            $table->id('user_id'); // Primary key (auto-increment)
            $table->string('user_name', 100);
            $table->string('password');
            $table->string('user_role', 50);
            $table->timestamps(); // created_at and updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('userInfo');
    }
};
