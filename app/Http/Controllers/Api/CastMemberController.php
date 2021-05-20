<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CastMember;
use Illuminate\Http\Request;

class CastMemberController extends Controller
{
    private $rules = [
        'name' => 'required|max:255',
        'type' => 'required|integer|between:1,2'
    ];

    public function index()
    {
        return CastMember::all();
    }

    public function store(Request $request)
    {
        $this->validate($request, $this->rules);
        $castMember = CastMember::create($request->all());
        $castMember->refresh();
        return $castMember;
    }

    public function show(CastMember $castMember)
    {
        return $castMember;
    }

    public function update(Request $request, CastMember $castMember)
    {
        $this->validate($request, $this->rules);
        $castMember->update($request->all());
        return $castMember;
    }

    public function destroy(CastMember $castMember)
    {
        $castMember->delete();
        return response()->noContent(); //204
    }
}
