// carregar emergencias
function carregarEmergenciasPrincipais() {
    let dados = localStorage.getItem('emergencias');
    let emergencias = dados ? JSON.parse(dados) : [];

    let grid = document.querySelector('.emergency-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (emergencias.length == 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6b7280;">
                <h3 style="font-size: 24px; margin-bottom: 16px;">Nenhum contato de emergência cadastrado</h3>
                <p>Os contatos de emergência aparecerão aqui.</p>
            </div>
        `;
        return;
    }

    // mostrar ate 4
    let quantidade = emergencias.length > 4 ? 4 : emergencias.length;

    for (let i = 0; i < quantidade; i++) {
        let card = criarCardEmergencia(emergencias[i], i);
        grid.appendChild(card);
    }
}

function criarCardEmergencia(emergencia, index) {
    let card = document.createElement('div');

    // Paleta de cores
    let cores = ['red', 'orange', 'blue', 'green'];
    let cor = cores[index % 4];

    // Mapeamento de ícones (emoji ou imagem)
    const icones = {
        'Ambulância': { emoji: '🚑', img: 'img/hospital.png' },
        'Bombeiros': { emoji: '🚒', img: 'img/bomber.png' },
        'Polícia': { emoji: '🚓', img: 'img/Police.png' },
        'Resgate': { emoji: '🆘', img: 'img/resgate.png' },
        'Hospital': { emoji: '🏥', img: 'img/hospital.png' }
    };

    // Pega o ícone correspondente ou usa padrão
    let iconeData = icones[emergencia.tipo] || { emoji: '📞', img: 'img/call.png' };

    // Se tiver imagem, usa <img>, senão usa emoji
    let iconeHTML = iconeData.img
        ? `<img src="${iconeData.img}" alt="${emergencia.tipo}" class="emergency-img">`
        : iconeData.emoji;

    // Classe do card
    card.className = 'emergency-card emergency-card-' + cor;

    // HTML do card
    card.innerHTML = `
        <div class="emergency-icon">${iconeHTML}</div>
        <h3>${emergencia.nome}</h3>
        <div class="emergency-number">${emergencia.telefone}</div>
        <p class="emergency-description">${emergencia.tipo} - ${emergencia.disponibilidade}</p>
        <button class="call-now-btn" onclick="ligarEmergencia('${emergencia.telefone}')">
            <img src="/img/call.png" alt="Ligar" class="call-icon"> LIGAR AGORA
        </button>
    `;

    return card;
}


function carregarContatosHospitalares() {
    let hospitais = JSON.parse(localStorage.getItem('hospitais') || '[]');
    let farmacias = JSON.parse(localStorage.getItem('farmacias') || '[]');
    let emergencias = JSON.parse(localStorage.getItem('emergencias') || '[]');

    let lista = document.querySelector('.hospital-list');
    if (!lista) return;

    lista.innerHTML = '';

    // adicionar emergencias tipo hospital
    for (let i = 0; i < emergencias.length; i++) {
        if (emergencias[i].tipo == 'Hospital' || emergencias[i].tipo == 'Ambulância') {
            let item = criarItemContato(
                emergencias[i].nome,
                emergencias[i].telefone,
                emergencias[i].disponibilidade
            );
            lista.appendChild(item);
        }
    }

    // hospitais 24h
    for (let i = 0; i < hospitais.length; i++) {
        if (hospitais[i].horario && hospitais[i].horario.includes('24')) {
            let item = criarItemContato(
                hospitais[i].nome,
                hospitais[i].telefone,
                'Urgências 24h'
            );
            lista.appendChild(item);
        }
    }

    // farmacias 24h
    for (let i = 0; i < farmacias.length; i++) {
        if (farmacias[i].plantao == 'Sim' || farmacias[i].plantao === true) {
            let item = criarItemContato(
                farmacias[i].nome,
                farmacias[i].telefone,
                'Medicamentos de urgência 24h'
            );
            lista.appendChild(item);
        }
    }

    if (lista.children.length == 0) {
        lista.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <p>Nenhum contato 24 horas disponível no momento.</p>
            </div>
        `;
    }
}

function criarItemContato(nome, telefone, descricao) {
    let item = document.createElement('div');
    item.className = 'hospital-item';

    item.innerHTML = `
        <div class="hospital-info">
            <h4>${nome}</h4>
            <p>${descricao}</p>
        </div>
        <div class="hospital-phone">${telefone}</div>
    `;

    return item;
}

function ligarEmergencia(telefone) {
    if (confirm('Deseja ligar para ' + telefone + '?')) {
        window.location.href = 'tel:' + telefone;
    }
}

window.addEventListener('DOMContentLoaded', function () {
    carregarEmergenciasPrincipais();
    carregarContatosHospitalares();
});
