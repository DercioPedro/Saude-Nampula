// carrossel.js - Carrossel de publicações na página inicial

(function() {
    'use strict';

    var API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';

    var slideAtual = 0;
    var totalSlides = 0;
    var publicacoes = [];
    var intervalo = null;

    // ==================== BUSCAR PUBLICAÇÕES ====================
    async function buscarPublicacoes() {
        try {
            var response = await fetch(API_URL + '/publicacoes?limit=5');
            
            if (!response.ok) {
                throw new Error('Erro ao buscar publicações');
            }
            
            publicacoes = await response.json();
            
            // Limitar a 5 publicações
            if (publicacoes.length > 5) {
                publicacoes = publicacoes.slice(0, 5);
            }
            
            return publicacoes;
        } catch (error) {
            console.error('Erro ao carregar publicações:', error);
            return [];
        }
    }

    // ==================== OBTER ICONE DA CATEGORIA ====================
    function getCategoriaIcon(categoria) {
        var icons = {
            'Noticia': '📰',
            'Dica': '💡',
            'Alerta': '⚠️',
            'Evento': '📅',
            'Campanha': '🏥',
            'Informacao': 'ℹ️'
        };
        return icons[categoria] || '📌';
    }

    function getCategoriaClass(categoria) {
        var classes = {
            'Noticia': 'categoria-noticia',
            'Dica': 'categoria-dica',
            'Alerta': 'categoria-alerta',
            'Evento': 'categoria-evento',
            'Campanha': 'categoria-campanha',
            'Informacao': 'categoria-informacao'
        };
        return classes[categoria] || 'categoria-informacao';
    }

    function getCategoriaLabel(categoria) {
        var labels = {
            'Noticia': 'Notícia',
            'Dica': 'Dica',
            'Alerta': 'Alerta',
            'Evento': 'Evento',
            'Campanha': 'Campanha',
            'Informacao': 'Informação'
        };
        return labels[categoria] || categoria;
    }

    // ==================== RENDERIZAR CARROSSEL ====================
    function renderizarCarrossel() {
        var container = document.getElementById('carrosselSlides');
        var indicadores = document.getElementById('carrosselIndicadores');
        
        if (!container) return;

        if (publicacoes.length === 0) {
            container.innerHTML = `
                <div class="carrossel-vazio">
                    <span style="font-size: 32px; display: block; margin-bottom: 10px;">📝</span>
                    <p>Nenhuma publicação disponível no momento.</p>
                    <p style="font-size: 13px; color: #9ca3af;">Volte em breve para novidades.</p>
                </div>
            `;
            if (indicadores) indicadores.innerHTML = '';
            return;
        }

        totalSlides = publicacoes.length;

        // Gerar slides
        var slidesHTML = '';
        for (var i = 0; i < publicacoes.length; i++) {
            var pub = publicacoes[i];
            var categoriaClass = getCategoriaClass(pub.categoria);
            var categoriaLabel = getCategoriaLabel(pub.categoria);
            var categoriaIcon = getCategoriaIcon(pub.categoria);

            var imagemHTML = pub.imagem
                ? '<img src="' + pub.imagem + '" alt="' + pub.titulo + '">'
                : '<span>' + categoriaIcon + '</span>';

            var dataFormatada = new Date(pub.data).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            slidesHTML += `
                <div class="carrossel-slide" onclick="abrirPublicacaoHome(${pub.id})">
                    <div class="carrossel-slide-imagem">${imagemHTML}</div>
                    <div class="carrossel-slide-conteudo">
                        <span class="categoria ${categoriaClass}">${categoriaLabel}</span>
                        <h4 class="titulo">${escapeHtml(pub.titulo)}</h4>
                        <p class="resumo">${escapeHtml(pub.resumo)}</p>
                        <span class="data">📅 ${dataFormatada}</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = slidesHTML;

        // Gerar indicadores
        if (indicadores) {
            var indicadoresHTML = '';
            for (var j = 0; j < totalSlides; j++) {
                var ativo = j === 0 ? 'ativo' : '';
                indicadoresHTML += `
                    <button class="carrossel-indicador ${ativo}" data-indice="${j}" onclick="irParaSlide(${j})"></button>
                `;
            }
            indicadores.innerHTML = indicadoresHTML;
        }

        // Atualizar slide atual
        slideAtual = 0;
        atualizarCarrossel();
        iniciarAutoPlay();
    }

    // ==================== ATUALIZAR CARROSSEL ====================
    function atualizarCarrossel() {
        var container = document.getElementById('carrosselSlides');
        var indicadores = document.querySelectorAll('.carrossel-indicador');
        
        if (!container) return;

        var offset = -slideAtual * 100;
        container.style.transform = 'translateX(' + offset + '%)';

        // Atualizar indicadores
        indicadores.forEach(function(ind, index) {
            if (index === slideAtual) {
                ind.classList.add('ativo');
            } else {
                ind.classList.remove('ativo');
            }
        });
    }

    // ==================== NAVEGAÇÃO ====================
    function irParaSlide(indice) {
        if (indice < 0) indice = totalSlides - 1;
        if (indice >= totalSlides) indice = 0;
        slideAtual = indice;
        atualizarCarrossel();
        reiniciarAutoPlay();
    }

    function proximoSlide() {
        var novoIndice = slideAtual + 1;
        if (novoIndice >= totalSlides) novoIndice = 0;
        irParaSlide(novoIndice);
    }

    function anteriorSlide() {
        var novoIndice = slideAtual - 1;
        if (novoIndice < 0) novoIndice = totalSlides - 1;
        irParaSlide(novoIndice);
    }

    // ==================== AUTO PLAY ====================
    function iniciarAutoPlay() {
        pararAutoPlay();
        if (totalSlides > 1) {
            intervalo = setInterval(proximoSlide, 5000);
        }
    }

    function pararAutoPlay() {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
    }

    function reiniciarAutoPlay() {
        pararAutoPlay();
        iniciarAutoPlay();
    }

    // ==================== ABRIR PUBLICAÇÃO ====================
    function abrirPublicacaoHome(id) {
        window.location.href = '/dicas?abrir=' + id;
    }

    // ==================== ESCAPE HTML ====================
    function escapeHtml(texto) {
        if (!texto) return '';
        var div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // ==================== INICIALIZAR ====================
    async function inicializarCarrossel() {
        var container = document.getElementById('carrosselSlides');
        if (!container) return;

        // Mostrar loading
        container.innerHTML = '<div class="carrossel-loading">Carregando publicações...</div>';

        // Buscar publicações
        await buscarPublicacoes();

        // Renderizar
        renderizarCarrossel();

        // Eventos dos botões
        var btnAnterior = document.getElementById('btnAnterior');
        var btnProximo = document.getElementById('btnProximo');

        if (btnAnterior) {
            btnAnterior.addEventListener('click', function() {
                anteriorSlide();
                reiniciarAutoPlay();
            });
        }

        if (btnProximo) {
            btnProximo.addEventListener('click', function() {
                proximoSlide();
                reiniciarAutoPlay();
            });
        }

        // Pausar autoplay ao passar o mouse
        var carrosselContainer = document.querySelector('.carrossel-container');
        if (carrosselContainer) {
            carrosselContainer.addEventListener('mouseenter', pararAutoPlay);
            carrosselContainer.addEventListener('mouseleave', iniciarAutoPlay);
        }

        // Verificar se tem publicação para abrir na página de informações
        var urlParams = new URLSearchParams(window.location.search);
        var abrirId = urlParams.get('abrir');
        if (abrirId && window.location.pathname.includes('dicas.html')) {
            // A função será executada na página dicas.html
            if (typeof window.abrirPublicacao === 'function') {
                setTimeout(function() {
                    window.abrirPublicacao(parseInt(abrirId));
                }, 1000);
            }
        }
    }

    // ==================== EXPORTAR FUNÇÕES ====================
    window.irParaSlide = irParaSlide;
    window.proximoSlide = proximoSlide;
    window.anteriorSlide = anteriorSlide;
    window.abrirPublicacaoHome = abrirPublicacaoHome;
    window.inicializarCarrossel = inicializarCarrossel;

    // ==================== EXECUTAR ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarCarrossel);
    } else {
        inicializarCarrossel();
    }

})();
