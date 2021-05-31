<?php

namespace App\Models;

use App\Models\Traits\UploadFiles;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Video extends Model
{
    use SoftDeletes, Uuid, UploadFiles;

    const RATING_LIST = ['L', '10', '12', '14', '16', '18'];

    protected $fillable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'opened' => 'boolean',
        'year_launched' => 'integer',
        'duration' => 'integer',
        'video_file' => 'string'
    ];

    public $incrementing = false;
    public static $fileFields = [ 'video_file'];

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
                //excluir os arquivos de uploads
            }
            DB::rollBack();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options =[])
    {
        try {
            DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            static::handleRelations($this, $attributes);
            if($saved){
                //upload aqui
                // excluir os antigos
            }
            DB::commit();
            return $saved;
        }
        catch(\Exception $e) {
            //excluir os arquivos de uploads
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
    }

    public function categories() 
    {
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function genres() 
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }

    public function uploadDir(){
        return $this->id;
    }
}
