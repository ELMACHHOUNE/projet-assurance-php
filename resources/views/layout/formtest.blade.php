@extends('master')
@section('formtest')

<br><br>
<div class="container containerjumbotron">
  <div class="row">

    <div class="col-12 col-lg-8 order-lg-1 order-2 mypadding0 mypadding1">
      <span class="titrePage">Assurance transport de marchandise (TPM)</span>
      <br><br>
      <div class="overlay"></div>
      <img src="{{ asset('image/imagetest.jpg') }}" class="imageform" width="100%" alt="Antécédents assurance pour transport marchandise">

    </div>
    <div class="col-12 col-lg-4 order-lg-2 order-1  mypadding0">
      <div class="card">
        <div class="card-header">
          Complétez ce formulaire pour obtenir un tarif
        </div>
        <div class="card-body">
          <form action="/" method="POST">
            @csrf
            <div class="form-row">
              <div class="col-lg-12">
                <input type="text" name="nom" class="form-control" id="nom" placeholder="Nom...">
              </div><br>
              <div class="col-lg-12">
                <input type="text" name="prenom" class="form-control" id="prenom" placeholder="Prénom...">
              </div><br>
              <div class="col-lg-12">
                <input type="text" name="raison_sociale" class="form-control" id="marque" placeholder="Raison Sociale...">
              </div><br>
              <div class="col-lg-12">
                <select id="myselect00" name="activite" class="form-control">
                  <option value="" selected>Démarrage d’activité ?</option>
                  <option value="OUI">OUI</option>
                  <option value="NON">NON</option>
                </select>
              </div>
              <br>

              <div class="col-lg-12">
                <select id="myselect0" name="assure" class="form-control">
                  <option value="" selected>Véhicule assuré actuellement ?</option>
                  <option value="OUI">OUI</option>
                  <option value="NON">NON</option>
                </select>
              </div>


              <br>
              <div class="col-lg-12">
                <select id="myselect1" name="ancienne" class="form-control">
                  <option value="" selected>Ancienne assurance résilié ?</option>
                  <option value="OUI">OUI</option>
                  <option value="NON">NON</option>
                </select>
              </div>

              <br>
              <div class="col-lg-12">
                <select id="myselect2" name="motif" class="form-control">
                  <option value="" selected>Motif résiliation</option>
                  <option value="5">Sinistre</option>
                  <option value="4">Non paiement</option>
                  <option value="6">Suspension de permis</option>
                  <option value="7">Fausse déclaration</option>
                  <option value="3">Echéance</option>
                </select>
              </div>
              <br>
              <div class="col-lg-12">
                <input type="text" id="code" name="code" maxlength="5" class="form-control" placeholder="Code Postal...">
              </div><br>

              <div class="col-lg-12">
                <input type="email" id="email" name="email" class="form-control" placeholder="Email...">
              </div><br>

              <div class="col-lg-12">
                <input type="text" id="tele" name="tele" maxlength="10" class="form-control" placeholder="Téléphone...">
              </div>


              <br><br>
              <p class="formtext">En cliquant sur ‘Comparer’, vous acceptez de transmettre vos
                informations à AKSAM ASSURANCES, qui accepte de les utiliser conformément
                à sa politique de confidentialité dans le but de vous fournir des
                propositions de devis d’assurances adapté à votre recherche</p>
              <input type="submit" name="confirmer" id="bt1" class="mybutton" value="Comparer maintenant" />
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>


</div>

<br><br>

@stop