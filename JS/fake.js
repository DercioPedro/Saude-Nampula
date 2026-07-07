// visitantes-falsos.js - Contador falso de visitantes

(function() {
    'use strict';

    // ==================== CONFIGURACAO ====================
    var CONFIG = {
        minVisitantes: 150,        // Valor inicial minimo
        maxVisitantes: 350,        // Valor inicial maximo
        incrementoMin: 2,          // Incremento minimo por hora
        incrementoMax: 8,          // Incremento maximo por hora
        intervaloHoras: 1,         // Intervalo em horas
        chaveStorage: 'visitantes_falsos'
    };

    // ==================== FUNCOES ====================

    // Gerar numero aleatorio entre min e max
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Formatar numero com separadores
    function formatarNumero(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // Obter dados atuais do storage
    function obterDados() {
        try {
            var dados = localStorage.getItem(CONFIG.chaveStorage);
            if (dados) {
                return JSON.parse(dados);
            }
        } catch (e) {
            console.warn('Erro ao ler storage:', e);
        }
        return null;
    }

    // Salvar dados no storage
    function salvarDados(dados) {
        try {
            localStorage.setItem(CONFIG.chaveStorage, JSON.stringify(dados));
        } catch (e) {
            console.warn('Erro ao salvar storage:', e);
        }
    }

    // Inicializar dados
    function inicializarDados() {
        var dados = {
            total: randomInt(CONFIG.minVisitantes, CONFIG.maxVisitantes),
            ultimaAtualizacao: Date.now()
        };
        salvarDados(dados);
        return dados;
    }

    // Calcular novo total com incremento
    function calcularNovoTotal(totalAtual) {
        var incremento = randomInt(CONFIG.incrementoMin, CONFIG.incrementoMax);
        var novoTotal = totalAtual + incremento;
        // Adicionar um pouco de variacao (as vezes mais, as vezes menos)
        if (Math.random() > 0.7) {
            novoTotal += randomInt(1, 5);
        }
        return novoTotal;
    }

    // Obter total de visitantes (com atualizacao automatica)
    function obterTotalVisitantes() {
        var dados = obterDados();
        
        // Se nao tem dados, inicializar
        if (!dados) {
            dados = inicializarDados();
            return dados.total;
        }

        var agora = Date.now();
        var diferencaHoras = (agora - dados.ultimaAtualizacao) / (1000 * 60 * 60);

        // Se passou mais de 1 hora, atualizar
        if (diferencaHoras >= CONFIG.intervaloHoras) {
            var horasPassadas = Math.floor(diferencaHoras);
            var novoTotal = dados.total;

            for (var i = 0; i < horasPassadas; i++) {
                novoTotal = calcularNovoTotal(novoTotal);
            }

            dados.total = novoTotal;
            dados.ultimaAtualizacao = agora;
            salvarDados(dados);
        }

        return dados.total;
    }

    // ==================== RENDERIZACAO ====================

    // Criar elemento do contador
    function criarContador() {
        var total = obterTotalVisitantes();
        var totalFormatado = formatarNumero(total);

        var container = document.createElement('div');
        container.id = 'contador-visitantes';
        container.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #059669, #047857);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            max-width: fit-content;
            margin: 16px auto;
            transition: all 0.3s ease;
            cursor: default;
        `;

        container.innerHTML = `
            <span style="font-size: 18px;">👤</span>
            <span style="font-weight: 300;">Visitantes:</span>
            <span id="contador-valor" style="font-size: 22px; font-weight: 700; min-width: 60px; text-align: center;">${totalFormatado}</span>
            <span style="font-size: 12px; opacity: 0.8;">(atualizado)</span>
        `;

        return container;
    }

    // Atualizar contador na tela
    function atualizarContador() {
        var valorElement = document.getElementById('contador-valor');
        if (valorElement) {
            var total = obterTotalVisitantes();
            var totalFormatado = formatarNumero(total);
            
            // Adicionar animacao de pulso
            valorElement.style.transition = 'transform 0.2s ease';
            valorElement.style.transform = 'scale(1.2)';
            
            setTimeout(function() {
                valorElement.textContent = totalFormatado;
                valorElement.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // ==================== INICIALIZACAO ====================

    // Inserir contador na pagina
    function inserirContador() {
        var container = document.querySelector('.hero');
        if (!container) {
            container = document.querySelector('main');
        }
        if (!container) {
            container = document.body;
        }

        var contador = criarContador();
        
        // Inserir no inicio do container
        if (container.firstChild) {
            container.insertBefore(contador, container.firstChild);
        } else {
            container.appendChild(contador);
        }
    }

    // ==================== EXECUTAR ====================

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            inserirContador();
            
            // Atualizar a cada 30 segundos (simula visitantes reais)
            setInterval(function() {
                // Verificar se passou 1 hora desde a ultima atualizacao
                var dados = obterDados();
                if (dados) {
                    var agora = Date.now();
                    var diferencaHoras = (agora - dados.ultimaAtualizacao) / (1000 * 60 * 60);
                    if (diferencaHoras >= 1) {
                        atualizarContador();
                    }
                }
            }, 30000); // Verificar a cada 30 segundos
        });
    } else {
        inserirContador();
    }

    // ==================== EXPORTAR (opcional) ====================
    window.contadorVisitantes = {
        obterTotal: obterTotalVisitantes,
        atualizar: atualizarContador,
        resetar: function() {
            localStorage.removeItem(CONFIG.chaveStorage);
            location.reload();
        }
    };

    console.log('Contador falso de visitantes iniciado!');
    console.log('Total atual:', formatarNumero(obterTotalVisitantes()));

})();
