<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'App\Http\Controllers\HomeController@index');


Route::get('assurance/retraite', function () {

    return view('layout.response');
});


Route::get('/politique-legale', function () {

    return view('layout.politique');
});

Route::get('/mention-legale', function () {

    return view('layout.mention');
});

Route::get('/formtest', function () {

    return view('layout.formtest');
});



Route::post('/', 'App\Http\Controllers\HomeController@store');
