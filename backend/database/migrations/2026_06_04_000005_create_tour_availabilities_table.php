<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Jadwal ketersediaan paket wisata: hari-hari dalam seminggu di mana tour tersedia.
// day_of_week mengikuti konvensi PHP/Carbon: 0 = Minggu, 1 = Senin, ..., 6 = Sabtu.
// Catatan: DayPhase yang sudah ada adalah waktu-hari (Morning/Afternoon/Evening/Night),
// bukan hari dalam seminggu — tabel ini berbeda dan melengkapinya.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            // 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
            $table->tinyInteger('day_of_week')->unsigned();
            $table->timestamps();

            $table->unique(['tour_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_availabilities');
    }
};
