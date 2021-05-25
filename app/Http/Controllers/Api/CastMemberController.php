<?php

namespace App\Http\Controllers\Api;

use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    protected function model() {
        return CastMember::class;
    }

    protected function ruleStore() {
        return [
            'name' => 'required|max:255',
            'type' => 'required|integer|between:1,2'
        ];
    }
}
