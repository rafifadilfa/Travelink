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
        Schema::table('guides', function (Blueprint $table) {
            // Path file KTP — nullable karena belum diwajibkan saat register
            $table->string('ktp_document')->nullable()->after('verification_status');
            // Path file sertifikat pemandu wisata
            $table->string('certificate_document')->nullable()->after('ktp_document');
        });
    }

    public function down(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            $table->dropColumn(['ktp_document', 'certificate_document']);
        });
    }
};
