<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fiche extends Model
{
    use HasFactory;

    protected $table = 'prospect';
    public $timestamps = false;
    // protected $connection = 'mysql_application';
}
