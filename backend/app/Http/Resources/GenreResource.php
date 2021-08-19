<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */

    public function toArray($request)
    {
        // $obj = parent::toArray($request) 
        //     + ['categories' => CategoryResource::collection($this->categories)->resolve()];
        // $links = [];
        // foreach($this->categories as $category) {
        //      $links[] = url("categories/{$category->id}");
        // }
        //$obj->$links[] = $links;
        // return $obj;
        return parent::toArray($request) + ['categories' => CategoryResource::collection($this->whenLoaded('categories'))];
    }
}
