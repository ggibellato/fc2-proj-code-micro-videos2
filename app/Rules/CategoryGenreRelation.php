<?php

namespace App\Rules;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Contracts\Validation\Rule;

class CategoryGenreRelation implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */

    private $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $this->data['categories_id'] = $this->data['categories_id'] ?? [];
        $this->data['genres_id'] = $this->data['genres_id'] ?? [];
        $generes = Genre::findMany($this->data['genres_id'])->load('categories');
        $categoriesId = [];
        foreach($generes as $genre) {
            $exists = false;
            foreach($genre->categories as $category) {
                if(in_array($category->id, $this->data['categories_id'])){
                    $exists = true;
                }
                array_push($categoriesId, $category->id); 
            }
            if(!$exists) {
                return false;
            }
        }
        foreach($this->data['categories_id'] as $category_id) {
             if(!in_array($category_id, $categoriesId)) {
                 return false;
             }
        }
        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The categories and genders must be related each other';
    }
}
