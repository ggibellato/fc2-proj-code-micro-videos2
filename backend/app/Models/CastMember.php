<?php

namespace App\Models;

use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable;

    const TYPE_DIRECTOR = 1;
    const TYPE_ACTOR = 2;
  
    public static $types = [
        CastMember::TYPE_DIRECTOR,
        CastMember::TYPE_ACTOR
    ];

    protected $fillable = [ 'name', 'type'];
    protected $dates = ['deleted_at'];
    public $incrementing = false;
    public $keyType = 'string';
    protected $casts = [
        'type' => 'integer'
    ];
}
