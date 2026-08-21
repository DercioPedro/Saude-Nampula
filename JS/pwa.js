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
    // CRIAR BOTÃO DE INSTALAÇÃO
    // ========================================

    function criarBotaoInstalacao() {
        if (document.getElementById('btn-instalar-app')) return;

        isInstalled = verificarAppInstalada();

        btnInstalar = document.createElement('button');
        btnInstalar.id = 'btn-instalar-app';
        btnInstalar.innerHTML = isInstalled ? ' App Instalada' : ' Instalar App';
        btnInstalar.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isInstalled ? '#059669' : '#7c3aed'};
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            cursor: ${isInstalled ? 'default' : 'pointer'};
            z-index: 99999;
            box-shadow: 0 4px 20px ${isInstalled ? 'rgba(5, 150, 105, 0.4)' : 'rgba(124, 58, 237, 0.4)'};
            transition: all 0.3s ease;
            ${isInstalled ? '' : 'animation: pulse-instalar 2s ease-in-out infinite;'}
            opacity: ${isInstalled ? '0.8' : '1'};
        `;

        // Se já estiver instalada, não fazer nada ao clicar
        if (isInstalled) {
            btnInstalar.onclick = function() {
                // Mostrar mensagem informativa
                mostrarToast(' App já está instalada no seu dispositivo!');
            };
        } else {
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
                            console.log(' Utilizador recusou a instalação');
                        }
                        deferredPrompt = null;
                    });
                } else {
                    // Fallback: abrir instruções de instalação
                    mostrarToast(
                        '📱 Para instalar a app:\n\n' +
                        'Android: Menu do Chrome → "Instalar aplicação"\n' +
                        'iOS: Partilhar → "Adicionar ao Ecrã Inicial"\n' +
                        'Desktop: Clique no ícone "+" na barra de endereço'
                    );
                }
            };
        }

        document.body.appendChild(btnInstalar);

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

        return btnInstalar;
    }

    // ========================================
    // ATUALIZAR BOTÃO
    // ========================================

    function atualizarBotao(instalado) {
        if (!btnInstalar) return;

        isInstalled = instalado || verificarAppInstalada();

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
        
        // Se o botão já existe, atualizar para modo instalação
        if (btnInstalar) {
            atualizarBotao(false);
        }
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
    // INICIALIZAR
    // ========================================

    function init() {
        // Criar botão
        criarBotaoInstalacao();

        // Verificar se já está instalada
        if (verificarAppInstalada()) {
            atualizarBotao(true);
        }

        console.log(' PWA inicializado. Botão:', btnInstalar ? 'criado' : 'erro');
    }

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
