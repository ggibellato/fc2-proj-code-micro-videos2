<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GenreController extends BasicCrudController
{
    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL'
    ];

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->ruleStore());
        $self = $this;
        /** @var Genre $obj */
        $obj = DB::transaction(function () use ($request, $validatedData, $self) {
            $obj = $this->model()::create($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        $obj->refresh();
        $resourceClass = $this->resource();
        $obj->load($this->queryBuilder()->getEagerLoads());
        return new $resourceClass($obj);
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->ruleUpdate());
        $self = $this;
        $obj = DB::transaction(function () use ($request, $validatedData, $self, $obj) {
            $obj->update($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        $resource = $this->resource();
        return new $resource($obj);
    }

    protected function handleRelations($genre, Request $request) {
        $genre->categories()->sync($request->get('categories_id'));
    }

    protected function model() {
        return Genre::class;
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
        return GenreResource::class;
    }

    protected function queryBuilder(): Builder {
        return parent::queryBuilder()->with('categories');
    }
}

