


<table class="table" style="border: 1px solid black">
    <thead>
        <tr >
        <th style="border: 1px solid black" scope="col">usage</th>
            <th style="border: 1px solid black" scope="col">nom</th>
            <th style="border: 1px solid black" scope="col">prenom</th>
            <th style="border: 1px solid black" scope="col">Activite</th>
            <th style="border: 1px solid black" scope="col">Raison_sociale</th>
            <th style="border: 1px solid black" scope="col">Véhicule assuré actuellement</th>
            <th style="border: 1px solid black" scope="col">Ancienne assurance réslié</th>
            <th style="border: 1px solid black" scope="col">Motif de résiliation</th>
            <th style="border: 1px solid black" scope="col">telephone</th>
            <th style="border: 1px solid black" scope="col">email</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid black">{{ $data1['usage'] }}</td>
            <td style="border: 1px solid black">{{ $data1['nom'] }}</td>
            <td style="border: 1px solid black">{{ $data1['prenom'] }}</td>
            <td style="border: 1px solid black">{{ $data1['activite1'] }}</td>
            <td style="border: 1px solid black">{{ $data1['raison_sociale'] }}</td>
            <td style="border: 1px solid black">{{ $data1['assure'] }}</td>
            <td style="border: 1px solid black">{{ $data1['ancienne'] }}</td>
            <td style="border: 1px solid black">{{ $data1['motif'] }}</td>
            <td style="border: 1px solid black">{{ $data1['telephone'] }}</td>
            <td style="border: 1px solid black">{{ $data1['email'] }}</td>
        </tr>

    </tbody>
</table>


