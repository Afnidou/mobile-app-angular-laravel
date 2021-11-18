<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        // \App\Models\User::factory(2)->create();
        DB::table('users')->insert([

            'email' => 'fnidou@etafat.com',
            'password' => Hash::make('123')
        ]);
    }
}
