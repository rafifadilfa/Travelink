<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tambahkan kolom 'type' ke tours untuk membedakan Tur Reguler vs Open Trip.
// Hanya 'regular' yang diimplementasi saat ini; 'open_trip' disiapkan tempatnya
// untuk dikerjakan oleh anggota tim lain.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->string('type', 20)->default('regular')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
