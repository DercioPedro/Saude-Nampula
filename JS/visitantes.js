// visitantes.js - Contador de Utilizadores Online em Tempo Real

(function() {
    'use strict';

    var API_URL = 'https://saude-nampula-backend.onrender.com/api';

    function obterIdVisitante() {
        var id = localStorage.getItem('visitante_id_saude');
        if (!id) {
            id = 'vis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('visitante_id_saude', id);
        }
        return id;
    }

    async function enviarPing() {
        try {
            await fetch(API_URL + '/visitantes/online', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitante_id: obterIdVisitante() })
            });
        } catch (error) {
            console.error('Erro no ping:', error);
        }
    }

    async function obterOnline() {
        try {
            var response = await fetch(API_URL + '/visitantes/online');
            if (!response.ok) return 0;
            var dados = await response.json();
            return dados.total || 0;
        } catch (error) {
            console.error('Erro ao obter online:', error);
            return 0;
        }
    }

    function criarContador() {
        var container = document.createElement('div');
        container.id = 'contador-online';
        container.className = 'contador-visitantes';

        var icone = document.createElement('span');
        icone.className = 'contador-icone';
        icone.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

        var conteudo = document.createElement('div');
        conteudo.className = 'contador-conteudo';

        var label = document.createElement('span');
        label.className = 'contador-label';
        label.textContent = 'Online agora';

        var valor = document.createElement('span');
        valor.className = 'contador-valor';
        valor.id = 'contador-valor';
        valor.textContent = '0';

        var status = document.createElement('span');
        status.className = 'contador-status';
        status.innerHTML = '<span class="status-dot"></span> Ao vivo';

        conteudo.appendChild(label);
        conteudo.appendChild(valor);
        conteudo.appendChild(status);
        container.appendChild(icone);
        container.appendChild(conteudo);

        return container;
    }

    function inserirContador() {
        var target = document.querySelector('.hero') || document.querySelector('main') || document.body;
        if (document.getElementById('contador-online')) return;
        
        var contador = criarContador();
        if (target.classList && target.classList.contains('hero')) {
            target.parentNode.insertBefore(contador, target.nextSibling);
        } else {
            target.insertBefore(contador, target.firstChild);
        }
    }

    function adicionarEstilos() {
        if (document.getElementById('style-contador')) return;
        var style = document.createElement('style');
        style.id = 'style-contador';
        style.textContent = `
            .contador-visitantes { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #ffffff, #f8fafc); border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 28px; margin: 16px auto 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); max-width: 400px; transition: all 0.3s ease; }
            .contador-visitantes:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
            .contador-icone { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #047857); border-radius: 12px; flex-shrink: 0; }
            .contador-icone svg { width: 24px; height: 24px; color: white; }
            .contador-conteudo { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
            .contador-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .contador-valor { font-size: 28px; font-weight: 800; color: #1f2937; min-width: 80px; text-align: center; background: linear-gradient(135deg, #059669, #047857); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .contador-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
            .status-dot { display: inline-block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: pulse-dot 1.5s ease-in-out infinite; }
            @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
            .dark-mode .contador-visitantes { background: linear-gradient(135deg, #1f2937, #111827); border-color: #374151; }
            .dark-mode .contador-label { color: #9ca3af; }
            .dark-mode .contador-status { background: #374151; color: #9ca3af; }
            .dark-mode .contador-valor { background: linear-gradient(135deg, #34d399, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            @media (max-width: 640px) { .contador-visitantes { padding: 14px 20px; gap: 12px; max-width: 100%; margin: 12px 16px 20px; border-radius: 12px; } .contador-icone { width: 36px; height: 36px; } .contador-icone svg { width: 18px; height: 18px; } .contador-valor { font-size: 22px; min-width: 60px; } .contador-label { font-size: 10px; } .contador-conteudo { gap: 10px; } .contador-status { font-size: 10px; padding: 3px 10px; } }
            @media (max-width: 480px) { .contador-visitantes { padding: 12px 16px; gap: 10px; flex-wrap: wrap; justify-content: center; } .contador-valor { font-size: 20px; min-width: 50px; } .contador-conteudo { justify-content: center; gap: 6px; } .contador-label { width: 100%; text-align: center; } }
        `;
        document.head.appendChild(style);
    }

    async function atualizarVisor() {
        var total = await obterOnline();
        var valorElement = document.getElementById('contador-valor');
        if (valorElement) {
            valorElement.textContent = total;
        }
    }

    async function init() {
        adicionarEstilos();
        inserirContador();

        // Envia o primeiro ping
        await enviarPing();
        // Vai buscar o número
        await atualizarVisor();

        // A cada 30 segundos, envia ping e atualiza
        setInterval(async function() {
            await enviarPing();
            await atualizarVisor();
        }, 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
