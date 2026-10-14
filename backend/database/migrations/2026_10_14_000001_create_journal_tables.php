<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('timezone')->default('Asia/Manila');
            $t->text('preferences')->nullable();
            $t->boolean('onboarded')->default(false);
        });
        Schema::create('period_entries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->text('start_date');
            $t->text('end_date')->nullable();
            $t->timestamps();
        });
        Schema::create('symptom_entries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->text('date');
            $t->text('observations');
            $t->timestamps();
        });
        Schema::create('articles', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->string('category');
            $t->text('summary');
            $t->json('paragraphs');
            $t->json('sources');
            $t->string('review_status')->default('Clinical review pending');
            $t->date('source_checked_at');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('symptom_entries');
        Schema::dropIfExists('period_entries');
        Schema::dropIfExists('articles');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['timezone', 'preferences', 'onboarded']));
    }
};
