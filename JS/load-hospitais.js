// load-hospitais.js - Versão com API

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
            let card = criarCard(hospitais[i]);
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
                <p>Verifique se o servidor está rodando em http://localhost:5000</p>
            </div>
        `;
        main.appendChild(msg);
    }
}

function criarCard(hospital) {
    let card = document.createElement('div');
    card.className = 'hospital-card';
    
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
    
    card.innerHTML = `
        <div class="hospital-header">
            <div class="hospital-title">
                <h3>${hospital.nome}</h3>
                <span class="hospital-type">Hospital</span>
            </div>
            <span class="hospital-icon"><img src="/img/hospital.png" alt=""></span>
        </div>
        <div class="hospital-details">
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/ponto.png" alt=""></span>
                <span>${hospital.endereco}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/call.png" alt=""></span>
                <span>${hospital.telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/clock.png" alt=""></span>
                <span>${hospital.horario}</span>
            </div>
        </div>
        ${htmlServicos}
        <button class="details-btn" onclick="verDetalhes(${hospital.id})">Ver Detalhes</button>
    `;
    
    return card;
}

function verDetalhes(id) {
    window.location.href = 'hospital-detalhes.html?id=' + id;
}

window.addEventListener('DOMContentLoaded', function () {
    carregarHospitais();
});