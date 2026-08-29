// pwa.js - Gestão do banner de instalação PWA

(function() {
    'use strict';

    var deferredPrompt = null;
    var banner = null;
    var btnInstalar = null;
    var btnFechar = null;

    // ========================================
    // VERIFICAR SE JÁ ESTÁ INSTALADO
    // ========================================

    function verificarInstalado() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        if (localStorage.getItem('pwa_instalada') === 'true') {
            return true;
        }
        if (localStorage.getItem('pwa_banner_fechado') === 'true') {
            return true;
        }
        return false;
    }

    // ========================================
    // VERIFICAR SE É iOS
    // ========================================

    function isIOS() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    }

    // ========================================
    // CRIAR BANNER
    // ========================================

    function criarBanner() {
        // Se já existe, não criar novamente
        if (document.getElementById('pwa-banner')) return;

        // Verificar se já está instalado ou se o banner foi fechado
        if (verificarInstalado()) return;

        banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1f2937;
            color: white;
            padding: 16px 20px;
            z-index: 99999;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            animation: slideUpBanner 0.4s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Conteúdo do banner
        var conteudo = document.createElement('div');
        conteudo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 200px;
        `;

        var icone = document.createElement('span');
        icone.textContent = '';
        icone.style.cssText = 'font-size: 24px;';

        var texto = document.createElement('div');
        texto.innerHTML = `
            <strong style="display:block; font-size:14px;">Instalar App</strong>
            <span style="font-size:12px; opacity:0.8;">Aceda mais rápido ao Saúde Nampula</span>
        `;

        conteudo.appendChild(icone);
        conteudo.appendChild(texto);

        // Botões
        var botoes = document.createElement('div');
        botoes.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;

        btnInstalar = document.createElement('button');
        btnInstalar.textContent = isIOS() ? 'Como instalar' : 'Instalar';
        btnInstalar.style.cssText = `
            background: #7c3aed;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        btnInstalar.onmouseover = function() {
            this.style.background = '#6d28d9';
            this.style.transform = 'scale(1.05)';
        };
        btnInstalar.onmouseout = function() {
            this.style.background = '#7c3aed';
            this.style.transform = 'scale(1)';
        };

        btnFechar = document.createElement('button');
        btnFechar.textContent = '✕';
        btnFechar.style.cssText = `
            background: transparent;
            color: #9ca3af;
            border: none;
            padding: 8px 12px;
            border-radius: 30px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        btnFechar.onmouseover = function() {
            this.style.color = 'white';
        };
        btnFechar.onmouseout = function() {
            this.style.color = '#9ca3af';
        };

        botoes.appendChild(btnInstalar);
        botoes.appendChild(btnFechar);

        banner.appendChild(conteudo);
        banner.appendChild(botoes);

        // Adicionar ao body
        document.body.appendChild(banner);

        // Adicionar CSS da animação
        if (!document.getElementById('style-pwa-banner')) {
            var style = document.createElement('style');
            style.id = 'style-pwa-banner';
            style.textContent = `
                @keyframes slideUpBanner {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 480px) {
                    #pwa-banner {
                        flex-direction: column;
                        text-align: center;
                        padding: 12px 16px;
                    }
                    #pwa-banner > div:first-child {
                        justify-content: center;
                    }
                    #pwa-banner > div:last-child {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Eventos dos botões
        btnInstalar.onclick = function() {
            if (isIOS()) {
                // iOS: mostrar instruções
                alert(
                    ' Como instalar no iPhone/iPad:\n\n' +
                    '1. Toque no ícone de partilha (quadrado com seta)\n' +
                    '2. Deslize para baixo e escolha "Adicionar ao Ecrã Inicial"\n' +
                    '3. Toque em "Adicionar"\n\n' +
                    'Pronto! O Saúde Nampula estará no seu ecrã inicial.'
                );
            } else if (deferredPrompt) {
                // Android/Chrome: mostrar diálogo nativo
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choice) {
                    if (choice.outcome === 'accepted') {
                        console.log(' Utilizador instalou a app');
                        localStorage.setItem('pwa_instalada', 'true');
                        fecharBanner();
                    } else {
                        console.log('❌ Utilizador recusou a instalação');
                    }
                    deferredPrompt = null;
                });
            } else {
                // Fallback: instruções genéricas
                alert(
                    '📱 Para instalar a app:\n\n' +
                    'Chrome/Edge: Menu → "Instalar aplicação"\n' +
                    'Safari: Partilhar → "Adicionar ao Ecrã Inicial"'
                );
            }
        };

        btnFechar.onclick = function() {
            localStorage.setItem('pwa_banner_fechado', 'true');
            fecharBanner();
        };
    }

    // ========================================
    // FECHAR BANNER
    // ========================================

    function fecharBanner() {
        if (banner) {
            banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            banner.style.transform = 'translateY(100%)';
            banner.style.opacity = '0';
            setTimeout(function() {
                if (banner && banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                    banner = null;
                }
            }, 300);
        }
    }

    // ========================================
    // MOSTRAR BANNER
    // ========================================

    function mostrarBanner() {
        // Não mostrar se já estiver instalado ou se o banner foi fechado
        if (verificarInstalado()) return;
        criarBanner();
    }

    // ========================================
    // EVENTOS
    // ========================================

    // Android/Chrome: evento de instalação
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        mostrarBanner();
        console.log(' Evento beforeinstallprompt capturado');
    });

    // iOS: verificar se é iOS e mostrar banner
    if (isIOS()) {
        // Aguardar um pouco para mostrar o banner no iOS
        setTimeout(function() {
            if (!verificarInstalado()) {
                mostrarBanner();
            }
        }, 2000);
    }

    // App instalada
    window.addEventListener('appinstalled', function() {
        console.log(' App instalada com sucesso!');
        localStorage.setItem('pwa_instalada', 'true');
        fecharBanner();
    });

    // Mudança de modo (standalone)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
        if (e.matches) {
            localStorage.setItem('pwa_instalada', 'true');
            fecharBanner();
        }
    });

    // ========================================
    // INICIALIZAR
    // ========================================

    // Verificar se já está instalado ao carregar
    if (!verificarInstalado()) {
        // Se não estiver instalado, aguardar o evento beforeinstallprompt
        // ou mostrar para iOS
        if (!isIOS()) {
            // Para Android/Chrome, aguardar o evento
            console.log(' Aguardando evento beforeinstallprompt...');
        }
    } else {
        console.log(' App já instalada ou banner fechado');
    }

    // ========================================
    // EXPORTAR
    // ========================================

    window.pwa = {
        mostrarBanner: mostrarBanner,
        fecharBanner: fecharBanner,
        verificarInstalado: verificarInstalado
    };

})();
