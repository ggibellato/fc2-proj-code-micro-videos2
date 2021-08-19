<?php

namespace App\Models;

use App\Models\Traits\UploadFiles;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Video extends Model
{
    use SoftDeletes, Uuid, UploadFiles, Filterable;

    const RATING_LIST = ['L', '10', '12', '14', '16', '18'];
    const THUMB_FILE_MAX_SIZE = 1024 * 5; // 5 MB
    const BANNER_FILE_MAX_SIZE = 1024 * 10; // 10MB
    const TRAILER_FILE_MAX_SIZE = 1024 * 1024 * 1; // 1GB
    const VIDEO_FILE_MAX_SIZE = 1024 * 1024 * 50; // 50GB

    protected $fillable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file',
        'thumb_file',
        'banner_file',
        'trailer_file'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'opened' => 'boolean',
        'year_launched' => 'integer',
        'duration' => 'integer',
        'video_file' => 'string',
        'thumb_file' => 'string',
        'banner_file' => 'string',
        'trailer_file' => 'string'
    ];

    public $incrementing = false;
    public static $fileFields = [ 'video_file', 'thumb_file', 'banner_file', 'trailer_file'];

    public static function create(array $attributes =[]) 
    {
        $files = self::extractFiles($attributes);
        try {
            DB::beginTransaction();
            $obj = static::query()->create($attributes);
            static::handleRelations($obj, $attributes);
            $obj->uploadFiles($files);
            DB::commit();
            return $obj;
        }
        catch(\Exception $e) {
            if(isset($obj)) {
                $obj->deleteFiles($files);
            }
            DB::rollBack();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options =[])
    {
        $files = self::extractFiles($attributes);
        try {
            DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            static::handleRelations($this, $attributes);
            if($saved){
                $this->uploadFiles($files);
            }
            DB::commit();
            if($saved && count($files)) {
                $this->deleteOldFiles();
            }
            return $saved;
        }
        catch(\Exception $e) {
            $this->deleteFiles($files);
            DB::rollBack();
            throw $e;
        }
    }

    public static function handleRelations(Video $video, array $attributes) {
        if(isset($attributes['categories_id'])) {
            $video->categories()->sync($attributes['categories_id']);
        }
        if(isset($attributes['genres_id'])) {
            $video->genres()->sync($attributes['genres_id']);
        }
        if(isset($attributes['cast_members_id'])) {
            $video->castMembers()->sync($attributes['cast_members_id']);
        }
    }

    public function categories() 
    {
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function genres() 
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }

    public function castMembers() 
    {
        return $this->belongsToMany(CastMember::class)->withTrashed();
    }

    public function uploadDir(){
        return $this->id;
    }

    public function getVideoFileUrlAttribute()
    {
        return $this->video_file ? $this->publicUrlFile($this->video_file) : null;
    }

    public function getThumbFileUrlAttribute()
    {
        return $this->thumb_file ? $this->publicUrlFile($this->thumb_file) : null;
    }

    public function getBannerFileUrlAttribute()
    {
        return $this->banner_file ? $this->publicUrlFile($this->banner_file) : null;
    }

    public function getTrailerFileUrlAttribute()
    {
        return $this->trailer_file ? $this->publicUrlFile($this->trailer_file) : null;
    }
}
