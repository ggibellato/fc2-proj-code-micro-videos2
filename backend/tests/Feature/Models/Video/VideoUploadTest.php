<?php

namespace Tests\Feature\Models\Video;

use App\Models\Video;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\Exceptions\TestException;

class VideoUploadTest extends BaseVideoTestCase
{

    private $video;

    protected function setUp(): void 
    {
        parent::setUp();
        $this->video = [
            'video_file' => UploadedFile::fake()->create('video.mp4'),
            'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
            'banner_file' => UploadedFile::fake()->image('banner.jpg'),
            'trailer_file' => UploadedFile::fake()->create('trailer.mp4'),
        ];
    }

    public function testCreateWithFiles() 
    {
        Storage::fake();
        $video = Video::create(
            $this->defaultData + 
            $this->video
        );
        Storage::assertExists("{$video->id}/{$video->video_file}");
        Storage::assertExists("{$video->id}/{$video->thumb_file}");
        Storage::assertExists("{$video->id}/{$video->banner_file}");
        Storage::assertExists("{$video->id}/{$video->trailer_file}");
    }

    public function testCreateIfRollbackFiles()
    {
        Storage::fake();
        Event::listen(TransactionCommitted::class, function() {
            throw new TestException();
        });
        $hasError = false;
        try{
            $video = Video::create(
                $this->defaultData +             
                $this->video
            );
        } catch(TestException $e) {
            $this->assertCount(0, Storage::allFiles());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdateWithFiles() 
    {
        Storage::fake();
        $video = factory(Video::class)->create();

        $video->update($this->defaultData + $this->video);

        Storage::assertExists("{$video->id}/{$video->video_file}");
        Storage::assertExists("{$video->id}/{$video->thumb_file}");
        Storage::assertExists("{$video->id}/{$video->banner_file}");
        Storage::assertExists("{$video->id}/{$video->trailer_file}");

        $newVideoFile = UploadedFile::fake()->image('video.mp4');
        $video->update($this->defaultData + [
                'video_file' => $newVideoFile
            ]);

        Storage::assertExists("{$video->id}/{$newVideoFile->hashName()}");
        Storage::assertMissing("{$video->id}/{$this->video["video_file"]->hashName()}");
        Storage::assertExists("{$video->id}/{$video->thumb_file}");
        Storage::assertExists("{$video->id}/{$video->banner_file}");
        Storage::assertExists("{$video->id}/{$video->trailer_file}");
    }

    public function testUpdateOriginalWithFilesIfRollbackFiles() 
    {
        Storage::fake();
        $video = factory(Video::class)->create();
        Event::listen(TransactionCommitted::class, function() {
            throw new TestException();
        });
        $hasError = false;
        try{
            $video->update($this->defaultData + $this->video);
        } catch(TestException $e) {
            $this->assertCount(0, Storage::allFiles());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testFileUrlsWithLocalDriver()
    {
        $fileFields = [];
        foreach(Video::$fileFields as $field) {
            $fileFields[$field] = "$field.test";
        }
        $video = factory(Video::class)->create($fileFields);
        $localDriver = config('filesystems.default');
        $baseUrl = config('filesystems.disks.' . $localDriver)['url'];
        foreach($fileFields as $field => $value) {
            $fileUrl = $video->{"{$field}_url"};
            $this->assertEquals("{$baseUrl}/$video->id/$value", $fileUrl);
        }
    }

    public function testFileUrlsWithGcsDriver()
    {
        $fileFields = [];
        foreach(Video::$fileFields as $field) {
            $fileFields[$field] = "$field.test";
        }
        $video = factory(Video::class)->create($fileFields);
        $baseUrl = config('filesystems.disks.gcs.storage_api_uri');
        Config::set('filesystems.default','gcs');
        foreach($fileFields as $field => $value) {
            $fileUrl = $video->{"{$field}_url"};
            $this->assertEquals("{$baseUrl}/$video->id/$value", $fileUrl);
        }
    }

    public function testFileUrlsIfNullWhenFieldsAreNull() {
        $video = factory(Video::class)->create();
        foreach(Video::$fileFields as $field) {
            $fileUrl = $video->{"{$field}_url"};
            $this->assertNull($fileUrl);
        }
    }
}