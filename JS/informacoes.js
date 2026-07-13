// ========================================
// INFORMACOES.JS - Sistema de publicacoes
// ========================================

// Configuracao
const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';

// Variaveis globais
let publicacoes = [];
let publicacaoAtual = null;

// ========================================
// CARREGAR PUBLICACOES
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
// RENDERIZAR PUBLICACOES
// ========================================
function renderizarPublicacoes(lista) {
    const container = document.getElementById('publicacoesContainer');

    if (!lista || lista.length === 0) {
        container.innerHTML = `
            <div class="empty-publicacoes">
                <span class="icon"></span>
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
                        <span>${dataFormatada}</span>
                        <span class="publicacao-ler-mais">Ler mais</span>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ========================================
// FUNCOES AUXILIARES DE CATEGORIA
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
// FILTRAR PUBLICACOES
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

// ========================================
// COMPARTILHAR PUBLICACAO
// ========================================

function gerarLinkPublicacao(id) {
    var url = window.location.origin + '/dicas?abrir=' + id;
    return url;
}

function copiarLinkPublicacao(id) {
    var link = gerarLinkPublicacao(id);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function() {
            mostrarMensagem('Link copiado com sucesso!');
        }).catch(function() {
            copiarLinkFallback(link);
        });
    } else {
        copiarLinkFallback(link);
    }
}

function copiarLinkFallback(link) {
    var input = document.createElement('input');
    input.value = link;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    mostrarMensagem('Link copiado com sucesso!');
}

function compartilharWhatsApp(id) {
    var link = gerarLinkPublicacao(id);
    var titulo = publicacaoAtual ? publicacaoAtual.titulo : 'Publicacao';
    var texto = encodeURIComponent('Confira esta publicacao do Saude Nampula: ' + titulo + '\n\n' + link);
    window.open('https://api.whatsapp.com/send?text=' + texto, '_blank');
}

function compartilharFacebook(id) {
    var link = gerarLinkPublicacao(id);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link), '_blank');
}

function compartilharTwitter(id) {
    var link = gerarLinkPublicacao(id);
    var titulo = publicacaoAtual ? publicacaoAtual.titulo : 'Publicacao';
    var texto = encodeURIComponent(titulo + ' - ' + link);
    window.open('https://twitter.com/intent/tweet?text=' + texto, '_blank');
}

function compartilharEmail(id) {
    var link = gerarLinkPublicacao(id);
    var titulo = publicacaoAtual ? publicacaoAtual.titulo : 'Publicacao';
    var assunto = encodeURIComponent('Saude Nampula - ' + titulo);
    var corpo = encodeURIComponent('Ola! Encontrei esta publicacao interessante no Saude Nampula:\n\n' + titulo + '\n\n' + link + '\n\nVisite: ' + window.location.origin);
    window.location.href = 'mailto:?subject=' + assunto + '&body=' + corpo;
}

function mostrarMensagem(texto) {
    var mensagem = document.getElementById('mensagemCompartilhar');
    if (!mensagem) {
        mensagem = document.createElement('div');
        mensagem.id = 'mensagemCompartilhar';
        mensagem.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #059669; color: white; padding: 12px 24px; border-radius: 8px; z-index: 9999; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none;';
        document.body.appendChild(mensagem);
    }
    
    mensagem.textContent = texto;
    mensagem.style.display = 'block';
    
    setTimeout(function() {
        mensagem.style.display = 'none';
    }, 3000);
}

// ========================================
// ABRIR PUBLICACAO (MODAL)
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
                <span>${escapeHtml(pub.autor || 'Anonimo')}</span>
                <span>${dataFormatada}</span>
            </div>
            <div class="conteudo-completo">
                ${pub.conteudo}
            </div>
            <div class="modal-acoes-compartilhar">
                <button class="btn-compartilhar" onclick="copiarLinkPublicacao(${pub.id})">
                    Copiar Link
                </button>
                <button class="btn-compartilhar btn-whatsapp" onclick="compartilharWhatsApp(${pub.id})">
                    WhatsApp
                </button>
                <button class="btn-compartilhar btn-facebook" onclick="compartilharFacebook(${pub.id})">
                    Facebook
                </button>
                <button class="btn-compartilhar btn-twitter" onclick="compartilharTwitter(${pub.id})">
                    Twitter
                </button>
                <button class="btn-compartilhar btn-email" onclick="compartilharEmail(${pub.id})">
                    Email
                </button>
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
    var modal = document.getElementById('modalPublicacao');
    modal.classList.remove('active');
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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalPublicacao();
    }
});

document.getElementById('modalPublicacao').addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModalPublicacao();
    }
});

// ========================================
// VERIFICAR SE TEM PUBLICACAO PARA ABRIR VIA LINK
// ========================================

var urlParams = new URLSearchParams(window.location.search);
var abrirId = urlParams.get('abrir');

if (abrirId) {
    var checkPublicacoes = setInterval(function() {
        if (publicacoes.length > 0) {
            clearInterval(checkPublicacoes);
            var pub = publicacoes.find(function(p) { 
                return p.id === parseInt(abrirId); 
            });
            if (pub) {
                setTimeout(function() {
                    abrirPublicacao(pub.id);
                }, 800);
            }
        }
    }, 200);
}

// ========================================
// INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    carregarPublicacoes();
});

// ========================================
// EXPORTAR FUNCOES
// ========================================
window.abrirPublicacao = abrirPublicacao;
window.fecharModalPublicacao = fecharModalPublicacao;
window.filtrarPublicacoes = filtrarPublicacoes;
window.carregarPublicacoes = carregarPublicacoes;
window.copiarLinkPublicacao = copiarLinkPublicacao;
window.compartilharWhatsApp = compartilharWhatsApp;
window.compartilharFacebook = compartilharFacebook;
window.compartilharTwitter = compartilharTwitter;
window.compartilharEmail = compartilharEmail;
window.gerarLinkPublicacao = gerarLinkPublicacao;
