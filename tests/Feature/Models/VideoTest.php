<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    private $category;
    private $genre;

    private $defaultData = [
        'title' => 'title test',
        'description' => 'description test',
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
            'name' => 'genre1'
        ]);
    }

    public function testList()
    {
        factory(Video::class, 1)->create();
        $video = Video::all();
        $key = array_keys($video->first()->getAttributes());
        $this->assertCount(1, Video::get());
        $this->assertEqualsCanonicalizing(
            [
                'id',
                'title',
                'description',
                'year_launched',
                'opened',
                'rating',
                'duration',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $key
        );

        $video = Video::with(['categories','genres'])->get();
        $key = array_keys($video->first()->getRelations());
        $this->assertEqualsCanonicalizing(
            [
                'categories',
                'genres'
            ],
            $key
        );
    }

    public function testCreate()
    {
        $video = Video::create($this->defaultData);
        $video->refresh();
        $this->assertRegExp('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $video->id);
        $this->assertEquals('title test', $video->title);
        $this->assertEquals('description test', $video->description);
        $this->assertEquals(2020, $video->year_launched);
        $this->assertEquals(false, $video->opened);
        $this->assertEquals(Video::RATING_LIST[0], $video->rating);
        $this->assertEquals(90, $video->duration);

        $video = Video::create($this->defaultData + ['opened' => false]);
        $this->assertFalse($video->opened);

        $video = Video::create($this->defaultData + ['opened' => true]);
        $this->assertTrue($video->opened);

        $video = Video::create($this->defaultData);
        $video->categories()->attach($this->category);
        $this->assertEqualsCanonicalizing([$this->category->id], $video->categories()->allRelatedIds()->toArray());

        $video = Video::create($this->defaultData);
        $video->genres()->attach($this->genre);
        $this->assertEqualsCanonicalizing([$this->genre->id], $video->genres()->allRelatedIds()->toArray());
    }

    public function testUpdate(){
        /** @var Video $video */
        $video = factory(Video::class)->create($this->defaultData + ['opened' => false])->first();
        $video->categories()->attach($this->category);
        $video->genres()->attach($this->genre);

        $data = [
            'title' => 'title update',
            'description' => 'description update',
            'year_launched' => 2021,
            'opened' => true,
            'rating' => Video::RATING_LIST[1],
            'duration' => 95
        ];
        $video->update($data);

        $category = Category::create([
            'name' => 'category 2'
        ]);
        $genre = Genre::create([
            'name' => 'genre2'
        ]);
        $video->categories()->sync([$category->id]);
        $video->genres()->sync([$this->genre->id, $genre->id]);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
        $this->assertEqualsCanonicalizing([$category->id], $video->categories()->allRelatedIds()->toArray());        
        $this->assertEqualsCanonicalizing([$this->genre->id, $genre->id], $video->genres()->allRelatedIds()->toArray());
    }

    public function testDelete(){
        /** @var Video $video */
        $video = factory(Video::class, 5)->create()->first();
        $video->categories()->attach($this->category);
        $video->genres()->attach($this->genre);
        $this->assertCount(5, Video::all());
        $video->delete();
        $this->assertCount(4, Video::all());
    }
}
