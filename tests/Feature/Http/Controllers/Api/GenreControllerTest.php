<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $genre;

    protected function setUp(): void 
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));
        $response
            ->assertStatus(200)
            ->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));
        $response
            ->assertStatus(200)
            ->assertJson($this->genre->toArray());
    }

    public function testInvalidationData() {
        $data = [
            'name' => '',
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name' => str_repeat('a', 256),
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');

        $data = [
            'categories_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testSave() {
        $category = factory(Category::class)->create();

        $data = [
            [
                'send_data' => ['name' => 'test', 'categories_id' => [$category->id]] ,
                'test_data' => ['name' => 'test', 'is_active' => true]
            ],
            [
                'send_data' => ['name' => 'test', 'is_active' => false, 'categories_id' => [$category->id]] ,
                'test_data' => ['name' => 'test', 'is_active' => false]
            ]
        ];

        $relations = ["categories" => [$category->id]];

        foreach($data as $key => $value) {
            /** @var TestResponse $response */
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);            
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $genre = Genre::find(json_decode($response->getContent())->id);
            $this->assertRelations($genre, $relations);
            
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);            
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $this->assertRelations($this->genre, $relations);
        }
    }

    public function testDestroy() {
        $response = $this->json('DELETE', route('genres.destroy', ['genre' => $this->genre->id]), []);
        $response->assertStatus(204);
        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }

    protected function routeStore() {
        return route('genres.store');
    }

    protected function routeUpdate() {
        return route('genres.update', ['genre' => $this->genre->id]);
    }

    protected function model() {
        return Genre::class;
    }
}
