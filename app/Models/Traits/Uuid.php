<?php


namespace App\Models\Traits;
use Ramsey\Uuid\Uuid as RamseyUuid;

trait Uuid
{
    public static function boot() {
        parent::boot();
        static::creating(function($obj){
            //dump('aqui no boot uuid');
            $obj->id = RamseyUuid::uuid4()->toString();
            //dump($obj);
        });
    }    
}