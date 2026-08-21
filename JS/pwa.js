// pwa.js - Gestão do botão PWA

(function() {
    'use strict';

    var deferredPrompt = null;
    var btnInstalar = document.getElementById('btn-instalar-app');

    // ========================================
    // VERIFICAR SE A APP ESTÁ INSTALADA
    // ========================================

    function verificarAppInstalada() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        if (localStorage.getItem('pwa_instalada') === 'true') {
            return true;
        }
        return false;
    }

    // ========================================
    // ATUALIZAR BOTÃO
    // ========================================

    function atualizarBotao(instalado) {
        if (!btnInstalar) return;

        var isInstalled = (instalado !== undefined) ? instalado : verificarAppInstalada();

        if (isInstalled) {
            btnInstalar.innerHTML = ' App';
            btnInstalar.style.background = 'rgba(5, 150, 105, 0.9)';
            btnInstalar.style.boxShadow = '0 2px 12px rgba(5, 150, 105, 0.3)';
            btnInstalar.style.border = '1px solid rgba(255,255,255,0.1)';
            btnInstalar.style.cursor = 'default';
            btnInstalar.onclick = function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(function() { 
                    btnInstalar.style.transform = 'scale(1)';
                }, 200);
            };
        } else {
            btnInstalar.innerHTML = ' App';
            btnInstalar.style.background = 'rgba(124, 58, 237, 0.9)';
            btnInstalar.style.boxShadow = '0 2px 12px rgba(124, 58, 237, 0.3)';
            btnInstalar.style.border = '1px solid rgba(255,255,255,0.15)';
            btnInstalar.style.cursor = 'pointer';

            btnInstalar.onclick = function() {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choiceResult) {
                        if (choiceResult.outcome === 'accepted') {
                            console.log(' Utilizador instalou a app');
                            localStorage.setItem('pwa_instalada', 'true');
                            atualizarBotao(true);
                        } else {
                            console.log('❌ Utilizador recusou a instalação');
                            btnInstalar.innerHTML = '';
                            btnInstalar.style.background = 'rgba(220, 38, 38, 0.9)';
                            setTimeout(function() {
                                btnInstalar.innerHTML = ' App';
                                btnInstalar.style.background = 'rgba(124, 58, 237, 0.9)';
                            }, 2000);
                        }
                        deferredPrompt = null;
                    });
                } else {
                    // Fallback: tentar novamente
                    btnInstalar.innerHTML = '';
                    btnInstalar.style.background = 'rgba(245, 158, 11, 0.9)';
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                }
            };
        }
    }

    // ========================================
    // ESTILOS
    // ========================================

    if (!document.getElementById('style-pwa')) {
        var style = document.createElement('style');
        style.id = 'style-pwa';
        style.textContent = `
            #btn-instalar-app {
                transition: all 0.3s ease;
                font-size: 12px;
                padding: 8px 16px;
                border-radius: 30px;
                font-weight: 600;
                letter-spacing: 0.3px;
                min-width: 70px;
                text-align: center;
            }
            #btn-instalar-app:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 20px rgba(124, 58, 237, 0.5) !important;
            }
            #btn-instalar-app:active {
                transform: scale(0.95);
            }
            @media (max-width: 480px) {
                #btn-instalar-app {
                    font-size: 10px;
                    padding: 6px 12px;
                    min-width: 60px;
                    top: 62px !important;
                    right: 8px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // EVENTOS
    // ========================================

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        console.log(' Evento beforeinstallprompt capturado');
        atualizarBotao(false);
    });

    window.addEventListener('appinstalled', function() {
        console.log(' App instalada com sucesso!');
        localStorage.setItem('pwa_instalada', 'true');
        atualizarBotao(true);
    });

    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
        if (e.matches) {
            console.log(' App entrou em modo standalone');
            atualizarBotao(true);
        }
    });

    // ========================================
    // INICIALIZAR
    // ========================================

    function init() {
        if (!btnInstalar) {
            console.warn(' Botão PWA não encontrado no HTML');
            return;
        }
        atualizarBotao(verificarAppInstalada());
        console.log(' PWA inicializado');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
