<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFicheTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('prospect', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('activite');
            $table->string('assure');
            $table->string('code_postal');
            $table->string('email');
            $table->string('telephone');
            $table->date('date_fiche');
            $table->integer('id_produit');
            $table->integer('id_traitement');
            $table->integer('id_source');
            $table->integer('id_motifcloture');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fiche');
    }
}
