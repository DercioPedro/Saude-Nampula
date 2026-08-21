// pwa.js - Gestão do botão PWA

(function() {
    'use strict';

    var deferredPrompt = null;
    var btn = document.getElementById('btn-instalar-app');

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
        if (!btn) return;

        var isInstalled = (instalado !== undefined) ? instalado : verificarInstalado();

        if (isInstalled) {
            btn.textContent = 'App instalado';
            btn.style.background = '#059669';
            btn.style.cursor = 'default';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
        } else {
            btn.textContent = 'Instalar App';
            btn.style.background = '#7c3aed';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';

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
                } else {
                    // Se não houver prompt, recarrega para tentar novamente
                    location.reload();
                }
            };
        }
    }

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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            atualizarBotao(verificarInstalado());
        });
    } else {
        atualizarBotao(verificarInstalado());
    }

})();
