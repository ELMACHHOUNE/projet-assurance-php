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
        <div
          class="relative z-10 max-w mx-auto px-4 sm:px-6 lg:px-8 py-16 h-full flex items-center"
        >
          <div
            class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full min-h-[600px] lg:min-h-[700px]"
          >
            <!-- Left side: Image and Text -->
            <div
              class="order-2 lg:order-1 lg:col-span-2 relative flex justify-center items-center rounded-xl shadow-2xl overflow-hidden h-full"
            >
              <img
                src="./assets/assurance-flotte-entreprise.webp"
                alt="Couple souriant et satisfait tenant un relevé de pension"
                class="w-full h-full object-cover"
              />

              <!-- Text content overlay on image -->
              <div
                class="absolute inset-0 flex flex-col justify-end items-center text-white text-center p-8 bg-gradient-to-t from-black/70 to-transparent"
              >
                <div class="inline-block p-2 rounded-lg bg-black/5"></div>
              </div>
            </div>

            <!-- Right side - Form -->
            <div
              class="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/20 order-1 lg:order-2 lg:col-span-1 flex flex-col h-full"
            >
              <div
                class="bg-gradient-to-r from-accent to-accent/80 px-6 py-4 flex-shrink-0"
              >
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
                  Complétez ce formulaire pour obtenir un tarif
                </h3>
              </div>
              <div class="p-6 flex-1 flex flex-col">
                <form
                  id="simulationForm"
                  class="space-y-3 flex-1 flex flex-col"
                  onsubmit="return handleFormSubmit(event)"
                >
                  <!-- Personal Info -->
                  <div class="flex-1 space-y-3">
                    <div>
                      <input
                        type="text"
                        name="nom"
                        id="nom"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Nom..."
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="prenom"
                        id="prenom"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Prénom..."
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="raison_sociale"
                        id="raison_sociale"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Raison sociale..."
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="activite1"
                        id="activite1"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Activité..."
                      />
                    </div>

                    <div>
                      <select
                        id="myselect00"
                        name="activite"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        title="Démarrage d'activité"
                      >
                        <option value="" selected>Démarrage d'activité</option>
                        <option value="OUI">OUI</option>
                        <option value="NON">NON</option>
                      </select>
                    </div>

                    <div>
                      <select
                        id="myselect0"
                        name="assure"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        title="Flotte assuré actuellement"
                      >
                        <option value="" selected>
                          Flotte assuré actuellement
                        </option>
                        <option value="OUI">OUI</option>
                        <option value="NON">NON</option>
                      </select>
                    </div>

                    <div>
                      <select
                        id="myselect1"
                        name="ancienne"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        title="Assurance résilié"
                      >
                        <option value="" selected>Assurance résilié</option>
                        <option value="OUI">OUI</option>
                        <option value="NON">NON</option>
                      </select>
                    </div>

                    <div id="motif-container">
                      <select
                        id="myselect2"
                        name="motif"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        title="Motif résiliation"
                      >
                        <option value="" selected>Motif résiliation</option>
                        <option value="Sinistre">Sinistre</option>
                        <option value="Non paiement">Non paiement</option>
                        <option value="Suspension de permis">
                          Suspension de permis
                        </option>
                        <option value="Fausse déclaration">
                          Fausse déclaration
                        </option>
                        <option value="Echéance">Echéance</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        maxlength="5"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Code Postal..."
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Email..."
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        id="tele"
                        name="tele"
                        maxlength="10"
                        class="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-200 bg-white/80 text-sm"
                        placeholder="Téléphone..."
                      />
                    </div>

                    <p
                      class="text-[10px] text-gray-600 bg-white/80 p-2 rounded-md border border-gray-200"
                    >
                      En cliquant sur 'Comparer', vous acceptez de transmettre
                      vos informations à AKSAM ASSURANCES, qui accepte de les
                      utiliser conformément à sa politique de confidentialité
                      dans le but de vous fournir des propositions de devis
                      d'assurances adapté à votre recherche
                    </p>
                  </div>

                  <button
                    type="submit"
                    class="w-full bg-gradient-to-r from-accent to-accent/80 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center text-sm flex-shrink-0"
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
              Assurance flotte
            </h2>
            <h3 class="text-xl font-bold text-primary mb-4">
              1. Assurance flotte automobile
            </h3>
            <p class="text-base md:text-lg text-gray-700 mb-8">
              L'assurance flotte automobile est un contrat d'assurance unique
              dédié aux assurés propriétaires d'un parc automobile composé d'au
              moins 5 véhicules à moteur.
            </p>
            <p class="text-base md:text-lg text-gray-700 mb-8">
              Appelé aussi contrat assurance parc automobile, le fait de
              regrouper tous les véhicules sous une même assurance permettent
              d'économiser jusqu'à 30% sur la cotisation totale de l'assurance
              du parc automobile mais aussi être dispensé d'indiquer à
              l'assureur les noms des conducteurs salariés et/intérimaire de
              l'entreprise.
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              2. Assurance flotte véhicule
            </h3>
            <p class="text-base text-gray-700 mb-4">
              Il existe 2 types de contrats d'assurance flotte véhicule :
            </p>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>
                <strong>Contrat assurance flotte véhicule ouvert :</strong> dans
                ce cas le nombre et les caractéristiques des véhicules assurés
                ne sont pas connus. Ce type de contrat concerne le plus souvent
                les grosses flottes automobiles (par exemple, supérieure à 50
                véhicules).
              </li>
              <li>
                <strong>Contrat assurance flotte véhicule fermé :</strong> dans
                ce cas, le nombre et les caractéristiques des véhicules sont
                connues et quand un nouveau véhicule est inclus dans le contrat,
                la cotisation augmente.
              </li>
            </ul>

            <h2 class="text-2xl md:text-3xl font-bold text-primary mb-6">
              Assurance flotte professionnel
            </h2>

            <h3 class="text-xl font-bold text-primary mb-4">
              1. Assurance flotte automobile professionnelle
            </h3>
            <p class="text-base text-gray-700 mb-8">
              Toute entreprise et quelle que soit son activité principale ou
              annexe, disposant d'un par de véhicule à moteur est amené à
              souscrire un contrat d'assurance flotte pro. La principale
              caractéristique de ce contrat est que le coefficient bonus-malus
              ne rentre pas en considération pour le calcul de la cotisation.
            </p>
            <p class="text-base text-gray-700 mb-8">
              En effet dans le cas d'une assurance flotte véhicule entreprise
              les conducteurs des véhicules ne sont pas désignés. En parle de
              contrat en tout conducteur.
            </p>

            <h3 class="text-xl font-bold text-primary mb-4">
              2. Assurance flotte véhicule entreprise
            </h3>
            <p class="text-base text-gray-700 mb-4">
              Les garanties incluses dans le contrat d'assurance flotte pour
              entreprise sont:
            </p>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>Dommages aux biens</li>
              <li>Responsabilité civile</li>
              <li>Assistance</li>
              <li>Remboursement « valeur à neuf »</li>
              <li>Versement d'indemnités journalière</li>
              <li>Prise en charge panne mécanique</li>
              <li>Bris de glaces</li>
              <li>Défense et recours</li>
            </ul>

            <h3 class="text-xl font-bold text-primary mb-4">
              Devis assurance flotte professionnel
            </h3>
            <p class="text-base text-gray-700 mb-4">
              Pour obtenir un devis assurance flotte professionnel il faudra
              communiquer à l'assureur les éléments suivants :
            </p>
            <ul
              class="list-disc list-inside space-y-2 text-base text-gray-700 mb-8"
            >
              <li>
                Etat de parc reprenant l'ensembles des véhicules à assurer avec
                leurs statistiques sinistres
              </li>
              <li>
                Antécédents d'assurance afin de déterminer le motif de
                résiliations de l'ancienne assurance
              </li>
              <li>KBIS de la société</li>
            </ul>
          </div>
        </section>

        <!-- Avantages Section -->
        <section id="avantages" class="scroll-mt-20 text-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-primary mb-8">
            Devis assurance flotte automobile
          </h2>
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <div class="space-y-6">
              <p class="text-base text-gray-700">
                Complétez le formulaire ci-dessus pour obtenir une étude
                personnalisée de votre assurance flotte automobile. Notre équipe
                analysera vos besoins spécifiques et vous proposera la meilleure
                solution adaptée à votre parc de véhicules.
              </p>
              <a
                href="#simulation"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 fresh-up-button"
              >
                Obtenir mon tarif
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