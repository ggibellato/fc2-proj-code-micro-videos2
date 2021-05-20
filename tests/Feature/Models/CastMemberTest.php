<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castMember = CastMember::all();
        $castMemberKey = array_keys($castMember->first()->getAttributes());
        $this->assertCount(1, CastMember::all());
        $this->assertEqualsCanonicalizing(
            [
                'id', 
                'name', 
                'type',
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            $castMemberKey
        );
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => 1
        ]);
        $castMember->refresh();
        $this->assertRegExp('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $castMember->id);
        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals(1, $castMember->type);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => 2
        ]);
        $this->assertEquals(2, $castMember->type);
    }

    public function testUpdate(){
        /** @var CastMember $castMember */
        $castMember = factory(CastMember::class)->create([
            'type' => 2
        ])->first();

        $data = [
            'name' => 'test_name_updated',
            'type' => 1
        ];
        $castMember->update($data);

        foreach($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDelete(){
        /** @var CastMember $castMember */
        $castMember = factory(CastMember::class, 5)->create()->first();
        $this->assertCount(5, CastMember::all());
        $castMember->delete();
        $this->assertCount(4, CastMember::all());
    }
}
