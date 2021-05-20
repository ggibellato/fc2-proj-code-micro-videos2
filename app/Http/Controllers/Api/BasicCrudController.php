<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{

    protected abstract function model();

    protected abstract function ruleStore();

    // protected abstract function routeStore();

    // protected abstract function routeUpdate();

    public function index()
    {
        return $this->model()::all();
    }

    public function store(Request $request) {
        $validatedData = $this->validate($request, $this->ruleStore());
        $obj = $this->model()::create($validatedData);
        $obj->refresh();
        return $obj;
    }

    protected function findOrFail($id) {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }

    public function show(Model $model)
    {
        return $model;
    }

    public function update(Request $request, Model $model)
    {
        $this->validate($request, $this->ruleStore());
        $model->update($request->all());
        return $model;
    }

    public function destroy(Model $model)
    {
         $model->delete();
         return response()->noContent(); //204
    }
}
