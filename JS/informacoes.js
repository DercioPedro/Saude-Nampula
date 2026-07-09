// ========================================
// INFORMACOES.JS - Sistema de publicações
// ========================================

// Configuração
const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';

// Variáveis globais
let publicacoes = [];
let publicacaoAtual = null;

// ========================================
// CARREGAR PUBLICAÇÕES
// ========================================
async function carregarPublicacoes() {
    const container = document.getElementById('publicacoesContainer');

    try {
        const response = await fetch(API_URL + '/publicacoes');

        if (response.ok) {
            publicacoes = await response.json();
        } else {
            publicacoes = [];
        }

        // Ordenar por data (mais recentes primeiro)
        publicacoes.sort(function(a, b) {
            return new Date(b.data) - new Date(a.data);
        });

        renderizarPublicacoes(publicacoes);

    } catch (error) {
        console.error('Erro ao carregar publicacoes:', error);
        publicacoes = [];
        renderizarPublicacoes(publicacoes);
    }
}

// ========================================
// RENDERIZAR PUBLICAÇÕES
// ========================================
function renderizarPublicacoes(lista) {
    const container = document.getElementById('publicacoesContainer');

    if (!lista || lista.length === 0) {
        container.innerHTML = `
            <div class="empty-publicacoes">
                <span class="icon">📝</span>
                <h3>Nenhuma publicacao disponivel</h3>
                <p>Volte em breve para novas informacoes de saude.</p>
            </div>
        `;
        return;
    }

    var html = '<div class="publicacoes-grid">';

    for (var i = 0; i < lista.length; i++) {
        var pub = lista[i];
        var categoriaClass = getCategoriaClass(pub.categoria);
        var categoriaLabel = getCategoriaLabel(pub.categoria);

        var imagemHTML = pub.imagem
            ? '<img src="' + pub.imagem + '" alt="' + pub.titulo + '" class="publicacao-imagem">'
            : '<div class="publicacao-imagem-placeholder">' + getCategoriaIcon(pub.categoria) + '</div>';

        var dataFormatada = new Date(pub.data).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        html += `
            <div class="publicacao-card" onclick="abrirPublicacao(${pub.id})">
                ${imagemHTML}
                <div class="publicacao-conteudo">
                    <span class="publicacao-categoria ${categoriaClass}">${categoriaLabel}</span>
                    <h3 class="publicacao-titulo">${escapeHtml(pub.titulo)}</h3>
                    <p class="publicacao-resumo">${escapeHtml(pub.resumo)}</p>
                    <div class="publicacao-meta">
                        <span>📅 ${dataFormatada}</span>
                        <span class="publicacao-ler-mais">Ler mais →</span>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ========================================
// FUNÇÕES AUXILIARES DE CATEGORIA
// ========================================
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
        'Noticia': 'Noticia',
        'Dica': 'Dica',
        'Alerta': 'Alerta',
        'Evento': 'Evento',
        'Campanha': 'Campanha',
        'Informacao': 'Informacao'
    };
    return labels[categoria] || categoria;
}

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

// ========================================
// FILTRAR PUBLICAÇÕES
// ========================================
function filtrarPublicacoes() {
    var filtro = document.getElementById('filtroCategoria').value;
    var lista = publicacoes;

    if (filtro) {
        lista = publicacoes.filter(function(p) {
            return p.categoria === filtro;
        });
    }

    renderizarPublicacoes(lista);
}


// Verificar se tem publicação para abrir
var urlParams = new URLSearchParams(window.location.search);
var abrirId = urlParams.get('abrir');

if (abrirId) {
    // Aguardar as publicações carregarem
    var checkPublicacoes = setInterval(function() {
        if (typeof publicacoes !== 'undefined' && publicacoes.length > 0) {
            clearInterval(checkPublicacoes);
            var pub = publicacoes.find(function(p) { return p.id === parseInt(abrirId); });
            if (pub) {
                setTimeout(function() {
                    abrirPublicacao(pub.id);
                }, 500);
            }
        }
    }, 200);
}

// ========================================
// ABRIR PUBLICAÇÃO (MODAL)
// ========================================
function abrirPublicacao(id) {
    var pub = publicacoes.find(function(p) {
        return p.id === id;
    });

    if (!pub) return;

    publicacaoAtual = pub;

    var modal = document.getElementById('modalPublicacao');
    var body = document.getElementById('modalPublicacaoBody');

    var categoriaClass = getCategoriaClass(pub.categoria);
    var categoriaLabel = getCategoriaLabel(pub.categoria);

    var imagemHTML = pub.imagem
        ? '<img src="' + pub.imagem + '" alt="' + pub.titulo + '" class="modal-publicacao-imagem">'
        : '';

    var dataFormatada = new Date(pub.data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    body.innerHTML = `
        ${imagemHTML}
        <div class="modal-publicacao-body">
            <span class="categoria ${categoriaClass}">${categoriaLabel}</span>
            <h2>${escapeHtml(pub.titulo)}</h2>
            <div class="meta">
                <span>👤 ${escapeHtml(pub.autor || 'Anonimo')}</span>
                <span>📅 ${dataFormatada}</span>
            </div>
            <div class="conteudo-completo">
                ${pub.conteudo}
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ========================================
// FECHAR MODAL
// ========================================
function fecharModalPublicacao() {
    document.getElementById('modalPublicacao').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========================================
// ESCAPE HTML
// ========================================
function escapeHtml(texto) {
    if (!texto) return '';
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ========================================
// EVENTOS
// ========================================

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalPublicacao();
    }
});

// Fechar modal clicando fora
document.getElementById('modalPublicacao').addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModalPublicacao();
    }
});

// ========================================
// INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    carregarPublicacoes();
});

// ========================================
// EXPORTAR FUNÇÕES
// ========================================
window.abrirPublicacao = abrirPublicacao;
window.fecharModalPublicacao = fecharModalPublicacao;
window.filtrarPublicacoes = filtrarPublicacoes;
window.carregarPublicacoes = carregarPublicacoes;
