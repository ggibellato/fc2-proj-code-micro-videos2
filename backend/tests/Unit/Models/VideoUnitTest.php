<?php

namespace Tests\Unit\Models;

use App\Models\Video;
use App\Models\Traits\UploadFiles;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class VideoUnitTest extends TestCase
{

    private $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class,
            Uuid::class,
            UploadFiles::class,
            Filterable::class
        ];
        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEquals($traits, $videoTraits);
    }

    public function testFillableAttribute()
    {
        $fillable = ['title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file',
        'thumb_file',
        'banner_file',
        'trailer_file'];
        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        $this->assertEqualsCanonicalizing($dates, $this->video->getDates());
    }

    public function testCastAttribute()
    {
        $casts = [
            'opened' => 'boolean',
            'year_launched' => 'integer',
            'duration' => 'integer',
            'video_file' => 'string',
            'thumb_file' => 'string',
            'banner_file' => 'string',
            'trailer_file' => 'string',
        ];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->video->incrementing);
    }
}
