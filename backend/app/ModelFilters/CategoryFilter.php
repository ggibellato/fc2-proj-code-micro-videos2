<?php

namespace App\ModelFilters;

class CategoryFilter extends DefaultModelFilter
{
    public $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->where('name', 'LIKE', "%$search%");
    }

    public function is_active($isActive)
    {
        dump($isActive);
        $isActive_ = (int)$isActive;
        $this->where('is_active', $isActive_ != 0);
    }
}
