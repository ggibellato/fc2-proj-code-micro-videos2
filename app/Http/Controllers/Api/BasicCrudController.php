<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{

    protected abstract function model();

    protected abstract function ruleStore();

    protected abstract function ruleUpdate();

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
        $obj = $this->model()::findOrFail($id);
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $obj = $this->model()::findOrFail($id);
        $validatedData = $this->validate($request, $this->ruleUpdate());
        $obj->update($validatedData);
        return $obj;
    }

    public function destroy($id)
    {
        $obj = $this->model()::findOrFail($id);
        $obj->delete();
        return response()->noContent(); //204
    }
}
