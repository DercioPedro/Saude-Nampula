// JS/instalar-app.js

(function() {
    'use strict';

    var deferredPrompt;

    // Detectar quando a app pode ser instalada
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botão de instalação
        var btnInstalar = document.getElementById('btn-instalar-app');
        if (btnInstalar) {
            btnInstalar.style.display = 'block';
        }
    });

    // Função para instalar
    window.instalarApp = function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Utilizador instalou a app');
                } else {
                    console.log('Utilizador recusou a instalação');
                }
                deferredPrompt = null;
                
                // Esconder botão
                var btnInstalar = document.getElementById('btn-instalar-app');
                if (btnInstalar) {
                    btnInstalar.style.display = 'none';
                }
            });
        }
    };

    // Detectar quando a app foi instalada
    window.addEventListener('appinstalled', function() {
        console.log('App instalada com sucesso!');
        // Esconder botão
        var btnInstalar = document.getElementById('btn-instalar-app');
        if (btnInstalar) {
            btnInstalar.style.display = 'none';
        }
    });

})();
