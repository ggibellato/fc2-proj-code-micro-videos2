<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes, Traits\Uuid;
    protected $fillable = [ 'name', 'description', 'is_active'];
    protected $dates = ['deleted_ad'];
    protected $casts = [
        'id' => 'string'
    ];
    public $incrementing = false;
    public $keyType = 'string';
}
