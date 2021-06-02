<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

abstract class BasicVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    protected $video;
    protected $sendData = [
        'title' => 'title',
        'description' => 'description',
        'year_launched' => 2010,
        'rating' => Video::RATING_LIST[0],
        'duration' => 90,
    ];

    protected function setUp(): void 
    {
        parent::setUp();
        $this->video = factory(Video::class)->create(['opened' => false]);
    }

    protected function routeStore() {
        return route('videos.store');
    }

    protected function routeUpdate() {
        return route('videos.update', ['video' => $this->video->id]);
    }

    protected function model() {
        return Video::class;
    }
}
