<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class PosAccountSeeder extends Seeder
{
    public function run(): void
    {
        Customer::insert([
           ['full_name' => 'Ana Santos', 'email' => 'ana.santos@gmail.com', 'phone' => '0917 555 0101'],
['full_name' => 'Miguel Reyes', 'email' => 'miguel.reyes@gmail.com', 'phone' => '0917 555 0102'],
['full_name' => 'Bea Cruz', 'email' => 'bea.cruz@gmail.com', 'phone' => '0917 555 0103'],
['full_name' => 'Carlo Garcia', 'email' => 'carlo.garcia@gmail.com', 'phone' => '0917 555 0104'],
['full_name' => 'Dana Flores', 'email' => 'dana.flores@gmail.com', 'phone' => '0917 555 0105'],
        ]);

        User::insert([
            ['username' => 'lia.mendoza', 'full_name' => 'Lia Mendoza'],
            ['username' => 'noel.ramos', 'full_name' => 'Noel Ramos'],
            ['username' => 'paolo.lim', 'full_name' => 'Paolo Lim'],
            ['username' => 'rina.villanueva', 'full_name' => 'Rina Villanueva'],
            ['username' => 'sam.torres', 'full_name' => 'Sam Torres'],
        ]);
    }
}
