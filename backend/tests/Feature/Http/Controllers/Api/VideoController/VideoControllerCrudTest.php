<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Http\Resources\VideoResource;
use App\Models\CastMember;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class VideoControllerCrudTest extends BasicVideoControllerTestCase
{

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));
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
        $resource = VideoResource::collection([$this->video]);
        $this->assertResource($response, $resource);
        $this->assertIfFilesUrlExists($this->video, $response);
    }

    public function testInvalidationRequired() {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => '',
            'cast_members_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax() {
        $data = [
            'title' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger() {
        $data = [
            'duration' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField() {
        $data = [
            'year_launched' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField() {
        $data = [
            'opened' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField() {
        $data = [
            'rating' => 0
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesIdField() {
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
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationGenreIdField() {
        $data = [
            'genres_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Category::class)->create();
        $genre->delete();
        $data = [
            'genres_id' => [$genre->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationCastMemberIdField() {
        $data = [
            'cast_members_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'cast_members_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $castMember = factory(CastMember::class)->create();
        $castMember->delete();
        $data = [
            'cast_members_id' => [$castMember->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationRelationManyToMany() {
        $fields = [
            'categories_id',
            'genres_id',
            'cast_members_id'
        ];
        foreach ($fields as $field) {
            $data = [
                $field => 'a'
            ];
            $this->assertInvalidationInStoreAction($data, 'array');
            $this->assertInvalidationInUpdateAction($data, 'array');

            $data = [
                $field => [100]
            ];
            $this->assertInvalidationInStoreAction($data, 'exists');
            $this->assertInvalidationInUpdateAction($data, 'exists');
        }
    }

    public function testSaveWithoutFile() {
        $testData = Arr::except($this->sendData, ['categories_id', 'genres_id', 'cast_members_id']);
        $data = [
            [
                'send_data' => $this->sendData ,                    
                'test_data' => $testData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + [
                    'opened' => true, 
                ] ,
                'test_data' => $testData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData + [
                    'rating' => Video::RATING_LIST[1], 
                ],
                'test_data' => $testData + ['rating' => Video::RATING_LIST[1]]
            ]
        ];

        $relations = ["categories" => [$this->category->id], "genres" => [$this->genre->id], "castMembers" => [$this->castMember->id]];

        foreach($data as $key => $value) {
            /** @var TestResponse $response */
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
            $video = Video::find(json_decode($response->getContent())->data->id);
            $this->assertRelations($video, $relations);
            $this->assertHasCategory(
                $response->json('data.id'),
                $value['send_data']['categories_id'][0]
            );
            $this->assertHasGenre(
                $response->json('data.id'),
                $value['send_data']['genres_id'][0]
            );
            $this->assertHasCastMember(
                $response->json('data.id'),
                $value['send_data']['cast_members_id'][0]
            );
            $this->validateResource($response);    
            $this->assertIfFilesUrlExists($video, $response);
            
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);            
            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
            $this->assertRelations($this->video, $relations);
            $this->assertHasCategory(
                $response->json('data.id'),
                $value['send_data']['categories_id'][0]
            );
            $this->assertHasGenre(
                $response->json('data.id'),
                $value['send_data']['genres_id'][0]
            );
            $this->assertHasCastMember(
                $response->json('data.id'),
                $value['send_data']['cast_members_id'][0]
            );
            $this->validateResource($response);  
            $this->assertIfFilesUrlExists($this->video, $response);
        }
    }

    private function assertHasCategory($videoId, $categoryId) {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    private function assertHasGenre($videoId, $genreId) {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }

    private function assertHasCastMember($videoId, $castMember) {
        $this->assertDatabaseHas('cast_member_video', [
            'video_id' => $videoId,
            'cast_member_id' => $castMember
        ]);
    }

    public function testSaveCategoryGenreRelationValidationRuleInvalid(){
        $sendData = Arr::except($this->sendData, ['categories_id', 'genres_id', 'cast_members_id']);

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->attach($category);

        $category1 = factory(Category::class)->create();
        $genre1 = factory(Genre::class)->create();
        $genre1->categories()->attach($category1);
        
        $castMember = factory(CastMember::class)->create();

        $data = [
            [
                'send_data' => $sendData + [
                    'categories_id' => [$category->id, $category1->id], 
                    'genres_id' => [$genre->id],
                    'cast_members_id' => [$castMember->id]
                ]
            ],
            [
                'send_data' => $sendData + [
                    'categories_id' => [$category->id], 
                    'genres_id' => [$genre->id, $genre1->id],
                    'cast_members_id' => [$castMember->id]
                ]
            ]
        ];

        $rule = new GenresHasCategoriesRule([$category->id, $category1->id]);

        foreach($data as $key => $value) {
            /** @var TestResponse $response */
            $response = $this->json('POST', $this->routeStore(), $value['send_data']);
            $response
                ->assertStatus(422)
                ->assertJsonFragment([
                    $rule->message()
                ]);
        }
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));
        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields
            ]);
        $this->validateResource($response);
        $this->assertIfFilesUrlExists($this->video, $response);
    }

    public function testDestroy() {
        $response = $this->json('DELETE', route('videos.destroy', ['video' => $this->video->id]), []);
        $response->assertStatus(204);
        $this->assertNull(Video::find($this->video->id));
        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
    }

    private function validateResource($response) {
        $id = $response->json('data.id');
        $resource = new VideoResource(Video::find($id));
        $this->assertResource($response, $resource);
    }

}


