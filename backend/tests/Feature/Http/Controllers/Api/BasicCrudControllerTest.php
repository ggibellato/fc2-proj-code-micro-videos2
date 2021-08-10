<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\Stubs\Resources\CategoryResourceStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    private $controller;
    private $category;

    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
        $this->category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }

    public function testIndex()
    {
        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(null)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
            // ->shouldReceive('all')
            // ->once()
            // ->andReturn(['name' => '']);

        $result = $this->controller->index($request);

        $resource = new CategoryResourceStub($this->category);
        $this->assertEquals($result->resolve(), [$resource->resolve()]);

        $serialized = $result->response()->getData(true);
        $this->assertEquals([$this->category->toArray()], $serialized['data']);
        $this->assertArrayHasKey('meta', $serialized);
        $this->assertArrayHasKey('links', $serialized);
        $this->assertArrayHasKey('per_page', $serialized['meta']);
        $this->assertEquals(15, $serialized['meta']['per_page']);
    }

    public function testIndexHasAll()
    {
        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(null)
            ->shouldReceive('has')
            ->once()
            ->andReturn(true);

        $result = $this->controller->index($request);

        $resource = new CategoryResourceStub($this->category);
        $this->assertEquals($result->resolve(), [$resource->resolve()]);

        $serialized = $result->response()->getData(true);
        $this->assertEquals([$this->category->toArray()], $serialized['data']);
        $this->assertArrayNotHasKey('meta', $serialized);
        $this->assertArrayNotHasKey('links', $serialized);
    }

    public function testIndexPagination()
    {
        $this->category = $this->CreateCategoryStub(31);
        $resource = new CategoryResourceStub($this->category);

        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(10)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(32, $serialized['meta']['total']);
        $this->assertEquals(10, $serialized['meta']['per_page']);
        $this->assertEquals( 4, $serialized['meta']['last_page']);

        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(15)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(15, $serialized['meta']['per_page']);
        $this->assertEquals( 3, $serialized['meta']['last_page']);

        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(40)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(40, $serialized['meta']['per_page']);
        $this->assertEquals( 1, $serialized['meta']['last_page']);

        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(16)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(16, $serialized['meta']['per_page']);
        $this->assertEquals( 2, $serialized['meta']['last_page']);

        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(32)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(32, $serialized['meta']['per_page']);
        $this->assertEquals( 1, $serialized['meta']['last_page']);
    }

    public function testIndexSearch()
    {
        $this->category = $this->CreateCategoryStub(31);
        $resource = new CategoryResourceStub($this->category);

        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('get')
            ->once()
            ->andReturn(10)
            ->shouldReceive('has')
            ->once()
            ->andReturn(false);
        $result = $this->controller->index($request);
        $serialized = $result->response()->getData(true);
        $this->assertEquals(32, $serialized['meta']['total']);
        $this->assertEquals(10, $serialized['meta']['per_page']);
        $this->assertEquals( 4, $serialized['meta']['last_page']);
    }

    protected function CreateCategoryStub(int $records)
    {
        for ($x = 1; $x <= $records; $x++) {
            CategoryStub::create(['name' => 'PAGINATION' . $x, 'description' => 'PAGINATION_description' . $x]);
        }
    }

    public function testInvalidationDataInStore()
    {
        $this->expectException(ValidationException::class);

        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);
        $this->controller->store($request);
    }

    public function testStore()
    {
        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->store($request);
        $resource = new CategoryResourceStub(CategoryStub::find(2)->toArray());
        $this->assertEquals(
            $resource->resolve(),
            $result->resolve()
        );

        $serialized = $result->response()->getData(true);
        $this->assertEquals(
            CategoryStub::find(2)->toArray(),
            $serialized['data']
        );
    }

    public function testIfFindOrFailFetchModel()
    {
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $result = $reflectionMethod->invokeArgs($this->controller, [$this->category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionWhenIdInvalid()
    {
        $this->expectException(ModelNotFoundException::class);

        /** @var CategoryStub $category */
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $reflectionMethod->invokeArgs($this->controller, [0]);
    }

    public function testShow()
    {
        $result = $this->controller->show($this->category->id);
        $resource = new CategoryResourceStub(CategoryStub::find(1)->toArray());
        $this->assertEquals(
            $resource->resolve(),
            $result->resolve()
        );

        $serialized = $result->response()->getData(true);
        $this->assertEquals(
            $this->category->toArray(),
            $serialized['data']
        );
    }

    public function testUpdate()
    {
        /** @var \Mockery\MockInterface|Request */
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name_update', 'description' => 'test_description_update']);
        $obj = $this->controller->update($request, $this->category->id);
        $resource = new CategoryResourceStub(CategoryStub::find($this->category->id)->toArray());
        $this->assertEquals(
            $obj->resolve(),
            $resource->resolve()
        );
    }

    public function testDestroy()
    {
        $response = $this->controller->destroy($this->category->id);
        $this->createTestResponse($response)
            ->assertStatus(204);
        $this->assertNull(CategoryStub::find($this->category->id));
    }
}
