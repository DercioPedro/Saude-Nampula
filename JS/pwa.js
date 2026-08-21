// pwa.js - Gestão do botão PWA (instalação direta)

(function() {
    'use strict';

    var deferredPrompt = null;
    var btnInstalar = document.getElementById('btn-instalar-app');

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
        if (!btnInstalar) return;

        var isInstalled = (instalado !== undefined) ? instalado : verificarAppInstalada();

        if (isInstalled) {
            btnInstalar.innerHTML = '✅ App';
            btnInstalar.style.background = 'rgba(5, 150, 105, 0.9)';
            btnInstalar.style.cursor = 'default';
            btnInstalar.style.boxShadow = '0 2px 12px rgba(5, 150, 105, 0.3)';
            btnInstalar.style.backdropFilter = 'blur(8px)';
            btnInstalar.onclick = function() {
                // Mostrar feedback visual apenas
                this.style.transform = 'scale(0.95)';
                setTimeout(function() { 
                    btnInstalar.style.transform = 'scale(1)';
                }, 200);
            };
        } else {
            btnInstalar.innerHTML = '📱 Instalar';
            btnInstalar.style.background = 'rgba(124, 58, 237, 0.9)';
            btnInstalar.style.cursor = 'pointer';
            btnInstalar.style.boxShadow = '0 2px 12px rgba(124, 58, 237, 0.3)';
            btnInstalar.style.backdropFilter = 'blur(8px)';

            btnInstalar.onclick = function() {
                // Tenta instalar diretamente
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choiceResult) {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('✅ Utilizador instalou a app');
                            localStorage.setItem('pwa_instalada', 'true');
                            atualizarBotao(true);
                        } else {
                            console.log('❌ Utilizador recusou a instalação');
                            // Feedback visual
                            btnInstalar.style.background = 'rgba(220, 38, 38, 0.9)';
                            btnInstalar.innerHTML = '❌ Recusou';
                            setTimeout(function() {
                                btnInstalar.style.background = 'rgba(124, 58, 237, 0.9)';
                                btnInstalar.innerHTML = '📱 Instalar';
                            }, 2000);
                        }
                        deferredPrompt = null;
                    });
                } else {
                    // Se não houver prompt, tenta instalar via Chrome (Android)
                    if (navigator.share) {
                        navigator.share({
                            title: 'Saúde Nampula',
                            text: 'Encontre hospitais, farmácias e centros de saúde em Nampula',
                            url: window.location.href
                        });
                    } else {
                        // Fallback: recarregar a página para tentar novamente
                        btnInstalar.innerHTML = '🔄 Tentar...';
                        btnInstalar.style.background = 'rgba(245, 158, 11, 0.9)';
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    }
                }
            };
        }
    }

    // ========================================
    // ADICIONAR CSS DA ANIMAÇÃO
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
                    font-size: 11px;
                    padding: 6px 12px;
                    top: 10px;
                    right: 10px;
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
        console.log('✅ Evento beforeinstallprompt capturado');
        atualizarBotao(false);
    });

    window.addEventListener('appinstalled', function() {
        console.log('✅ App instalada com sucesso!');
        localStorage.setItem('pwa_instalada', 'true');
        atualizarBotao(true);
    });

    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
        if (e.matches) {
            console.log('✅ App entrou em modo standalone');
            atualizarBotao(true);
        }
    });

    // ========================================
    // INICIALIZAR
    // ========================================

    function init() {
        if (!btnInstalar) {
            console.warn('⚠️ Botão PWA não encontrado no HTML');
            return;
        }
        atualizarBotao(verificarAppInstalada());
        console.log('✅ PWA inicializado');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
