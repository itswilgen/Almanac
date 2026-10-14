<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (json_decode(file_get_contents(database_path('seeders/articles.json')), true) as $article) {
            Article::updateOrCreate(['slug' => $article['slug']], $article + ['source_checked_at' => '2026-10-14', 'review_status' => 'Clinical review pending']);
        }
    }
}
