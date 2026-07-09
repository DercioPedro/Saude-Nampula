// load-hospitais.js - Versão com API, coordenadas e avaliações

async function buscarStatsAvaliacao(tipo, id) {
    try {
        const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';
        const response = await fetch(`${API_URL}/avaliacoes/estatisticas?tipo=${tipo}&tipo_id=${id}`);
        if (!response.ok) return { total: 0, media: 0 };
        const stats = await response.json();
        return stats;
    } catch (error) {
        return { total: 0, media: 0 };
    }
}

function obterUrlGoogleMaps(hospital) {
    if (hospital.latitude && hospital.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    } else if (hospital.endereco) {
        const enderecoCompleto = encodeURIComponent(hospital.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

function obterUrlWaze(hospital) {
    if (hospital.latitude && hospital.longitude) {
        return `https://www.waze.com/ul?ll=${hospital.latitude},${hospital.longitude}&navigate=yes`;
    } else if (hospital.endereco) {
        const enderecoCompleto = encodeURIComponent(hospital.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

function obterUrlDirecoes(hospital) {
    if (hospital.latitude && hospital.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
    } else if (hospital.endereco) {
        const enderecoCompleto = encodeURIComponent(hospital.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
}

async function carregarHospitais() {
    try {
        const hospitais = await apiRequest('/hospitais');
        
        let main = document.querySelector('main');
        let header = main.querySelector('.page-header');
        
        let cardsAntigos = document.querySelectorAll('.hospital-card');
        for (let i = 0; i < cardsAntigos.length; i++) {
            cardsAntigos[i].remove();
        }
        
        if (hospitais.length === 0) {
            let msg = document.createElement('div');
            msg.className = 'empty-message';
            msg.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <h3 style="font-size: 24px; margin-bottom: 16px;">Nenhum hospital cadastrado</h3>
                    <p>Os hospitais cadastrados aparecerão aqui.</p>
                </div>
            `;
            header.after(msg);
            return;
        }
        
        for (let i = 0; i < hospitais.length; i++) {
            let card = await criarCard(hospitais[i]);
            main.appendChild(card);
        }
    } catch (error) {
        console.error('Erro ao carregar hospitais:', error);
        mostrarMensagemErroHospitais();
    }
}

function mostrarMensagemErroHospitais() {
    let main = document.querySelector('main');
    if (main) {
        let msg = document.createElement('div');
        msg.className = 'empty-message';
        msg.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h3 style="color: #b91c1c;">Erro ao carregar hospitais</h3>
                <p>Verifique se o servidor está rodando.</p>
            </div>
        `;
        main.appendChild(msg);
    }
}

async function criarCard(hospital) {
    let card = document.createElement('div');
    card.className = 'hospital-card';
    card.setAttribute('data-id', hospital.id);
    
    // Buscar estatísticas de avaliações
    const stats = await buscarStatsAvaliacao('hospital', hospital.id);
    const media = stats.media || 0;
    const total = stats.total || 0;
    
    let servicos = [];
    if (hospital.servicos) {
        servicos = hospital.servicos.split(',');
    }
    
    let tagsServicos = '';
    for (let i = 0; i < servicos.length; i++) {
        let s = servicos[i].trim();
        if (s) {
            tagsServicos += `<span class="service-tag">${s}</span>`;
        }
    }
    
    let htmlServicos = '';
    if (servicos.length > 0) {
        htmlServicos = `
            <div class="services">
                <p class="services-label">Serviços:</p>
                <div class="services-tags">${tagsServicos}</div>
            </div>
        `;
    }
    
    const telefone = hospital.telefone || 'Telefone não informado';
    const endereco = hospital.endereco || 'Endereço não informado';
    const horario = hospital.horario || 'Horário não informado';
    
    const urlDirecoes = obterUrlDirecoes(hospital);
    const urlWaze = obterUrlWaze(hospital);
    
    // Criar estrelas
    const estrelasCheias = Math.round(media);
    let estrelasHTML = '';
    for (let i = 0; i < 5; i++) {
        if (i < estrelasCheias) {
            estrelasHTML += '<span style="color: #fbbf24;">★</span>';
        } else {
            estrelasHTML += '<span style="color: #d1d5db;">☆</span>';
        }
    }
    
    card.innerHTML = `
        <div class="hospital-header">
            <div class="hospital-title">
                <h3>${hospital.nome}</h3>
                <div class="avaliacao-stats" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    ${total > 0 ? `
                        <span style="font-size: 14px;">${estrelasHTML}</span>
                        <span style="font-size: 13px; font-weight: 600; color: #059669;">${media.toFixed(1)}</span>
                        <span style="font-size: 12px; color: #6b7280;">(${total} avaliações)</span>
                    ` : `
                        <span style="font-size: 13px; color: #6b7280;">Ainda sem avaliações</span>
                    `}
                </div>
                <span class="hospital-type">Hospital</span>
            </div>
            <span class="hospital-icon"><img src="/img/hospital.png" alt=""></span>
        </div>
        <div class="hospital-details">
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/ponto.png" alt=""></span>
                <span>${endereco}</span>
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
        ${htmlServicos}
        <div class="button-container" style="display: flex; gap: 8px; margin-top: 15px;">
            <button class="details-btn" onclick="verDetalhes(${hospital.id})" style="flex: 1;">Ver Detalhes</button>
        </div>
        <div class="directions-container" style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="directions-btn" onclick="window.open('${urlDirecoes}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                Como Chegar
            </button>
            <button class="waze-btn" onclick="window.open('${urlWaze}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                Waze
            </button>
        </div>
        <div class="avaliar-container" style="margin-top: 10px;">
            <button class="avaliar-btn" onclick="abrirModalAvaliacao('hospital', ${hospital.id})">
                ⭐ Avaliar
            </button>
        </div>
    `;
    
    return card;
}

function verDetalhes(id) {
    window.location.href = '/hospital-detalhes?id=' + id;
}

window.addEventListener('DOMContentLoaded', function () {
    carregarHospitais();
});
