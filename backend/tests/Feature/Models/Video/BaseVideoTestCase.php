<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

abstract class BaseVideoTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $category;
    protected $genre;

    protected $defaultData = [
        'title' => 'title',
        'description' => 'description',
        'year_launched' => 2020,
        'rating' => Video::RATING_LIST[0],
        'duration' => 90
    ];

    protected function setUp(): void 
    {
        parent::setUp();
        $this->category = Category::create([
            'name' => 'category 1'
        ]);
        $this->genre = Genre::create([
            'name' => 'genre 1'
        ]);
    }
}