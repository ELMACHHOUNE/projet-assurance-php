const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */




mix.postCss('resources/css/app.css', 'public/css', [
    //
]);

// mix.js('node_modules/bootstrap/dist/js/bootstrap.min.js','public/css/theme.js')
mix.styles(['node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/font-awesome/css/font-awesome.min.css'], 'public/css/theme.css');


mix.js(['node_modules/popper.js/dist/popper.js',
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/animejs/lib/anime.js', 'resources/js/app.js'], 'public/js/app.js');
