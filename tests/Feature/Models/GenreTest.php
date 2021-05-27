<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    private $category;

    protected function setUp(): void 
    {
        parent::setUp();
        $this->category = Category::create([
            'name' => 'category 1'
        ]);
    }

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genre = Genre::all();
        $key = array_keys($genre->first()->getAttributes());
        $this->assertCount(1, Genre::all());
        $this->assertEqualsCanonicalizing(
            [
                'id', 
                'name', 
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $key
        );

        $genre = Genre::with(['categories'])->get();
        $key = array_keys($genre->first()->getRelations());
        $this->assertEqualsCanonicalizing(
            [
                'categories'
            ],
            $key
        );
    }

    public function testCreate()
    {
        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->refresh();
        $this->assertRegExp('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $genre->id);
        $this->assertEquals('test1', $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->categories()->attach($this->category);
        $this->assertEqualsCanonicalizing([$this->category->id], $genre->categories()->allRelatedIds()->toArray());
    }

    public function testUpdate(){
        /** @var Genre $genre */
        $genre =factory(Genre::class)->create([
            'is_active' => false
        ])->first();

        $data = [
            'name' => 'test_name_updated',
            'is_active' => true
        ];
        $genre->update($data);
        $category = Category::create([
            'name' => 'category 2'
        ]);
        $genre->categories()->sync([$category->id]);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $genre->{$key});
        }
        $this->assertEqualsCanonicalizing([$category->id], $genre->categories()->allRelatedIds()->toArray());                
    }

    public function testDelete(){
        /** @var Genre $genre */
        $genre = factory(Genre::class, 5)->create()->first();
        $genre->categories()->attach($this->category);
        $this->assertCount(5, Genre::all());
        $genre->delete();
        $this->assertCount(4, Genre::all());
    }
}
