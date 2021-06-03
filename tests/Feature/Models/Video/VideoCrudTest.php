<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;

class VideoCrudTest extends BaseVideoTestCase
{
    
    private $fileFieldsData = [];

    protected function setUp(): void 
    {
        parent::setUp();
        foreach(Video::$fileFields as $field) {
            $this->fileFieldsData[$field] = "$field.test";
        }
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
                'video_file',
                'thumb_file',
                'banner_file',
                'trailer_file',
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

    public function testCreateWithBasicFields()
    {
        $video = Video::create($this->defaultData + $this->fileFieldsData);
        $video->refresh();

        $this->assertRegExp('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $video->id);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->defaultData + $this->fileFieldsData + ['opened' => false]);
        
        $video = Video::create($this->defaultData + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->defaultData + ['opened' => true]);
    }

    public function testCreateWithRelations()
    {
        $video = Video::create($this->defaultData + [
            'categories_id' => [$this->category->id],
            'genres_id' => [$this->genre->id]
        ]);

        $this->assertHasCategory($video->id, $this->category->id);
        $this->assertHasGenre($video->id, $this->genre->id);
    }

    public function testRollbackCreate() 
    {
        $hasError = false;
        try {
            $video = Video::create($this->defaultData + ['categories_id' => [1,2,3]]);
        }
        catch(QueryException $exception) {
            $this->assertCount(0, Video::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testUpdateWithBasicFields(){
        /** @var Video $video */
        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->defaultData + $this->fileFieldsData);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->defaultData + $this->fileFieldsData + ['opened' => false]);

        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->defaultData + $this->fileFieldsData + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->defaultData + $this->fileFieldsData + ['opened' => true]);
    }

    public function testUpdateWithRelations(){
        /** @var Video $video */
        $video = factory(Video::class)->create();
        $video->update($this->defaultData + [
            'categories_id' => $this->category->id, 
            'genres_id' => $this->genre->id 
        ]);

        $this->assertHasCategory($video->id, $this->category->id);
        $this->assertHasGenre($video->id, $this->genre->id);
    }

    public function testRollbackUpdate() 
    {
        $video = factory(Video::class)->create($this->defaultData);
        $oldTitle = $video->title;
        $hasError = false;
        try {
            $video = Video::create($this->defaultData + ['categories_id' => [1,2,3]]);
        }
        catch(QueryException $exception) {
            $this->assertDatabaseHas('videos', ['title' => $oldTitle]);
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testHandleRelations() 
    {
        $video = factory(Video::class)->create();
        Video::handleRelations($video, []);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);

        Video::handleRelations($video, [
            'categories_id' => [$this->category->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);

        Video::handleRelations($video, [
            'genres_id' => [$this->genre->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->genres);

        $video->categories()->delete();
        $video->genres()->delete();

        Video::handleRelations($video, [
            'categories_id' => [$this->category->id],
            'genres_id' => [$this->genre->id]
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genres);
    }

    public function testSyncCategories() {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[0]]
        ]);
        $this->assertDatabaseHas('category_video',[
            'category_id' => $categoriesId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);
        $this->assertDatabaseMissing('category_video',[
            'category_id' => $categoriesId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video',[
            'category_id' => $categoriesId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('category_video',[
            'category_id' => $categoriesId[2],
            'video_id' => $video->id
        ]);
    }

    public function testSyncGenres() {
        $genresId = factory(Genre::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'genres_id' => [$genresId[0]]
        ]);
        $this->assertDatabaseHas('genre_video',[
            'genre_id' => $genresId[0],
            'video_id' => $video->id
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);
        $this->assertDatabaseMissing('genre_video',[
            'genre_id' => $genresId[0],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video',[
            'genre_id' => $genresId[1],
            'video_id' => $video->id
        ]);
        $this->assertDatabaseHas('genre_video',[
            'genre_id' => $genresId[2],
            'video_id' => $video->id
        ]);
    }

    private function assertHasCategory($videoId, $categoryId) {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    private function assertHasGenre($videoId, $genreId) {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
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
