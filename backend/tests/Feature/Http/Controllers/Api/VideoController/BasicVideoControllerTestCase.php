<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\CastMember;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

abstract class BasicVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    protected $video;
    protected $sendData;
    protected $category;
    protected $genre;
    protected $serializedFields = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'cast_members' => [
            '*' => [
                'id',
                'name',
                'type',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    protected function setUp(): void 
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false,
            'video_file' => 'video.mp4',
            'thumb_file' => 'thumb.jpg',
            'banner_file' => 'banner.jpg',
            'trailer_file' => 'trailer.mp4'
        ]);

        $this->category = factory(Category::class)->create();
        $this->genre = factory(Genre::class)->create();
        $this->genre->categories()->sync($this->category->id);
        $this->castMember = factory(CastMember::class)->create();

        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
            'categories_id' => [$this->category->id],
            'genres_id' => [$this->genre->id],
            'cast_members_id' => [$this->castMember->id]
        ];
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

    protected function assertIfFilesUrlExists(Video $video, TestResponse $response) 
    {
        $fileFields = Video::$fileFields;
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach($fileFields as $field) {
            $file = $video->{$field};
            $this->assertEquals(
                $file ? \Storage::url($video->relativeFilePath($file)) : null,
                $data[$field . '_url']
            );
        }
    }
}
