<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Http\Resources\GenreResource;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    private $genre;
    // private $serializedFields = [
    //     'id',
    //     'name',
    //     'is_active',
    //     'created_at',
    //     'updated_at',
    //     'deleted_at',
    //     "categories" => [
    //         '*' => [
    //             'id',
    //             'name',
    //             'description',
    //             'is_active',
    //             'created_at',
    //             'updated_at',
    //             'deleted_at'
    //         ]
    //     ]
    // ];
    private $serializedFields = [
        'id',
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {

        $category = factory(Category::class)->create();
        $this->genre->categories()->attach($category);

        $response = $this->get(route('genres.index'));
        $response
            ->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->serializedFields
                ],
                'links' => [],
                'meta' => []
            ]);
        $resource = GenreResource::collection([$this->genre]);
        $this->assertResource($response, $resource);
    }

    public function testShow()
    {
        $category = factory(Category::class)->create();
        $this->genre->categories()->attach($category);
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
        $this->validateResource($response);
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

        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id]
        ];
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
                'data' => $this->serializedFields
            ]);
            $genre = Genre::find(json_decode($response->getContent())->data->id);
            $this->assertRelations($genre, $relations);
            $this->validateResource($response);


            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
            $this->assertRelations($this->genre, $relations);
            $this->validateResource($response);
        }
    }

    private function assertHasCategory($genreId, $categoryId) {
        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $genreId,
            'category_id' => $categoryId
        ]);
    }

    public function testSyncCategories() {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];
        $response = $this->json('POST', $this->routeStore(), $sendData);
        $id = $response->json('data.id');
        $this->assertDatabaseHas('category_genre',[
            'category_id' => $categoriesId[0],
            'genre_id' => $id
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json('PUT', route('genres.update', ['genre' => $id]), $sendData);
        $this->assertDatabaseMissing('category_genre',[
            'category_id' => $categoriesId[0],
            'genre_id' => $id
        ]);
        $this->assertDatabaseHas('category_genre',[
            'category_id' => $categoriesId[1],
            'genre_id' => $id
        ]);
        $this->assertDatabaseHas('category_genre',[
            'category_id' => $categoriesId[2],
            'genre_id' => $id
        ]);
    }

    public function testRollbackStore()
    {
        /** @var \Mockery\MockInterface|GenreController */
        $controller = \Mockery::mock(GenreController::class);
        $controller
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(['name' => 'test']);

        $controller
            ->shouldReceive('ruleStore')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());


        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->store($request);
        }
        catch(TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        /** @var \Mockery\MockInterface|GenreController */
        $controller = \Mockery::mock(GenreController::class);
        $controller
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('findOrFail')
            ->withAnyArgs()
            ->andReturn($this->genre);

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn([
                'name' => 'test'
            ]);

        $controller
            ->shouldReceive('rulesUpdate')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());


        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);

        $hasError = false;
        try {
            $controller->update($request, 1);
        }
        catch(TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
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

    private function validateResource($response) {
        $id = $response->json('data.id');
        $resource = new GenreResource(Genre::find($id));
        $this->assertResource($response, $resource);
    }
}
