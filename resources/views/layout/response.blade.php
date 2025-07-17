@if (session()->has('status'))

@extends('master')
@section('contentresponse')




<section
  id="monsection"
  class="relative bg-scanlines min-h-[calc(100vh-56px)] w-full flex items-center justify-center px-4"
>
  <!-- Optional dark overlay (for better contrast) -->
  <div class="absolute inset-0 bg-black/40"></div>

  <!-- Content Box -->
  <div
    class="relative z-10 text-center text-white max-w-xl px-6 py-10 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl"
  >
    <!-- Icon -->
    <div class="flex justify-center mb-4">
      <div class="bg-white/20 p-3 rounded-full">
        <svg
          class="w-8 h-8 text-green-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>

    <!-- Title -->
    <h2 class="text-2xl sm:text-3xl font-bold mb-4">
      Votre demande de tarif est bien prise en compte
    </h2>

    <!-- Subtitle -->
    <p class="text-base sm:text-lg text-gray-100 mb-6">
      Vous recevrez notre offre personnalisée très bientôt.
    </p>

    <!-- CTA Button -->
    <a
      href="https://retraite-complementaire.aksam-assurances.fr/"
      class="inline-block px-6 py-3 bg-accent text-white font-medium rounded-full shadow-md hover:bg-accent/90 transition"
    >
      Revenir à l'accueil
    </a>
  </div>
</section>




@endsection

@else
<script>
    window.location = "https://retraite-complementaire.aksam-assurances.fr/";
</script>
@endif