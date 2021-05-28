<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use App\Rules\CategoryGenreRelation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VideoController extends BasicCrudController
{

    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode (',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => ['required', 'array', 'exists:categories,id,deleted_at,NULL'],
            'genres_id' => ['required', 'array', 'exists:genres,id,deleted_at,NULL']
        ];
    }

    public function store(Request $request)
    {
        $rules = $this->ruleStore();
        $rules['genres_id'] = ['required', 'array', 'exists:genres,id,deleted_at,NULL', 
             new CategoryGenreRelation(['categories_id' => $request->categories_id, 'genres_id' => $request->genres_id])
        ];
        $validatedData = $this->validate($request, $rules);
        $self = $this;
        /** @var Video $obj */
        $obj = DB::transaction(function () use ($request, $validatedData, $self) {
            $obj = $this->model()::create($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });

        $obj->refresh();
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->ruleUpdate() + [new CategoryGenreRelation($request)]);
        $self = $this;
        $obj = DB::transaction(function () use ($request, $validatedData, $self, $obj) {
            $obj->update($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        return $obj;
    }

    protected function handleRelations($video, Request $request) {
        $video->categories()->sync($request->get('categories_id'));
        $video->genres()->sync($request->get('genres_id'));
    }

    protected function model() {
        return Video::class;
    }

    protected function ruleStore() {
        return $this->rules;
    }

    protected function ruleUpdate() {
        return $this->rules;
    }
}
