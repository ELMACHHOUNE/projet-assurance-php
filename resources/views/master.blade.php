<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script>
       tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: "#1E3A8A",
              secondary: "#38BDF8",
              accent: "#F59E0B",
              success: "#10B981",
              warning: "#FB923C",
              danger: "#EF4444",
              dark: "#0F172A",
              light: "#F8FAFC",
              surface: "#FFFFFF",
              surfaceHover: "#F1F5F9",
            },

            fontFamily: {
              sans: ["Plus Jakarta Sans", "sans-serif"],
            },
            backgroundImage: {
              "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
          },
        },
      };
    </script>
    <meta name="author" content="Aksam Assurance">
    <link rel="shortcut icon" type="image/png" href="{{ asset('image/favicon.png') }}">
    <link rel=apple-touch-icon type="icon" href="{{ asset('image/logo.png') }}">
    <title>@yield('title', 'Accueil - Assurances flotte des entreprises')</title>
    <meta name="description" content="Devis pour une assurances flotte des entreprises complémentaire en ligne et en quelque clics.">
    <meta name="keywords" content="@yield('meta_keywords', 'Assurance flotte des entreprises,Assurance épargne flotte des entreprises, Épargne flotte des entreprises ')">




    <!-- Google Tag Manager -->
    <script>
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-M7ZKTLS');
    </script>
    <!-- End Google Tag Manager -->

    <!-- Google tag (gtag.js) -->
    <script type="text/plain" data-cookieconsent="statistics" async src="https://www.googletagmanager.com/gtag/js?id=G-7GKKQW2YCH"></script>
    <script type="text/plain" data-cookieconsent="statistics">
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());

        gtag('config', 'G-7GKKQW2YCH');
    </script>

    <!-- Script de gestion du consentement -->
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500 // Optionnel : attendre la mise à jour avant d'envoyer les données.
        });

        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        document.addEventListener('DOMContentLoaded', function() {
            if (document.cookie.indexOf('displayCookieConsent=y') >= 0) {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'analytics_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                });
            }
        });
    </script>
    <!-- Global site tag (gtag.js) - Google Ads -->

    <script type="text/plain" data-cookieconsent="marketing" async src="https://www.googletagmanager.com/gtag/js?id=AW-716366483"></script>
    <script type="text/plain" data-cookieconsent="marketing">
        window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-716366483');
</script>
    <!-- End Global site tag (gtag.js) - Google Ads -->
    <!-- Cookies  -->
    <script>
        gaProperty = 'GTM-M7ZKTLS'

        // Désactive le tracking si le cookie d'acception des conditions n'est pas présent
        var disableStr = 'ga-disable-' + gaProperty;

        if (document.cookie.indexOf('displayCookieConsent=y') < 0) {
            window[disableStr] = true;
        }
    </script>
    <!-- End Cookies  -->


</head>


<body class="bg-gradient-to-br from-light via-white to-light min-h-screen">
    <!-- Header Navigation - Simplified for legal page -->
    <header
      class="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <!-- Title -->
          <div class="flex items-center">
            <h1
              class="text-[0.7rem] sm:text-base font-semibold text-primary hidden sm:block"
            >
              <span class="typing-text"></span
              ><span class="typing-cursor">|</span>
            </h1>
          </div>

          <!-- Contact Button -->
          <div class="flex justify-center items-center sm:hidden w-full">
            <a
              href="tel:0182834800"
              class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-accent hover:bg-accent/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              01.82.83.48.00
            </a>
          </div>
          <div class="items-center hidden sm:flex">
            <a
              href="tel:0182834800"
              class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-accent hover:bg-accent/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              01.82.83.48.00
            </a>
          </div>
        </div>
      </nav>
    </header>

    <!--/ Header end -->

    <style>
      .typing-cursor {
        display: inline-block;
        animation: blink 1s step-end infinite;
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
    </style>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M7ZKTLS" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->


    @yield('contentform')
    @yield('contentresponse')
    @yield('content-poltique')
    @yield('content-mention')
    @yield('formtest')






    <!-- Footer -->
    <footer class="bg-primary text-white mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">Aksam Assurance</h3>
            <p class="text-gray-400">
            Votre partenaire de confiance pour l'assurance de votre flotte
            automobile professionnelle.
            </p>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Liens utiles</h3>
            <ul class="space-y-2">
              <li>
                <a
                  href="{{ url('/mention-legale') }}"
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  Mentions légales
                </a>
              </li>
              <li>
                <a
                  href="{{ url('/politique-legale') }}"
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Contact</h3>
            <ul class="space-y-2 text-gray-400">
              <li>10 rue de Penthièvre</li>
              <li>75008 Paris</li>
              <li>01.82.83.48.00</li>
              <li>contact@aksam-assurances.fr</li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
        >
          <p>© 2025 Aksam Assurance. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.js"></script>
    <script src="{{ asset('/js/app.js') }}"></script>

    <script src="{{ asset('/js/cookiechoices.js') }}"></script>

    <!-- Consent Cookies   -->
    <script>
        document.addEventListener('DOMContentLoaded', function(event) {
            if (document.cookie.indexOf('aksamPerformance') < 0) {
                cookieChoices.showCookieConsentBar(
                    'assurance-flotte-entreprise.aksam-assurances.fr utilise des cookies pour vous offrir le meilleur service. En poursuivant, vous acceptez l\'utilisation des cookies.',
                    'J\'accepte',
                    ' En savoir plus ',
                    ' mentions-legales ',
                    ' Ouvrir les paramètres ');
            }
        });
    </script>

    <script src="https://www.google-analytics.com/analytics.js"></script>
    <script>



document.addEventListener("DOMContentLoaded", function () {
        const text =
          "Quel que soit votre activité, obtenez un devis d'assurance pour votre flotte en quelques clics";
        const typingText = document.querySelector(".typing-text");
        const cursor = document.querySelector(".typing-cursor");

        // Remove the cursor initially
        cursor.style.display = "none";

        let i = 0;
        let isErasing = false;
        const typingSpeed = 20;
        const erasingSpeed = 10;
        const delayAfterTyping = 800;
        const delayAfterErasing = 500;

        function typeWriter() {
          if (!isErasing && i < text.length) {
            typingText.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, typingSpeed);
          } else if (!isErasing && i === text.length) {
            cursor.style.display = "inline-block";
            setTimeout(() => {
              isErasing = true;
              cursor.style.display = "none";
              setTimeout(typeWriter, delayAfterTyping);
            }, delayAfterTyping);
          } else if (isErasing && i > 0) {
            typingText.textContent = text.substring(0, i - 1);
            i--;
            setTimeout(typeWriter, erasingSpeed);
          } else if (isErasing && i === 0) {
            isErasing = false;
            cursor.style.display = "none";
            setTimeout(typeWriter, delayAfterErasing);
          }
        }

        // Start typing animation
        typeWriter();

        // Rest of your existing GSAP animations...
        gsap.registerPlugin(ScrollTrigger);

        // Header Animation
        gsap.from("header", {
          duration: 1,
          y: -50,
          opacity: 0,
          ease: "power3.out",
        });

        // Hero Section Animation
        gsap.from(".hero-section", {
          duration: 1,
          y: 100,
          opacity: 0,
          ease: "power3.out",
        });

        // Simulation Section Animation
        gsap.from("#simulation", {
          scrollTrigger: {
            trigger: "#simulation",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power2.out",
        });

        // About Section Animation
        gsap.from("#about", {
          scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power2.out",
        });

        // PER Section Animation
        gsap.from("#per", {
          scrollTrigger: {
            trigger: "#per",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power2.out",
        });

        // Avantages Section Animation
        gsap.from("#avantages", {
          scrollTrigger: {
            trigger: "#avantages",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 1,
          y: 50,
          opacity: 0,
          ease: "power2.out",
        });

        // Footer Animation
        gsap.from("footer", {
          scrollTrigger: {
            trigger: "footer",
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          duration: 1,
          y: 30,
          opacity: 0,
          ease: "power2.out",
        });

        // Stagger animations for list items
        gsap.utils.toArray("ul li").forEach((list) => {
          gsap.from(list, {
            scrollTrigger: {
              trigger: list,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            duration: 0.5,
            y: 20,
            opacity: 0,
            ease: "power2.out",
          });
        });

        // Form elements animation
        gsap.from("form input, form select", {
          scrollTrigger: {
            trigger: "form",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 0.5,
          x: 100,
          opacity: 0,
          stagger: 0.1,
          ease: "power2.out",
        });

        // Form container animation
        gsap.from(".lg\\:col-span-1.order-first.lg\\:order-last", {
          scrollTrigger: {
            trigger: "#simulation",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 0.8,
          x: 200,
          opacity: 0,
          ease: "power2.out",
        });

        // Fresh up button animation
        gsap.from(".fresh-up-button", {
          scrollTrigger: {
            trigger: "#avantages",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          duration: 0.8,
          y: 50,
          opacity: 0,
          scale: 0.8,
          ease: "back.out(1.7)",
        });
      });
    </script>

    <script type="application/ld+json">
        {
            "@context": "http://schema.org",
            "@type": "LocalBusiness",
            "name": "Aksam Assurance",
            "image": "https://www.lassurance-des-transporteurs.fr/assets/img/favicon.png",
            "telephone": "01 82 83 48 00",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "10 rue de Penthièvre",
                "addressCountry": "FR",
                "addressLocality": "PARIS",
                "postalCode": "75008"
            },
            "url": "https://www.lassurance-des-transporteurs.fr",
            "priceRange": "€€",
            "openingHours": "Mo-Fr 09:00-18:00",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+33 1 82 83 48 00",
                "contactType": "Customer Service",
                "availableLanguage": ["French", "English"]
            }
        }
    </script>


</body>



</html>