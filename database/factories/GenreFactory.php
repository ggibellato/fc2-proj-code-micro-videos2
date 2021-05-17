<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Genre;
use Faker\Generator as Faker;

$factory->define(Genre::class, function (Faker $faker) {
    return [
        'name' => $faker->randomElement(['Ação','Aventura','Cinema de arte','Chanchada','Comédia','Comédia de ação','Comédia de terror','Comédia dramática','Comédia romântica','Dança','Documentário','Drama','Espionagem','Faroeste','Fantasia'])
    ];
});