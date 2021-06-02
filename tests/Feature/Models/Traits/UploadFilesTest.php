<?php

namespace Tests\Features\Models\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Stubs\Models\UploadFilesStub;

class UploadFilesUnitTest extends TestCase
{
    /** @var UploadedFile $obj */
    private $obj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->obj = new UploadFilesStub();

        UploadFilesStub::dropTable();
        UploadFilesStub::makeTable();
    }

    public function testMakeOldFieldsOnSaving() 
    {
        //not exist
        $this->obj->fill([
            'name' => 'test',
            'file1' => 'test1.mp4',
            'file2' => 'test2.mp4'
        ]);
        $this->obj->save();

        $this->assertCount(0, $this->obj->oldFiles);

        $this->obj->update([
            'name' => 'test_name',
            'file2' => 'test3.mp4'
        ]);

        $this->assertEqualsCanonicalizing(['test2.mp4'], $this->obj->oldFiles);
    }

    public function testChangeTheFiletoNullOnUpdate() 
    {
        //not exist
        $this->obj->fill([
            'name' => 'test',
            'file1' => 'test1.mp4',
            'file2' => 'test2.mp4'
        ]);
        $this->obj->save();

        $this->obj->update([
            'name' => 'test_name',
            'file1' => null
        ]);

        $this->assertEqualsCanonicalizing(['test1.mp4'], $this->obj->oldFiles);
    }

    public function testMakeOldFilesNullOnSaving() 
    {
        //not exist
        $this->obj->fill([
            'name' => 'test'
        ]);
        $this->obj->save();

        $this->obj->update([
            'name' => 'test_name',
            'file2' => 'test3.mp4'
        ]);

        $this->assertEqualsCanonicalizing([], $this->obj->oldFiles);
    }
}