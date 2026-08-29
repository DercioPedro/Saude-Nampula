// pwa.js - Gestão do banner de instalação PWA

(function() {
    'use strict';

    var deferredPrompt = null;
    var banner = null;
    var btnInstalar = null;
    var btnFechar = null; 

    // ========================================
    // ARMAZENAMENTO SEGURO (localStorage pode
    // lançar erro em modo privado / bloqueado)
    // ========================================

    function getStorage(chave) {
        try {
            return window.localStorage.getItem(chave);
        } catch (e) {
            return null;
        }
    }

    function setStorage(chave, valor) {
        try {
            window.localStorage.setItem(chave, valor);
        } catch (e) {
            // Ignorado: se o storage estiver bloqueado, o banner
            // pode voltar a aparecer na próxima visita, sem mais impacto.
        }
    }

    // ========================================
    // VERIFICAR SE JÁ ESTÁ INSTALADO
    // ========================================

    function verificarInstalado() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        if (getStorage('pwa_instalada') === 'true') {
            return true;
        }
        if (getStorage('pwa_banner_fechado') === 'true') {
            return true;
        }
        return false;
    }

    // ========================================
    // CRIAR BANNER
    // ========================================

    function criarBanner() {
        if (!document.body) return;
        if (document.getElementById('pwa-banner')) return;
        if (verificarInstalado()) return;

        banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Instalar aplicacao');
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

        var conteudo = document.createElement('div');
        conteudo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 200px;
        `;

        var titulo = document.createElement('strong');
        titulo.textContent = 'Instalar Aplicacao';
        titulo.style.cssText = 'display:block; font-size:14px;';

        var subtitulo = document.createElement('span');
        subtitulo.textContent = 'Aceda mais rapido ao Saude Nampula';
        subtitulo.style.cssText = 'display:block; font-size:12px; opacity:0.8;';

        var texto = document.createElement('div');
        texto.appendChild(titulo);
        texto.appendChild(subtitulo);

        conteudo.appendChild(texto);

        var botoes = document.createElement('div');
        botoes.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;

        btnInstalar = document.createElement('button');
        btnInstalar.type = 'button';
        btnInstalar.textContent = 'Instalar';
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
        btnFechar.type = 'button';
        btnFechar.textContent = '×';
        btnFechar.setAttribute('aria-label', 'Fechar');
        btnFechar.style.cssText = `
            background: transparent;
            color: #9ca3af;
            border: none;
            padding: 8px 12px;
            border-radius: 30px;
            font-size: 18px;
            line-height: 1;
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

        document.body.appendChild(banner);

        if (!document.getElementById('style-pwa-banner')) {
            var style = document.createElement('style');
            style.id = 'style-pwa-banner';
            style.textContent = `
                @keyframes slideUpBanner {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideUpToast {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
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

        btnInstalar.onclick = function() {
            if (!deferredPrompt) return;

            btnInstalar.disabled = true;

            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choice) {
                if (choice.outcome === 'accepted') {
                    setStorage('pwa_instalada', 'true');
                    fecharBanner();
                    mostrarToast('Aplicacao instalada');
                } else {
                    btnInstalar.disabled = false;
                }
                deferredPrompt = null;
            }).catch(function() {
                btnInstalar.disabled = false;
            });
        };

        btnFechar.onclick = function() {
            setStorage('pwa_banner_fechado', 'true');
            fecharBanner();
        };
    }

    // ========================================
    // FECHAR BANNER
    // ========================================

    function fecharBanner() {
        if (!banner) return;

        var bannerAtual = banner;
        banner = null;

        bannerAtual.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        bannerAtual.style.transform = 'translateY(100%)';
        bannerAtual.style.opacity = '0';
        setTimeout(function() {
            if (bannerAtual.parentNode) {
                bannerAtual.parentNode.removeChild(bannerAtual);
            }
        }, 300);
    }

    // ========================================
    // MOSTRAR TOAST DE CONFIRMACAO
    // ========================================

    function mostrarToast(mensagem) {
        if (!document.body) return;

        var toast = document.createElement('div');
        toast.textContent = mensagem;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 100000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideUpToast 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.transition = 'opacity 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2500);
    }

    // ========================================
    // MOSTRAR BANNER
    // ========================================

    function mostrarBanner() {
        if (verificarInstalado()) return;

        if (document.body) {
            criarBanner();
        } else {
            document.addEventListener('DOMContentLoaded', criarBanner, { once: true });
        }
    }

    // ========================================
    // EVENTOS
    // ========================================

    // O banner só é mostrado quando o navegador dispara este evento,
    // ou seja, apenas em navegadores que suportam instalação de PWA
    // (Chrome, Edge, Opera, Samsung Internet). Noutros navegadores
    // (Firefox desktop, Safari desktop) este evento nunca ocorre,
    // por isso o banner simplesmente não aparece.
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        mostrarBanner();
    });

    window.addEventListener('appinstalled', function() {
        setStorage('pwa_instalada', 'true');
        fecharBanner();
    });

    var mqStandalone = window.matchMedia('(display-mode: standalone)');
    var aoMudarModo = function(e) {
        if (e.matches) {
            setStorage('pwa_instalada', 'true');
            fecharBanner();
        }
    };
    if (typeof mqStandalone.addEventListener === 'function') {
        mqStandalone.addEventListener('change', aoMudarModo);
    } else if (typeof mqStandalone.addListener === 'function') {
        // Compatibilidade com navegadores mais antigos (Safari < 14)
        mqStandalone.addListener(aoMudarModo);
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
