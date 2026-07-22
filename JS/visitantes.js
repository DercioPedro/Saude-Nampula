// contador-visitantes.js - Contador REAL de visitantes

(function() {
    'use strict';

    var API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';

    // ========================================
    // FUNÇÕES
    // ========================================

    function formatarNumero(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function gerarIdUnico() {
        return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function() {
            return Math.floor(Math.random() * 16).toString(16);
        });
    }

    function obterIdVisitante() {
        var id = localStorage.getItem('visitante_id_saude');
        if (!id) {
            id = gerarIdUnico();
            localStorage.setItem('visitante_id_saude', id);
        }
        return id;
    }

    // ========================================
    // REGISTAR VISITA
    // ========================================

    async function registrarVisita() {
        try {
            var visitanteId = obterIdVisitante();
            var hoje = new Date().toISOString().split('T')[0];
            var pagina = window.location.pathname || '/';

            // Verificar se já registou hoje
            var ultimoRegisto = localStorage.getItem('ultimo_registo_visita');
            var hojeStr = new Date().toDateString();

            if (ultimoRegisto === hojeStr) {
                // Já registou hoje, apenas incrementa visualizações
                await apiRequest('/visitantes/visualizacao', 'POST', {
                    data: hoje,
                    pagina: pagina
                });
                return;
            }

            // Registrar nova visita
            var response = await apiRequest('/visitantes/registrar', 'POST', {
                visitante_id: visitanteId,
                pagina: pagina,
                data: hoje
            });

            if (response.success) {
                localStorage.setItem('ultimo_registo_visita', hojeStr);
            }

        } catch (error) {
            console.error('Erro ao registrar visita:', error);
        }
    }

    // ========================================
    // OBTER TOTAL DE VISITANTES
    // ========================================

    async function obterTotalVisitantes() {
        try {
            var response = await apiRequest('/visitantes/total');
            return response.total || 0;
        } catch (error) {
            console.error('Erro ao obter total:', error);
            return 0;
        }
    }

    // ========================================
    // ANIMAÇÃO DE CONTAGEM
    // ========================================

    function animarContador(elemento, valorFinal, duracao) {
        duracao = duracao || 2000;
        var valorInicial = 0;
        var totalPassos = 60;
        var passo = Math.ceil(valorFinal / totalPassos);
        var intervalo = duracao / totalPassos;

        if (passo < 1) passo = 1;

        var contador = setInterval(function() {
            valorInicial += passo;
            if (valorInicial >= valorFinal) {
                valorInicial = valorFinal;
                clearInterval(contador);
            }
            elemento.textContent = formatarNumero(valorInicial);
        }, intervalo);
    }

    // ========================================
    // CRIAR ELEMENTOS DO CONTADOR
    // ========================================

    function criarContador(total) {
        var totalFormatado = formatarNumero(total);

        var container = document.createElement('div');
        container.id = 'contador-visitantes';
        container.className = 'contador-visitantes';

        // Ícone
        var icone = document.createElement('span');
        icone.className = 'contador-icone';
        icone.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

        // Conteúdo
        var conteudo = document.createElement('div');
        conteudo.className = 'contador-conteudo';

        var label = document.createElement('span');
        label.className = 'contador-label';
        label.textContent = 'Visitantes';

        var valor = document.createElement('span');
        valor.className = 'contador-valor';
        valor.id = 'contador-valor';
        valor.textContent = '0';

        var status = document.createElement('span');
        status.className = 'contador-status';
        status.innerHTML = `<span class="status-dot"></span> Ao vivo`;

        conteudo.appendChild(label);
        conteudo.appendChild(valor);
        conteudo.appendChild(status);

        container.appendChild(icone);
        container.appendChild(conteudo);

        return container;
    }

    // ========================================
    // INSERIR CONTADOR NA PÁGINA
    // ========================================

    function inserirContador(total) {
        var target = document.querySelector('.hero');

        if (!target) {
            target = document.querySelector('main');
        }

        if (!target) {
            target = document.body;
        }

        if (document.getElementById('contador-visitantes')) {
            return;
        }

        var contador = criarContador(total);

        if (target.classList.contains('hero')) {
            target.parentNode.insertBefore(contador, target.nextSibling);
        } else {
            target.insertBefore(contador, target.firstChild);
        }

        // Animar contador
        var elementoValor = document.getElementById('contador-valor');
        if (elementoValor) {
            setTimeout(function() {
                animarContador(elementoValor, total, 2500);
            }, 500);
        }
    }

    // ========================================
    // ESTILOS (adicionados dinamicamente)
    // ========================================

    function adicionarEstilos() {
        var style = document.createElement('style');
        style.textContent = `
            .contador-visitantes {
                display: flex;
                align-items: center;
                gap: 16px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                padding: 16px 28px;
                margin: 16px auto 24px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                max-width: 400px;
                transition: all 0.3s ease;
            }

            .contador-visitantes:hover {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                transform: translateY(-2px);
            }

            .contador-icone {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
                font-variant-numeric: tabular-nums;
                min-width: 80px;
                text-align: center;
                letter-spacing: 0.5px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
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
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
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
                background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            @media (max-width: 640px) {
                .contador-visitantes {
                    padding: 14px 20px;
                    gap: 12px;
                    max-width: 100%;
                    margin: 12px 16px 20px;
                    border-radius: 12px;
                }
                .contador-icone {
                    width: 36px;
                    height: 36px;
                }
                .contador-icone svg {
                    width: 18px;
                    height: 18px;
                }
                .contador-valor {
                    font-size: 22px;
                    min-width: 60px;
                }
                .contador-label {
                    font-size: 10px;
                }
                .contador-conteudo {
                    gap: 10px;
                }
                .contador-status {
                    font-size: 10px;
                    padding: 3px 10px;
                }
            }

            @media (max-width: 480px) {
                .contador-visitantes {
                    padding: 12px 16px;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .contador-valor {
                    font-size: 20px;
                    min-width: 50px;
                }
                .contador-conteudo {
                    justify-content: center;
                    gap: 6px;
                }
                .contador-label {
                    width: 100%;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    async function init() {
        adicionarEstilos();

        // Registrar visita
        await registrarVisita();

        // Obter total
        var total = await obterTotalVisitantes();

        // Inserir contador
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                inserirContador(total);
            });
        } else {
            inserirContador(total);
        }
    }

    // ========================================
    // EXPORTAR
    // ========================================

    window.contadorVisitantes = {
        obterTotal: obterTotalVisitantes,
        formatar: formatarNumero,
        registrar: registrarVisita
    };

    // Iniciar
    init();

})();
