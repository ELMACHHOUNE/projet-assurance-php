<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAutomobilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vtc_form', function (Blueprint $table) {
            $table->increments('id');
            $table->string('usage');
            $table->string('nom');
            $table->string('prenom');
            $table->string('activite1');
            $table->string('raison_sociale');
            $table->string('assure');
            $table->string('ancienne');
            $table->string('motif');
            $table->string('email');
            $table->string('telephone');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('flotte');
    }
}
