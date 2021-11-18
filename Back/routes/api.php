<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::put('/UpdateE/{id}','EmployeeController@UpdateEmpbyId');
Route::delete('/deleteE/{id}','EmployeeController@deleteEmpbyId');

Route::get('/employees/{id}','EmployeeController@getEmpbyId');

Route::group(['middleware' => 'auth:sanctum'], function(){

    });


Route::post("login",[UserController::class,'index']);
Route::get('/employees','EmployeeController@getEmp');
    Route::post('/addEmp','EmployeeController@addEmp');
