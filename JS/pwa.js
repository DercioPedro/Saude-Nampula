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
            btnInstalar.innerHTML = ' App Instalada';
            btnInstalar.style.background = '#059669';
            btnInstalar.style.cursor = 'default';
            btnInstalar.style.animation = 'none';
            btnInstalar.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.4)';
            btnInstalar.style.opacity = '0.8';
            btnInstalar.onclick = function() {
                mostrarToast(' App já está instalada no seu dispositivo!');
            };
        } else {
            btnInstalar.innerHTML = ' Instalar App';
            btnInstalar.style.background = '#7c3aed';
            btnInstalar.style.cursor = 'pointer';
            btnInstalar.style.animation = 'pulse-instalar 2s ease-in-out infinite';
            btnInstalar.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)';
            btnInstalar.style.opacity = '1';

            btnInstalar.onmouseover = function() {
                this.style.transform = 'translateX(-50%) scale(1.05)';
                this.style.boxShadow = '0 6px 30px rgba(124, 58, 237, 0.6)';
            };
            btnInstalar.onmouseout = function() {
                this.style.transform = 'translateX(-50%) scale(1)';
                this.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)';
            };

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
                        }
                        deferredPrompt = null;
                    });
                } else {
                    mostrarToast(
                        '📱 Para instalar a app:\n' +
                        'Chrome: Menu → "Instalar aplicação"\n' +
                        'Safari: Partilhar → "Adicionar ao Ecrã Inicial"'
                    );
                }
            };
        }
    }

    // ========================================
    // MOSTRAR TOAST
    // ========================================

    function mostrarToast(mensagem) {
        var toast = document.getElementById('toast-pwa');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-pwa';
            toast.style.cssText = `
                position: fixed;
                bottom: 200px;
                left: 50%;
                transform: translateX(-50%);
                background: #1f2937;
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 14px;
                z-index: 99999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                max-width: 90%;
                text-align: center;
                white-space: pre-line;
                font-family: inherit;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = mensagem;
        toast.style.display = 'block';
        toast.style.opacity = '1';

        clearTimeout(toast.timeout);
        toast.timeout = setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() {
                toast.style.display = 'none';
            }, 300);
        }, 4000);
    }

    // ========================================
    // ADICIONAR CSS DA ANIMAÇÃO
    // ========================================

    if (!document.getElementById('style-pwa')) {
        var style = document.createElement('style');
        style.id = 'style-pwa';
        style.textContent = `
            @keyframes pulse-instalar {
                0%, 100% { box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4); }
                50% { box-shadow: 0 4px 40px rgba(124, 58, 237, 0.7); }
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
