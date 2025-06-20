@if (session()->has('status'))

@extends('master')
@section('contentresponse')

<section id="monsection">
    <div class="container">
        <div class="row">
            <div class="col-sm">
                <div class="jumbotron jumbotron-fluid jumbotronresilie ">
                    <div class="container">
                        <img src="{{ asset('image/verifie.jpg') }}" class="img-fluid" alt="Responsive image"
                            width="190px">
                        <br>
                        <br>
                        <!-- <i class="fa fa-check-square-o" aria-hidden="true" style="height: 150px; color: #cf7b27;"></i> -->
                        <p class="sucessmsg">Votre demande de tarif est prise en compte, vous recevez notre offre
                            rapidement</p>
                        <br>
                        <br>
                        <br>
                        <br>
                        <p class="msgre"><a href="https://assurance-flotte-entreprise.aksam-assurances.fr">Revenir à l'accueil</a></p>
                    </div>
                </div>
            </div>
        </div>
</section>


<br><br><br><br>

@endsection

@else
<script>
    window.location = "https://assurance-flotte-entreprise.aksam-assurances.fr";
</script>
@endif