<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Tests\Traits\TestUploads;

class VideoControllerUploadsTest extends BasicVideoControllerTestCase
{

    use TestUploads;

    public function testInvalidationVideoField() {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            Video::VIDEO_FILE_MAX_SIZE,
            'mimetypes', ['values' => 'video/mp4']
        );
    }

    public function testInvalidationThumbField() {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            Video::THUMB_FILE_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationBannerField() {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            Video::BANNER_FILE_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationTraillerField() {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            Video::TRAILER_FILE_MAX_SIZE,
            'mimetypes', ['values' => 'video/mp4']
        );
    }

    public function testStoreWithFile() {
        Storage::fake();
        $files = $this->getFiles();

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData +
            $files
        );
        $response->assertStatus(201);
        $this->assertFilesOnPersist($response, $files);
        $video = Video::find($response->json('data.id'));
        $this->assertIfFilesUrlExists($video, $response);
    }

    public function testUpdateWithFile() {
        Storage::fake();
        $files = $this->getFiles();

        $response = $this->json(
            'PUT', $this->routeUpdate(), $this->sendData + $files
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, $files);
        $video = Video::find($response->json('data.id'));
        $this->assertIfFilesUrlExists($video, $response);

        $newFiles = [
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg')
        ];

        $response = $this->json(
            'PUT', $this->routeUpdate(), $this->sendData + $newFiles
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, Arr::except($files, ['thumb_file', 'video_file']) + $newFiles);

        $id = $response->json('data.id');
        $video = Video::find($id);
        Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
    }

    protected function assertFilesOnPersist(TestResponse $response, $files)
    {
        $id = $response->json('data.id');
        $video = Video::find($id);
        $this->assertFileExistsInStorage($video, $files);
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

    protected function assertFileExistsInStorage($model, array $files)
    {
        /** @var UploadFiles $model */
        foreach($files as $key => $file) {
            Storage::assertExists($model->relativeFilePath($file->hashName()));
        }
    }
}
