<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // $obj = parent::toArray($request) + [
        //     'video_file_url' => $this->video_file_url,
        //     'thumb_file_url' => $this->thumb_file_url,
        //     'banner_file_url' => $this->banner_file_url,
        //     'trailer_file_url' => $this->trailer_file_url,
        //     'categories' => CategoryResource::collection($this->categories)->resolve(),
        //     'genres' => GenreResource::collection($this->genres)->resolve()
        // ];
        // return $obj;
        return parent::toArray($request) + [
                'video_file_url' => $this->video_file_url,
                'thumb_file_url' => $this->thumb_file_url,
                'banner_file_url' => $this->banner_file_url,
                'trailer_file_url' => $this->trailer_file_url,
                'categories' => CategoryResource::collection($this->categories),
                'genres' => GenreResource::collection($this->genres) 
            ];
    }
}
