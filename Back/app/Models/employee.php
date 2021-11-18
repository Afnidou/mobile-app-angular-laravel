<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class employee extends Model
{
    use HasFactory;
    public $timestamps=false;
    // protected $postgisFields=['geometrie'];
    // protected $table="employees";
    // protected $casts = [
    //     'geometrie' => 'array',
    // ];
    protected $fillable =['Designation','name','categorie','surface','perimetre','geometrie'];
}
