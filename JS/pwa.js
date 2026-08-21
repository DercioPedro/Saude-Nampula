// pwa.js - Gestão da Progressive Web App

(function() {
    'use strict';

    var deferredPrompt = null;
    var btnInstalar = null;

    // ========================================
    // CRIAR BOTÃO DE INSTALAÇÃO
    // ========================================

    function criarBotaoInstalacao() {
        // Verificar se o botão já existe
        if (document.getElementById('btn-instalar-app')) return;

        btnInstalar = document.createElement('button');
        btnInstalar.id = 'btn-instalar-app';
        btnInstalar.innerHTML = ' Instalar App';
        btnInstalar.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #059669;
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            z-index: 99999;
            box-shadow: 0 4px 20px rgba(5, 150, 105, 0.4);
            display: none;
            transition: all 0.3s ease;
            animation: pulse-instalar 2s ease-in-out infinite;
        `;

        // Adicionar hover
        btnInstalar.onmouseover = function() {
            this.style.transform = 'translateX(-50%) scale(1.05)';
            this.style.boxShadow = '0 6px 30px rgba(5, 150, 105, 0.6)';
        };
        btnInstalar.onmouseout = function() {
            this.style.transform = 'translateX(-50%) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.4)';
        };

        btnInstalar.onclick = function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        console.log(' Utilizador instalou a app');
                    } else {
                        console.log(' Utilizador recusou a instalação');
                    }
                    deferredPrompt = null;
                    btnInstalar.style.display = 'none';
                });
            }
        };

        document.body.appendChild(btnInstalar);

        // Adicionar CSS da animação
        if (!document.getElementById('style-pwa')) {
            var style = document.createElement('style');
            style.id = 'style-pwa';
            style.textContent = `
                @keyframes pulse-instalar {
                    0%, 100% { box-shadow: 0 4px 20px rgba(5, 150, 105, 0.4); }
                    50% { box-shadow: 0 4px 40px rgba(5, 150, 105, 0.7); }
                }
            `;
            document.head.appendChild(style);
        }

        return btnInstalar;
    }

    // ========================================
    // EVENTO DE INSTALAÇÃO
    // ========================================

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Criar e mostrar botão
        if (!btnInstalar) {
            btnInstalar = criarBotaoInstalacao();
        }
        
        btnInstalar.style.display = 'block';
        console.log(' Botão de instalação disponível');
    });

    // ========================================
    // APP INSTALADA
    // ========================================

    window.addEventListener('appinstalled', function() {
        console.log(' App instalada com sucesso!');
        if (btnInstalar) {
            btnInstalar.style.display = 'none';
        }
    });

    // ========================================
    // VERIFICAR SE JÁ ESTÁ INSTALADA
    // ========================================

    // Verificar se está em modo standalone (app instalada)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log(' App já está instalada (modo standalone)');
        if (btnInstalar) {
            btnInstalar.style.display = 'none';
        }
    }

    // Verificar se já foi instalada anteriormente
    if (localStorage.getItem('pwa_instalada') === 'true') {
        console.log(' App já foi instalada anteriormente');
    }

    // ========================================
    // DETECTAR MUDANÇA DE MODO
    // ========================================

    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e) {
        if (e.matches) {
            console.log(' App entrou em modo standalone');
            if (btnInstalar) {
                btnInstalar.style.display = 'none';
            }
        }
    });

})();
