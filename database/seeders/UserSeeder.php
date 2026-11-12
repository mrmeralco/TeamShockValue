<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->upsert([
            ['username' => 'thyrone.bryce', 'full_name' => 'Thyrone Bryce D. Barroquillo'],
            ['username' => 'justine.jacob', 'full_name' => 'Justine Jacob'],
            ['username' => 'johm.lorenz', 'full_name' => 'John Lorenz'],
            ['username' => 'king.ambulo', 'full_name' => 'King Ambulo'],
            ['username' => 'maeko.gonzalo', 'full_name' => 'Maeko Gonzalo'],
        ], ['username'], ['full_name']);
    }
}
