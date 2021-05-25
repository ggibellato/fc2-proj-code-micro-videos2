<?php

namespace App\Http\Controllers\Api;

use App\Models\Genre;

class GenreController extends BasicCrudController
{
    protected function model() {
        return Genre::class;
    }

    protected function ruleStore() {
        return [
            'name' => 'required|max:255',
            'is_active' => 'boolean'
        ];
    }
}
