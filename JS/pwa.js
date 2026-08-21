// pwa.js - Gestão do botão PWA

(function() {
    'use strict';

    var deferredPrompt = null;
    var btn = document.getElementById('btn-instalar-app');

    if (!btn) return;

    function verificarInstalado() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        if (localStorage.getItem('pwa_instalada') === 'true') {
            return true;
        }
        return false;
    }

    function atualizarBotao(instalado) {
        var isInstalled = (instalado !== undefined) ? instalado : verificarInstalado();

        if (isInstalled) {
            btn.textContent = 'App instalado';
            btn.classList.add('instalado');
        } else {
            btn.textContent = 'Instalar App';
            btn.classList.remove('instalado');
        }
    }

    btn.onclick = function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choice) {
                if (choice.outcome === 'accepted') {
                    localStorage.setItem('pwa_instalada', 'true');
                    atualizarBotao(true);
                }
                deferredPrompt = null;
            });
        }
    };

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        atualizarBotao(false);
    });

    window.addEventListener('appinstalled', function() {
        localStorage.setItem('pwa_instalada', 'true');
        atualizarBotao(true);
    });

    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
        if (e.matches) {
            atualizarBotao(true);
        }
    });

    // Inicializar
    atualizarBotao(verificarInstalado());

})();
