<?php

namespace App\ModelFilters;

use Illuminate\Database\Eloquent\Builder;

class CategoryFilter extends DefaultModelFilter
{
    public $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->where('name', 'LIKE', "%$search%");
    }

    public function is_active($isActive)
    {
        $isActive_ = (int)$isActive;
        $this->where('is_active', $isActive_ != 0);
    }

    public function genres($genres) {
        $ids = explode(",", $genres);
        $this->whereHas('genres', function (Builder $query) use ($ids) {
            $query->whereIn('id', $ids);
        });
    }
}
