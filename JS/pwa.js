// pwa.js - Progressive Web App com botão sempre visível

(function() {
    'use strict';

    var deferredPrompt = null;
    var btnInstalar = null;
    var isInstalled = false;

    // ========================================
    // VERIFICAR SE A APP ESTÁ INSTALADA
    // ========================================

    function verificarAppInstalada() {
        // Verificar modo standalone (app instalada)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        
        // Verificar se foi instalada anteriormente
        if (localStorage.getItem('pwa_instalada') === 'true') {
            return true;
        }
        
        return false;
    }

    // ========================================
    // ATUALIZAR BOTÃO
    // ========================================

    function atualizarBotao(instalado) {
        var btn = document.getElementById('btn-instalar-app');
        if (!btn) return;

        isInstalled = (instalado !== undefined) ? instalado : verificarAppInstalada();

        if (isInstalled) {
            btn.innerHTML = ' App Instalada';
            btn.style.background = '#059669';
            btn.style.cursor = 'default';
            btn.style.animation = 'none';
            btn.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.4)';
            btn.style.opacity = '0.8';
            btn.onclick = function() {
                mostrarToast(' App já está instalada no seu dispositivo!');
            };
        } else {
            btn.innerHTML = ' Instalar App';
            btn.style.background = '#7c3aed';
            btn.style.cursor = 'pointer';
            btn.style.animation = 'pulse-instalar 2s ease-in-out infinite';
            btn.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)';
            btn.style.opacity = '1';
            btn.style.display = 'block';
            
            btn.onmouseover = function() {
                this.style.transform = 'translateX(-50%) scale(1.05)';
                this.style.boxShadow = '0 6px 30px rgba(124, 58, 237, 0.6)';
            };
            btn.onmouseout = function() {
                this.style.transform = 'translateX(-50%) scale(1)';
                this.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4)';
            };

            btn.onclick = function() {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choiceResult) {
                        if (choiceResult.outcome === 'accepted') {
                            console.log(' Utilizador instalou a app');
                            localStorage.setItem('pwa_instalada', 'true');
                            atualizarBotao(true);
                        } else {
                            console.log(' Utilizador recusou a instalação');
                        }
                        deferredPrompt = null;
                    });
                } else {
                    mostrarToast(
                        ' Para instalar a app:\n' +
                        'Chrome: Menu → "Instalar aplicação"\n' +
                        'Safari: Partilhar → "Adicionar ao Ecrã Inicial"'
                    );
                }
            };
        }
    }

    // ========================================
    // MOSTRAR TOAST (MENSAGEM TEMPORÁRIA)
    // ========================================

    function mostrarToast(mensagem) {
        var toast = document.getElementById('toast-pwa');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-pwa';
            toast.style.cssText = `
                position: fixed;
                bottom: 140px;
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
                transition: all 0.3s ease;
                white-space: pre-line;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    // EVENTO DE INSTALAÇÃO
    // ========================================

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        console.log(' Evento beforeinstallprompt capturado');
        atualizarBotao(false);
    });

    // ========================================
    // APP INSTALADA
    // ========================================

    window.addEventListener('appinstalled', function() {
        console.log(' App instalada com sucesso!');
        localStorage.setItem('pwa_instalada', 'true');
        atualizarBotao(true);
    });

    // ========================================
    // DETECTAR MUDANÇA DE MODO
    // ========================================

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
        // Verificar se já está instalada
        var instalada = verificarAppInstalada();
        atualizarBotao(instalada);
        console.log(' PWA inicializado. Instalada:', instalada);
    }

    // Adicionar CSS da animação
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

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
