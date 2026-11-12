<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        Customer::query()->upsert([
            ['full_name' => 'Thyrone Bryce', 'email' => 'thyrone@example.com', 'phone' => '0917-555-0101'],
            ['full_name' => 'Justine Jacob', 'email' => 'justine@example.com', 'phone' => '0917-555-0102'],
            ['full_name' => 'John Lorenz', 'email' => 'john@example.com', 'phone' => '0917-555-0103'],
            ['full_name' => 'King Ambulo', 'email' => 'king@example.com', 'phone' => '0917-555-0104'],
            ['full_name' => 'Maeko Gonzalo', 'email' => 'maeko@example.com', 'phone' => '0917-555-0105'],
        ], ['email'], ['full_name', 'phone']);
    }
}
