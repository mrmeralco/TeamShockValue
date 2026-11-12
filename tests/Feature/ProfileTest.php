<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::dropAllTables();
        (require database_path('migrations/0001_01_01_000000_create_users_table.php'))->up();
        (require database_path('migrations/2026_11_12_000001_add_shockvalue_user_id_to_users_table.php'))->up();
    }

    public function test_user_can_change_email_and_password(): void
    {
        $user = User::factory()->create(['user_id' => '#123456789', 'email' => 'old@example.com', 'password' => Hash::make('old-password')]);

        $this->actingAs($user)->putJson('/api/profile', [
            'username' => 'Updated', 'email' => 'NEW@example.com', 'current_password' => 'old-password',
            'password' => 'new-password', 'password_confirmation' => 'new-password',
        ])->assertOk()->assertJsonPath('user.email', 'new@example.com');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated', 'email' => 'new@example.com']);
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_credential_changes_require_the_current_password_and_matching_confirmation(): void
    {
        $user = User::factory()->create(['user_id' => '#123456789', 'email' => 'old@example.com', 'password' => Hash::make('old-password')]);

        $this->actingAs($user)->putJson('/api/profile', [
            'username' => 'Updated', 'email' => 'new@example.com', 'current_password' => 'incorrect',
            'password' => 'new-password', 'password_confirmation' => 'different-password',
        ])->assertUnprocessable()->assertJsonValidationErrors(['current_password', 'password']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'old@example.com']);
        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
    }

    public function test_username_can_be_changed_without_password_and_guest_cannot_update_profile(): void
    {
        $user = User::factory()->create(['user_id' => '#123456789', 'email' => 'old@example.com']);

        $this->putJson('/api/profile', [])->assertUnauthorized();
        $this->actingAs($user)->putJson('/api/profile', ['username' => 'Updated', 'email' => 'old@example.com'])->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated']);
    }
}
