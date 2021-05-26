<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Models\CategoryStub;
use Tests\Stubs\Controllers\CategoryControllerStub;
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
        $result = $this->controller->index()->toArray();
        $this->assertEquals([$this->category->toArray()], $result);
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
        $obj = $this->controller->store($request);
        $this->assertEquals(
            CategoryStub::find(2)->toArray(),
            $obj->toArray()
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
        $obj = $this->controller->show($this->category->id);
        $this->assertEquals(
            CategoryStub::find(1)->toArray(),
            $obj->toArray()
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
        $this->assertEquals(
            $obj->toArray(),
            CategoryStub::find($this->category->id)->toArray()
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
