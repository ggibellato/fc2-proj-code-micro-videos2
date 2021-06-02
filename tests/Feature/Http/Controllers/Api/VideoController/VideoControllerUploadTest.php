<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerUploadTest extends BasicVideoControllerTestCase
{

    public function testInvalidationVideo_FileField() {
        Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4', 2048, 'mimes:jpg');

        $data = [
            'video_file' => $file
        ];
        $this->assertInvalidationInStoreAction($data, 'max.file', ['max' => 1024]);
        $this->assertInvalidationInUpdateAction($data, 'max.file', ['max' => 1024]);

        $this->assertInvalidationInStoreAction($data, 'mimetypes', ['values' => 'video/mp4']);
        $this->assertInvalidationInUpdateAction($data, 'mimetypes', ['values' => 'video/mp4']);
    }

    public function testStoreWithFile() {
        Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + 
            [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );
        $response->assertStatus(201);

        $id = $response->json('id');
        foreach($files as $file) {
            Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    public function testUpdateWithFile() {
        Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + 
            [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );
        $response->assertStatus(200);

        $id = $response->json('id');
        foreach($files as $file) {
            Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    protected function getFiles() 
    {
        return [
            'video_file' => UploadedFile::fake()->create('video_file.mp4', 10, 'video/mp4')
        ];
    }
}
