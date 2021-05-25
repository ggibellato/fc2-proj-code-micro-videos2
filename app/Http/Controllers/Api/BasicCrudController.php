<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

    public function show($id)
    {
        return $this->model()::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $model = $this->model()::findOrFail($id);
        $this->validate($request, $this->ruleStore());
        $model->update($request->all());
        return $model;
    }

    public function destroy($id)
    {
        $model = $this->model()::findOrFail($id);
        $model->delete();
        return response()->noContent(); //204
    }
}
