// load-centros.js - Versão com API e priorização de coordenadas

// Funções auxiliares para obter URLs com prioridade para coordenadas
function obterUrlGoogleMaps(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${centro.latitude},${centro.longitude}`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

function obterUrlWaze(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.waze.com/ul?ll=${centro.latitude},${centro.longitude}&navigate=yes`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

function obterUrlDirecoes(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${centro.latitude},${centro.longitude}`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
}

async function carregarCentros() {
    try {
        console.log('Carregando centros...');
        const centros = await apiRequest('/centros');
        console.log('Centros recebidos:', centros);
        
        let grid = document.querySelector('.centros-grid');
        if (!grid) {
            console.error('Grid não encontrado');
            return;
        }
        
        grid.innerHTML = '';
        
        if (centros.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6b7280;">
                    <h3 style="font-size: 24px; margin-bottom: 16px;">Nenhum centro de saúde cadastrado</h3>
                    <p>Os centros de saúde cadastrados aparecerão aqui.</p>
                    <p style="margin-top: 10px;">Acesse o painel administrativo para adicionar centros.</p>
                </div>
            `;
            return;
        }
        
        for (let i = 0; i < centros.length; i++) {
            let card = criarCardCentro(centros[i]);
            grid.appendChild(card);
        }
    } catch (error) {
        console.error('Erro ao carregar centros:', error);
        mostrarMensagemErroCentros();
    }
}

function mostrarMensagemErroCentros() {
    let grid = document.querySelector('.centros-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="color: #b91c1c;">Erro ao carregar centros de saúde</h3>
                <p>Verifique se o servidor está rodando.</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer;">Tentar Novamente</button>
            </div>
        `;
    }
}

function criarCardCentro(centro) {
    let card = document.createElement('div');
    card.className = 'centro-card';
    
    let bairro = pegarBairro(centro.endereco);
    card.setAttribute('data-bairro', bairro);
    
    let servicos = [];
    if (centro.servicos) {
        servicos = centro.servicos.split(',').map(s => s.trim()).filter(s => s);
    } else {
        servicos = ['Consultas Gerais', 'Vacinação', 'Pré-natal', 'Planeamento Familiar'];
    }
    
    let listaServicos = '';
    for (let i = 0; i < servicos.length; i++) {
        listaServicos += `<li>${servicos[i]}</li>`;
    }
    
    let nomeBairro = pegarNomeBairro(centro.endereco);
    const telefone = centro.telefone || 'Telefone não informado';
    const horario = centro.horario || 'Horário não informado';
    
    // Obter URLs baseadas em coordenadas (prioridade) ou endereço
    const urlMapa = obterUrlGoogleMaps(centro);
    const urlWaze = obterUrlWaze(centro);
    const urlDirecoes = obterUrlDirecoes(centro);
    
    card.innerHTML = `
        <div class="centro-header">
            <span class="centro-icon"><img src="/img/centros.png" alt=""></span>
            <div class="centro-title">
                <h3>${centro.nome}</h3>
                <span class="centro-bairro">${nomeBairro}</span>
            </div>
        </div>
        <div class="centro-details">
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/ponto.png" alt=""></span>
                <span>${centro.endereco || 'Endereço não informado'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/call.png" alt=""></span>
                <span>${telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/clock.png" alt=""></span>
                <span>${horario}</span>
            </div>
        </div>
        <div class="services-list">
            <p>Serviços Disponíveis:</p>
            <ul>${listaServicos}</ul>
        </div>
        <div class="button-container" style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button class="info-btn" onclick="verDetalhes(${centro.id})" style="flex: 1;"> Mais Informações</button>
        </div>
        <div class="directions-container" style="display: flex; gap: 8px;">
            <button class="directions-btn" onclick="window.open('${urlDirecoes}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                 Como Chegar
            </button>
            <button class="waze-btn" onclick="window.open('${urlWaze}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                 Waze
            </button>
        </div>
    `;
    
    return card;
}

function pegarBairro(endereco) {
    if (!endereco) return 'outros';
    let bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine', 'muatala', 'moma', 'natikiri', 'nacala-a-velha', 'mocuba', 'monapo', 'mecuburi', 'mossuril', 'rapale', 'malema', 'meconta', 'eringa', 'memba'];
    let enderecoLower = endereco.toLowerCase();
    
    for (let i = 0; i < bairros.length; i++) {
        if (enderecoLower.includes(bairros[i])) {
            return bairros[i];
        }
    }
    return 'outros';
}

function pegarNomeBairro(endereco) {
    if (!endereco) return 'Nampula';
    let bairro = pegarBairro(endereco);
    if (bairro === 'outros') {
        return endereco.split(',')[0] || 'Nampula';
    }
    return 'Bairro ' + bairro.charAt(0).toUpperCase() + bairro.slice(1);
}

function filtrarCentros(bairro) {
    let cards = document.querySelectorAll('.centro-card');
    for (let i = 0; i < cards.length; i++) {
        if (bairro === 'todos') {
            cards[i].style.display = 'block';
        } else {
            let cardBairro = cards[i].getAttribute('data-bairro');
            cards[i].style.display = cardBairro === bairro ? 'block' : 'none';
        }
    }
}

function verDetalhes(id) {
    window.location.href = 'centros-detalhes.html?id=' + id;
}

// Aguardar o DOM carregar e o api-config.js estar disponível
document.addEventListener('DOMContentLoaded', function () {
    if (typeof apiRequest === 'undefined') {
        console.error('apiRequest não está definido! Verifique se api-config.js foi carregado primeiro.');
        mostrarMensagemErroCentros();
        return;
    }
    carregarCentros();
});
