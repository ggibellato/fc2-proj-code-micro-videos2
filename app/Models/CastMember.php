<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use SoftDeletes, Traits\Uuid;
    protected $fillable = [ 'name', 'type'];
    protected $dates = ['deleted_at'];
    public $incrementing = false;
    public $keyType = 'string';
}
