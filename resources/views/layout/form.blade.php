@extends('master')
@section('contentform')

<main id="simulation" class="w-full">
      <!-- Hero Section -->
      <section class="relative w-full min-h-screen">
        <div class="absolute inset-0 w-full h-full">
          <video
            src="./assets/retraite.mp4"
            autoplay
            loop
            muted
            playsinline
            class="w-full h-full object-cover"
          ></video>
          <div
            class="absolute inset-0 bg-gradient-to-r from-primary/95 to-accent/80"
          ></div>
        </div>
        <div class="relative z-10 max-w mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <!-- Left side: Image and Text -->
            <div
              class="order-2 lg:order-1 lg:col-span-2 relative flex justify-center items-center rounded-xl shadow-2xl overflow-hidden"
            >
              <img
                src="./assets/assurance_retraite.png"
                alt="Couple souriant et satisfait tenant un relevé de pension"
                class="w-full h-full object-cover"
              />

              <!-- Text content overlay on image -->
              <div
                class="absolute inset-0 flex flex-col justify-end items-center text-white text-center p-8 bg-gradient-to-t from-black/70 to-transparent"
              >
                <div class="inline-block p-2 rounded-lg bg-black/5">
                  
                </div>
              </div>
            </div>

            <!-- Right side - Form -->
            <div
              class="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20 order-1 lg:order-2 lg:col-span-1"
            >
              <div class="bg-gradient-to-r from-accent to-accent/80 px-6 py-4">
                <h3 class="text-xm font-semibold text-white flex items-center">
                  <svg
                    class="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Complétez ce formulaire pour obtenir une simulation
                </h3>
              </div>
              <div class="p-6">
                <form
                  id="simulationForm"
                  class="space-y-3"
                  onsubmit="return handleFormSubmit(event)"
                >
                  <!-- Personal Info -->
                  <div>
                    <label
                      for="nom"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Nom :</label
                    >
                    <input
                      type="text"
                      name="nom"
                      id="nom"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                      placeholder="Votre nom..."
                    />
                  </div>

                  <div>
                    <label
                      for="prenom"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Prénom :</label
                    >
                    <input
                      type="text"
                      name="prenom"
                      id="prenom"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                      placeholder="Votre prénom..."
                    />
                  </div>

                  <div>
                    <label
                      for="brithAt"
                      class="block text-sm font-medium text-gray-700 mb-1"
                      >Date de naissance :</label
                    >
                    <input
                      type="date"
                      name="brithAt"
                      id="brithAt"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                    />
                  </div>

                  <div>
                    <select
                      name="lastAssure"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                    >
                      <option value="" selected>
                        Montant mensuel à épargner :
                      </option>
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

                  <div>
                    <select
                      name="assure"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                    >
                      <option value="" selected>
                        Age souhaité départ à la retraite :
                      </option>
                      <option value="60">60 ans</option>
                      <option value="61">61 ans</option>
                      <option value="62">62 ans</option>
                      <option value="63">63 ans</option>
                      <option value="64">64 ans</option>
                      <option value="65">65 ans</option>
                    </select>
                  </div>

                  <div>
                    <select
                      name="gender"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                    >
                      <option value="" selected>Civilité :</option>
                      <option value="1">Mr</option>
                      <option value="2">Mme</option>
                    </select>
                  </div>

                  <!-- Contact Info -->
                  <div>
                    <input
                      type="email"
                      name="email"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                      placeholder="Email..."
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="tele"
                      pattern="[0-9]{10}"
                      maxlength="10"
                      class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                      placeholder="Téléphone..."
                    />
                  </div>

                  <!-- Additional Info -->

                  <!-- Retirement Info -->

                  <p
                    class="text-[10px] text-gray-600 bg-white/80 p-2 rounded-md border border-gray-200"
                  >
                    En cliquant sur 'Comparer', vous acceptez de transmettre vos
                    informations à AKSAM ASSURANCES, qui accepte de les utiliser
                    conformément à sa politique de confidentialité dans le but
                    de vous fournir des propositions de devis d'assurances
                    adapté à votre recherche
                  </p>

                  <button
                    type="submit" name="confirmer" id="bt1"
                    class="w-full bg-gradient-to-r from-accent to-accent/80 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center text-sm"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    Comparer maintenant
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Sections Container -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <!-- About Section -->
        <section id="assurance-info" class="scroll-mt-20">
          <div class="bg-white rounded-xl shadow-xl p-8">
            <h2 class="text-2xl md:text-3xl font-bold text-primary mb-6">
              I.Assurance épargne retraite
            </h2>
            <p class="text-base md:text-lg text-gray-700 mb-8">
              L'assurance retraite complémentaire est un contrat d'assurance qui
              permet à un individu de se constituer une rente ou un capital
              supplémentaire pour compléter sa pension de retraite de base. Elle
              est généralement souscrite à titre individuel ou proposée par
              l'employeur dans le cadre d'un dispositif collectif.
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              1.Qu'est-ce que le PER
            </h3>
            <p class="text-base text-gray-700 mb-8">
              Le PER est un produit d'épargne à long terme lancé en 2019 pour
              préparer sa retraite. Il remplace les anciens dispositifs comme le
              PERP ou Madelin. L'argent est généralement bloqué jusqu'à la
              retraite (sans exceptions).
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              2.Les 3 types de PER:
            </h3>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>
                <strong>PER individuel (PERI) :</strong> ouvert par tout
                particulier.
              </li>
              <li>
                <strong>PER d'entreprise obligatoire :</strong> mis en place par
                l'employeur.
              </li>
              <li>
                <strong>PER collectif (PERCOL) :</strong> accessible via
                l'entreprise, mais facultatif.
              </li>
            </ul>

            <h3 class="text-xl font-bold text-primary mb-4">
              3.Que peut-on y mettre
            </h3>
            <p class="text-base text-gray-700 mb-8">
              Les versements peuvent être déduits du revenu imposable, dans la
              limite :
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              4.Avantage fiscal à l'entrée
            </h3>
            <p class="text-base text-gray-700">
              Des actions, ETF, fonds en euros, private equity, etc. Grande
              liberté de choix pour construire son portefeuille.
            </p>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>10% des revenus nets (max 35 194 € pour salariés)</li>
              <li>Jusqu'à 85 780 € pour les indépendants (TNS)</li>
            </ul>
            <p class="text-base text-gray-700 mb-8">
              Plus votre impôt est élevé, plus le PER est avantageux
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              5.Fiscalité à la sortie
            </h3>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>
                Le capital est imposé (revenu + flat tax sur les plus-values).
              </li>
              <li>
                La rente viagère est fiscalement moins intéressante que la
                sortie en capital.
              </li>
            </ul>

            <h3 class="text-xl font-bold text-primary mb-4">6.En résumé</h3>
            <p class="text-base text-gray-700">
              Le PER est très pertinent pour les contribuables fortement
              imposés**, surtout les indépendants. Il permet d'optimiser sa
              retraite grâce à **l'effet de levier fiscal**, mais il faut bien
              comprendre la fiscalité et choisir un contrat peu chargé en frais.
            </p>
          </div>
        </section>

        <!-- Avantages Section -->
        <section id="avantages" class="scroll-mt-20 text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-primary mb-8">
            Devis assurance épargne retraite
          </h2>
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <div class="space-y-6">
              <p class="text-base text-gray-700">
                Compléter le formulaire à la droite de cette page afin d'obtenir
                une étude pour un plan d'épargne retraite adapté à votre
                situation et vos revenus.
              </p>
              <a
                href="#simulation"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 fresh-up-button"
              >
                Commencer ma simulation
                <svg
                  class="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19V5m0 0l-7 7m7-7l7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>

@stop