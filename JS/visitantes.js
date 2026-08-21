// visitantes.js - Contador REAL de visitantes com Supabase

(function() {
    'use strict';

    // ========================================
    // CONFIGURAÇÃO SUPABASE (CORRIGIDA)
    // ========================================

    var SUPABASE_URL = 'https://lwewvxizivetlqncyajx.supabase.co'; // URL do Supabase
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZXd2eGl6aXZldGxxbmN5YWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzk2NTIsImV4cCI6MjA5NDM1NTY1Mn0.mX4vbiccmZLFjD9U9SUH4htRdOtgY2Iwrmqt8LNl5wo'; // Chave anon

    // ========================================
    // FUNÇÕES
    // ========================================

    function formatarNumero(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function obterIdVisitante() {
        var id = localStorage.getItem('visitante_id_saude');
        if (!id) {
            id = 'vis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('visitante_id_saude', id);
        }
        return id;
    }

    // ========================================
    // REGISTAR VISITA
    // ========================================

    async function registrarVisita() {
        try {
            var hoje = new Date().toISOString().split('T')[0];
            var hojeStr = new Date().toDateString();
            var ultimoRegisto = localStorage.getItem('ultimo_registo_visita');

            if (ultimoRegisto === hojeStr) {
                await incrementarVisualizacoes(hoje);
                return;
            }

            // Buscar registro de hoje
            var response = await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador?data=eq.' + hoje + '&select=*', {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar registro:', response.status);
                return;
            }

            var dados = await response.json();

            if (dados && dados.length > 0) {
                var registro = dados[0];
                var novoVisitantes = (registro.visitantes || 0) + 1;
                var novoVisualizacoes = (registro.visualizacoes || 0) + 1;

                await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador?id=eq.' + registro.id, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        visitantes: novoVisitantes,
                        visualizacoes: novoVisualizacoes
                    })
                });

                localStorage.setItem('ultimo_registo_visita', hojeStr);
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador', {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        data: hoje,
                        visitantes: 1,
                        visualizacoes: 1
                    })
                });

                localStorage.setItem('ultimo_registo_visita', hojeStr);
            }

        } catch (error) {
            console.error('Erro ao registrar visita:', error);
        }
    }

    // ========================================
    // INCREMENTAR VISUALIZAÇÕES
    // ========================================

    async function incrementarVisualizacoes(hoje) {
        try {
            var response = await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador?data=eq.' + hoje + '&select=*', {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            });

            if (!response.ok) return;

            var dados = await response.json();
            if (dados && dados.length > 0) {
                var registro = dados[0];
                var novoVisualizacoes = (registro.visualizacoes || 0) + 1;

                await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador?id=eq.' + registro.id, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        visualizacoes: novoVisualizacoes
                    })
                });
            }
        } catch (error) {
            console.error('Erro ao incrementar visualizações:', error);
        }
    }

    // ========================================
    // OBTER TOTAL DE VISITANTES
    // ========================================

    async function obterTotalVisitantes() {
        try {
            var response = await fetch(SUPABASE_URL + '/rest/v1/visitantes_contador?select=visitantes', {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar total:', response.status);
                return 0;
            }

            var dados = await response.json();
            var total = 0;

            if (dados && dados.length > 0) {
                for (var i = 0; i < dados.length; i++) {
                    total += dados[i].visitantes || 0;
                }
            }

            return total;

        } catch (error) {
            console.error('Erro ao obter total:', error);
            return 0;
        }
    }

    // ========================================
    // CRIAR ELEMENTOS DO CONTADOR
    // ========================================

    function criarContador(total) {
        var totalFormatado = formatarNumero(total);

        var container = document.createElement('div');
        container.id = 'contador-visitantes';
        container.className = 'contador-visitantes';

        var icone = document.createElement('span');
        icone.className = 'contador-icone';
        icone.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

        var conteudo = document.createElement('div');
        conteudo.className = 'contador-conteudo';

        var label = document.createElement('span');
        label.className = 'contador-label';
        label.textContent = 'Visitantes';

        var valor = document.createElement('span');
        valor.className = 'contador-valor';
        valor.id = 'contador-valor';
        valor.textContent = totalFormatado;

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

    // ========================================
    // INSERIR CONTADOR
    // ========================================

    function inserirContador(total) {
        var target = document.querySelector('.hero') || document.querySelector('main') || document.body;

        if (document.getElementById('contador-visitantes')) {
            var valorElement = document.getElementById('contador-valor');
            if (valorElement) {
                valorElement.textContent = formatarNumero(total);
            }
            return;
        }

        var contador = criarContador(total);

        if (target.classList && target.classList.contains('hero')) {
            target.parentNode.insertBefore(contador, target.nextSibling);
        } else {
            target.insertBefore(contador, target.firstChild);
        }
    }

    // ========================================
    // ESTILOS
    // ========================================

    function adicionarEstilos() {
        if (document.getElementById('style-contador')) return;

        var style = document.createElement('style');
        style.id = 'style-contador';
        style.textContent = `
            .contador-visitantes {
                display: flex;
                align-items: center;
                gap: 16px;
                background: linear-gradient(135deg, #ffffff, #f8fafc);
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 16px 28px;
                margin: 16px auto 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                max-width: 400px;
                transition: all 0.3s ease;
            }
            .contador-visitantes:hover {
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                transform: translateY(-2px);
            }
            .contador-icone {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #059669, #047857);
                border-radius: 12px;
                flex-shrink: 0;
            }
            .contador-icone svg {
                width: 24px;
                height: 24px;
                color: white;
            }
            .contador-conteudo {
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }
            .contador-label {
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .contador-valor {
                font-size: 28px;
                font-weight: 800;
                color: #1f2937;
                min-width: 80px;
                text-align: center;
                background: linear-gradient(135deg, #059669, #047857);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .contador-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 500;
            }
            .status-dot {
                display: inline-block;
                width: 6px;
                height: 6px;
                background: #22c55e;
                border-radius: 50%;
                animation: pulse-dot 1.5s ease-in-out infinite;
            }
            @keyframes pulse-dot {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }
            .dark-mode .contador-visitantes {
                background: linear-gradient(135deg, #1f2937, #111827);
                border-color: #374151;
            }
            .dark-mode .contador-label {
                color: #9ca3af;
            }
            .dark-mode .contador-status {
                background: #374151;
                color: #9ca3af;
            }
            .dark-mode .contador-valor {
                background: linear-gradient(135deg, #34d399, #10b981);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            @media (max-width: 640px) {
                .contador-visitantes { padding: 14px 20px; gap: 12px; max-width: 100%; margin: 12px 16px 20px; border-radius: 12px; }
                .contador-icone { width: 36px; height: 36px; }
                .contador-icone svg { width: 18px; height: 18px; }
                .contador-valor { font-size: 22px; min-width: 60px; }
                .contador-label { font-size: 10px; }
                .contador-conteudo { gap: 10px; }
                .contador-status { font-size: 10px; padding: 3px 10px; }
            }
            @media (max-width: 480px) {
                .contador-visitantes { padding: 12px 16px; gap: 10px; flex-wrap: wrap; justify-content: center; }
                .contador-valor { font-size: 20px; min-width: 50px; }
                .contador-conteudo { justify-content: center; gap: 6px; }
                .contador-label { width: 100%; text-align: center; }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    async function init() {
        adicionarEstilos();

        await registrarVisita();

        var total = await obterTotalVisitantes();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                inserirContador(total);
            });
        } else {
            inserirContador(total);
        }

        setInterval(async function() {
            var novoTotal = await obterTotalVisitantes();
            var valorElement = document.getElementById('contador-valor');
            if (valorElement) {
                valorElement.textContent = formatarNumero(novoTotal);
            }
        }, 30000);
    }

    init();

    window.contadorVisitantes = {
        obterTotal: obterTotalVisitantes,
        formatar: formatarNumero,
        registrar: registrarVisita
    };

})();
