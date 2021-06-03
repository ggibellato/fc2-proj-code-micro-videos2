<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Traits\TestUploads;

class VideoControllerUploadTest extends BasicVideoControllerTestCase
{

    use TestUploads;

    public function testInvalidationFileFields() {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            52428800,
            'video/mp4'
        );

        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            5120,
            'image/jpeg'
        );

        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            10240,
            'image/jpeg'
        );

        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            1048576,
            'video/mp4'
        );
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
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner_file.jpg'),
            'trailer_file' => UploadedFile::fake()->create('video_file.mp4')
        ];
    }
}
