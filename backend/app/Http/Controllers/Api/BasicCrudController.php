<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

abstract class BasicCrudController extends Controller
{

    protected $defaultPerPage = 15;

    protected abstract function model();

    protected abstract function ruleStore();

    protected abstract function ruleUpdate();

    protected abstract function resource();

    protected abstract function resourceCollection();

    public function index(Request $request)
    {
        $perPage = (int)$request->get('per_page', $this->defaultPerPage);
        $hasFilter = in_array(Filterable::class, class_uses($this->model()));

        $query = $this->queryBuilder();

        if($hasFilter) {
            $query = $query->filter($request->all());
        }

        $data = $request->has('all') || !$this->defaultPerPage
            ? $query->get()
            : $query->paginate($perPage);

        $resourceCollectionClass = $this->resourceCollection();
        $refClass = new \ReflectionClass($this->resourceCollection());
        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resourceCollectionClass($data)
            : $resourceCollectionClass::collection($data);
    }

    public function store(Request $request) {
        $validatedData = $this->validate($request, $this->ruleStore());
        $obj = $this->queryBuilder()->create($validatedData);
        $obj->refresh();
        $resourceClass = $this->resource();
        return new $resourceClass($obj);
    }

    protected function findOrFail($id) {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->queryBuilder()->where($keyName, $id)->firstOrFail();
    }

    public function show($id)
    {
        // eu mudei para acessar o queryBuilder
        // $obj = $this->model()::findOrFail($id);
        // $resource = $this->resource();
        // return new $resource($obj);
        return $this->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $obj = $this->model()::findOrFail($id);
        $validatedData = $this->validate($request, $this->ruleUpdate());
        $obj->update($validatedData);
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function destroy($id)
    {
        $obj = $this->model()::findOrFail($id);
        $obj->delete();
        return response()->noContent(); //204
    }

    protected function queryBuilder(): Builder
    {
        return $this->model()::query();
    }
}
