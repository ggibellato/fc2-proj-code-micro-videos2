<?php

namespace Tests\Stubs\Controllers;

use App\Http\Controllers\Api\BasicCrudController;
use Tests\Stubs\Models\CategoryStub;
use Tests\Stubs\Resources\CategoryResourceStub;

class CategoryControllerStub extends BasicCrudController
{

    private $rules =[
        'name' => 'required|max:255',
        'description' => 'nullable'
    ]; 

    protected function model()
    {
        return CategoryStub::class;
    }

    protected function ruleStore() {
        return $this->rules;
    }

    protected function ruleUpdate() {
        return $this->rules;
    }

    protected function resourceCollection() {
        return $this->resource();
    }

    protected function resource() {
        return CategoryResourceStub::class;
    }
}