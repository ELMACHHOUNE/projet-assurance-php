@extends('master')
@section('contentform')

<br><br>
<div class="container containerjumbotron">
  <div class="row">

    <div class="col-12 col-lg-8 order-lg-1 order-2 mypadding0 mypadding1">
      <span class="titrePage">Assurance retraite complementaire </span>
      <br><br>
      <div class="overlay"></div>
      <img src="{{ asset('image/retraite.jpg') }}" class="imageform" width="100%" alt="Antécédents assurance pour transport marchandise">

    </div>
    <div class="col-12 col-lg-4 order-lg-2 order-1  mypadding0">
      <div class="card">
        <div class="card-header">
          Complétez ce formulaire pour obtenir une simulation
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
                <label for="brithAt">Date de naissance :</label>
                <input type="date" name="brithAt" class="form-control" id="brithAt">
              </div><br>

              <div class="col-lg-12">
                <select id="myselect00" name="lastAssure" class="form-control">
                  <option value="" selected>Montant mensuel à épargner :</option>
                  <option value="50€">50€</option>
                  <option value="100€">100€</option>
                  <option value="150€">150€</option>
                  <option value="200€">200€</option>
                  <option value="250€">250€</option>
                  <option value="300€">300€</option>
                  <option value="350€">350€</option>
                  <option value="400€">400€</option>
                  <option value="450€">450€</option>
                  <option value="500€">500€</option>
                </select>
              </div>
              <br>

              <div class="col-lg-12">
                <select id="myselect0" name="assure" class="form-control">
                  <option value="" selected>Age souhaité départ à la retraite :</option>
                  <option value="60">60</option>
                  <option value="61">61</option>
                  <option value="62">62</option>
                  <option value="63">63</option>
                  <option value="64">64</option>
                  <option value="65">65</option>
                </select>
              </div>


              <br>
              <div class="col-lg-12">
                <select id="myselect1" name="gender" class="form-control" id="gender">
                  <option value="" selected>Civilité :</option>
                  <option value="1">Mr</option>
                  <option value="2">Mme</option>
                </select>
              </div>

              <br>



              <div class="col-lg-12">
                <input type="email" id="email" name="email" class="form-control" placeholder="Email...">
              </div><br>

              <div class="col-lg-12">
                <input type="text" id="tele" name="tele" maxlength="10" class="form-control" placeholder="Téléphone...">
              </div>


              <br><br>
              <br>
              <p class="formtext">En cliquant sur ‘Comparer’, vous acceptez de transmettre vos
                informations à AKSAM ASSURANCES, qui accepte de les utiliser conformément
                à sa politique de confidentialité dans le but de vous fournir des
                propositions de devis d’assurances adapté à votre recherche</p>

              <br>
              <br>
              <input type="submit" name="confirmer" id="bt1" class="mybutton" value="Comparer maintenant" />
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>


</div>

<br><br>
@include('layout.bas-page')


@stop