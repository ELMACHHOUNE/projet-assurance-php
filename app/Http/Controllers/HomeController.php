<?php

namespace App\Http\Controllers;

use App\Models\Automobile;
use App\Models\Fiche;
use App\Models\transporteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class HomeController extends Controller
{

    public function store(Request $request)
    {

        $auto = new Transporteur();
        // $fiche = new Fiche;


        $auto->nom = $request->input('nom');
        $auto->prenom = $request->input('prenom');


        $auto->assure = $request->input('assure');

        $auto->motif = $request->input('motif');

        $auto->email = $request->input('email');
        $auto->telephone = $request->input('tele');
        $auto->date_transporteur = date("Y-m-d H:i:s");






        // if ($auto->ancienne == "NON")
        //     $auto->motif = "pas de motif";

        // $fiche->nom = $request->input('nom');
        // $fiche->prenom = $request->input('prenom');
        // $fiche->raison_sociale = $request->input('raison_sociale');
        // $fiche->activite = $request->input('activite');
        // $fiche->assure = $request->input('assure');
        // $fiche->ancienne = $request->input('ancienne');
        // $fiche->motif = $request->input('motif');
        // $fiche->code_postal = $request->input('code');
        // $fiche->telephone = $request->input('tele');
        // $fiche->email = $request->input('email');
        // $fiche->date_fiche = date("Y-m-d H:i:s");
        // $fiche->id_produit = 3;
        // $fiche->id_traitement = 1;
        // $fiche->dublique = 0;
        // $fiche->id_source = 1;
        // $fiche->id_motifcloture = 1;






        // $auto->save();
        // $fiche->save();


        // Obtenir le numéro de téléphone et retirer le premier '0'

        $telephone = $request->input('tele');
        if (substr($telephone, 0, 1) === '0') {
            $telephone = '+33' . substr($telephone, 1);
        }
        // Envoyer les données à l'API
        $data = [
            'name' => $request->input('nom'),
            'lastname' => $request->input('prenom'),
            'phone' => $telephone,
            'email' => $request->input('email'),
            'brithAt' => $request->input('brithAt'),


            'assure' => $request->input('assure'),
            'gender' => (int) $request->input('gender'),
            'lastAssure' => $request->input('lastAssure'),

            'typeProspect' => "2",
            'source' => "3",
            'activites' => "11",
            'url' => "19",
            'product_id' => 6
        ];

        // Convertir les données en JSON
        $jsonData = json_encode($data);

        // Initialisation de cURL
        $curl = curl_init();

        // Options de cURL
        curl_setopt_array($curl, [

            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $jsonData,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($jsonData)
            ],
        ]);

        // Exécution de la requête cURL
        $response = curl_exec($curl);

        // Fermer la session cURL
        curl_close($curl);
        $request->session()->flash('status', 'formulaire');

        return redirect('/assurance/retraite');
    }

    public function index()
    {
        return view('layout.form');
    }
}
