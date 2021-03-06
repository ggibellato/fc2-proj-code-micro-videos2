<?php

namespace Tests\Unit\Rules;

use App\Rules\GenresHasCategoriesRule;
use Illuminate\Contracts\Validation\Rule;
use Mockery\MockInterface;
use Tests\TestCase;



class GenresHasCategoriesRuleTest extends TestCase 
{

    public function testImplementsRule() {
        $rule = new GenresHasCategoriesRule([]);
        $this->assertInstanceOf(Rule::class, $rule);
    }

    public function testCategoriesIdField()
    {
        $rule = new GenresHasCategoriesRule([1, 1, 2, 2]);

        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('categoriesId');
        $reflectionProperty->setAccessible(true);

        $categoriesId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $categoriesId);
    }

    public function testGenresIdField()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturnNull();

        $rule->passes('', [1, 1, 2, 2]);

        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('genresId');
        $reflectionProperty->setAccessible(true);

        $genresId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $genresId);
    }

    public function testPassesReturnsFalseWhenCategoreisOrGeneresIsArrayEmpty() 
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([1]);
        $this->assertFalse($rule->passes('',[]));

        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([]);
        $this->assertFalse($rule->passes('',[1]));
    }

    public function testPassesReturnsFalseWhenGetRowsIsempty() 
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([1]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect());
        $this->assertFalse($rule->passes('',[1]));
    }

    public function testPassesReturnsFalseWhenHasCategoriesWithoutGenres() 
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1]
            ]));
        $this->assertFalse($rule->passes('',[1]));
    }

    public function testPassesIsValid() 
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2]
            ]));
        $this->assertTrue($rule->passes('',[1]));

        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2],
                ['category_id' => 1],
                ['category_id' => 2],
            ]));
        $this->assertTrue($rule->passes('',[1]));
    }

    protected function createRuleMock(array $categoriesId): MockInterface {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule */
        $mock = \Mockery::mock(GenresHasCategoriesRule::class, [$categoriesId]);
        return $mock
            ->makePartial()
            ->shouldAllowMockingProtectedMethods(); 
    }
}


