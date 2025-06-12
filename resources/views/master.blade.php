<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="{{ asset('/css/app.css') }}" />
    <link rel="stylesheet" href="{{ asset('/css/theme.css') }}" />
    <meta name="author" content="Aksam Assurance">
    <link rel="shortcut icon" type="image/png" href="{{ asset('image/favicon.png') }}">
    <link rel=apple-touch-icon type="icon" href="{{ asset('image/logo.png') }}">
    <title>@yield('title', 'Accueil - Assurance retraite complémentaire')</title>
    <meta name="description" content="Devis pour une assurance retraite complémentaire en ligne et en quelque clics.">
    <meta name="keywords" content="@yield('meta_keywords', 'Assurance complémentaire retraite,Assurance épargne retraite, Épargne retraite ')">




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

<!-- Header start -->
<header id="header" class="header">



    <nav class="navbar navlogo">



        <h1 class="ml10">
            <span class="text-wrapper col">
                <span class="letters ">Obtenez votre simulation pour une assurance complementaire retraite en ligne </span>
            </span>
        </h1>



        <div class="col-lg-4 col-md-5 myicon">
            <a href="tel:0182834800"><i class="fa fa-phone-square" aria-hidden="true"></i>
                <span class="tele">&nbsp;01.82.83.48.00
                </span></a>



        </div>


    </nav>
    <!--/ Navigation end-->
</header>
<!--/ Header end -->

<body>

    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M7ZKTLS" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->


    @yield('contentform')
    @yield('contentresponse')
    @yield('content-poltique')
    @yield('content-mention')
    @yield('formtest')






    <br><br>

    <footer id="myfooter">

        <!-- Copyright -->
        <div class="footer-copyright text-center py-3">© 2025 Copyright:
            <a class="aksam" href="https://www.aksam-assurances.fr/"> aksam-assurances</a>
            <a class="aksam" href="{{url('/mention-legale')}}"> Mentions légales</a>
            <span>|</span>
            <a class="aksam" href="{{url('/politique-legale')}}"> Politique de confidentialité</a>
        </div>
        <!-- Copyright -->

    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.js"></script>
    <script src="{{ asset('/js/app.js') }}"></script>

    <script src="{{ asset('/js/cookiechoices.js') }}"></script>

    <!-- Consent Cookies   -->
    <script>
        document.addEventListener('DOMContentLoaded', function(event) {
            if (document.cookie.indexOf('aksamPerformance') < 0) {
                cookieChoices.showCookieConsentBar(
                    'retraite-complementaire.aksam-assurances.fr utilise des cookies pour vous offrir le meilleur service. En poursuivant, vous acceptez l\'utilisation des cookies.',
                    'J\'accepte',
                    ' En savoir plus ',
                    ' mentions-legales ',
                    ' Ouvrir les paramètres ');
            }
        });
    </script>

    <div class="modal fade" id="openModaleCookie">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">

                <!-- Modal Header -->
                <div class="modal-header">
                    <h5 class="modal-title">Vos paramètres de confidentialité pour notre site Web</h5>
                </div>

                <!-- Modal body -->
                <div class="modal-body">
                    <p class="modal-description">La sécurité de vos données personnelles est une priorité pour nous. C'est la raison pour laquelle vous avez un contrôle total sur les informations que nous pouvons traiter. Quel que soit votre choix, nous nous engageons à respecter scrupuleusement le cadre réglementaire strict du règlement général sur la Protection des Données (RGPD).</p>
                    <label>Cookie de perfomances :</label>
                    <br>
                    <label class="switch"><input id="cookieAccepte" type="checkbox" checked><span class="slider round"></span></label>
                    <br>
                    <br>
                </div>

                <!-- Modal footer -->
                <div class="modal-footer">
                    <button type="button" id="userPref" class="btn btn-secondary black small" data-dismiss="modal">SAUVEGARDER LA SELECTION</button>
                </div>

            </div>
        </div>
    </div>

    <script src="https://www.google-analytics.com/analytics.js"></script>
    <script>
        document.getElementById("userPref").addEventListener("click", validationUserCookie, false);


        function validationUserCookie() {
            if (document.getElementById("cookieAccepte").checked === true) {
                createCookiePerformance(1);
            } else {
                createCookiePerformance(0);
            }
        }

        function createCookiePerformance(value) {
            var expiryDate = new Date();
            var cookieName = 'aksamPerformance';
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            document.cookie = cookieName + '=' + value + '; path=/; expires=' + expiryDate.toGMTString();
            $("#cookieChoiceInfo").remove();

        }
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