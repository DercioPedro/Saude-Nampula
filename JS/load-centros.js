const centrosExemplo = [
    {
        id: 1,
        nome: "Centro de Saúde de Muatala",
        endereco: "Av. Eduardo Mondlane, Centro",
        telefone: "+258 26 213000",
        horario: "Aberto 24 Horas",
        plantao: true,
        medicamentos: ["Paracetamol 500mg - 50 MZN", "Amoxicilina 500mg - 120 MZN", "Ibuprofeno 400mg - 65 MZN"]
    },
    {
        id: 2,
        nome: "Centro de Saude Natikire ",
        endereco: "Centro da Cidade, Nampula",
        telefone: "+258 26 213001",
        horario: "08:00 - 20:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 45 MZN", "Dipirona 500mg - 40 MZN", "Omeprazol 20mg - 90 MZN"]
    },
    {
        id: 3,
        nome: "Centro de Saude Napipine",
        endereco: "Bairro Natikere, Nampula",
        telefone: "+258 26 213002",
        horario: "08:00 - 18:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 48 MZN", "Amoxicilina 500mg - 115 MZN", "Losartana 50mg - 85 MZN"]
    },
    {
        id: 4,
        nome: "Farmácia Mucatine",
        endereco: "Bairro Mucatine, Nampula",
        telefone: "+258 26 213003",
        horario: "07:00 - 19:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 47 MZN", "Ibuprofeno 400mg - 62 MZN", "Azitromicina 500mg - 150 MZN"]
    },
    {
        id: 5,
        nome: "Centro de Boa Saude",
        endereco: "Mercado Central, Nampula",
        telefone: "+258 26 213004",
        horario: "08:00 - 18:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 42 MZN", "Dipirona 500mg - 38 MZN", "Metformina 850mg - 75 MZN"]
    },
    {
        id: 6,
        nome: "Centro de Saude Good",
        endereco: "Av. do Trabalho, Nampula",
        telefone: "+258 26 213005",
        horario: "Aberto 24 Horas",
        plantao: true,
        medicamentos: ["Paracetamol 500mg - 52 MZN", "Amoxicilina 500mg - 125 MZN", "Omeprazol 20mg - 95 MZN"]
    }
];

// Inicializar ou atualizar localStorage com dados de exemplo
function inicializarDados() {
    localStorage.setItem('centros', JSON.stringify(centrosExemplo));
    console.log("Dados atualizados no localStorage");
}

// carregar centros
function carregarCentros() {
    let dados = localStorage.getItem('centros');
    let centros = dados ? JSON.parse(dados) : [];

    let grid = document.querySelector('.centros-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (centros.length == 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6b7280;">
                <h3 style="font-size: 24px; margin-bottom: 16px;">Nenhum centro de saúde cadastrado</h3>
                <p>Os centros de saúde cadastrados aparecerão aqui.</p>
            </div>
        `;
        return;
    }

    for (let i = 0; i < centros.length; i++) {
        let card = criarCardCentro(centros[i]);
        grid.appendChild(card);
    }
}

function criarCardCentro(centro) {
    let card = document.createElement('div');
    card.className = 'centro-card';

    let bairro = pegarBairro(centro.endereco);
    card.setAttribute('data-bairro', bairro);

    // servicos
    let servicos = ['Consultas Gerais', 'Vacinação', 'Pré-natal', 'Planeamento Familiar'];
    if (centro.servicos) {
        servicos = centro.servicos.split(',').map(s => s.trim()).filter(s => s);
    }

    let listaServicos = '';
    for (let i = 0; i < servicos.length; i++) {
        listaServicos += `<li>${servicos[i]}</li>`;
    }

    let nomeBairro = pegarNomeBairro(centro.endereco);

    card.innerHTML = `
        <div class="centro-header">
            <span class="centro-icon"><img src="img/centros.png" alt=""></span>
            <div class="centro-title">
                <h3>${centro.nome}</h3>
                <span class="centro-bairro">${nomeBairro}</span>
            </div>
        </div>

        <div class="centro-details">
            <div class="detail-item">
                <span class="detail-icon"><img src="img/ponto.png" alt=""></span>
                <span>${centro.endereco}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="img/call.png" alt=""></span>
                <span>${centro.telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="img/clock.png" alt=""></span>
                <span>${centro.horario}</span>
            </div>
        </div>

        <div class="services-list">
            <p>Serviços Disponíveis:</p>
            <ul>
                ${listaServicos}
            </ul>
        </div>

        <button class="info-btn" onclick="verDetalhes(${centro.id})">Mais Informações</button>
    `;

    return card;
}

function pegarBairro(endereco) {
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
    let bairro = pegarBairro(endereco);

    if (bairro == 'outros') {
        return endereco.split(',')[0] || 'Nampula';
    }

    return 'Bairro ' + bairro.charAt(0).toUpperCase() + bairro.slice(1);
}

function filtrarCentros(bairro) {
    let cards = document.querySelectorAll('.centro-card');

    for (let i = 0; i < cards.length; i++) {
        if (bairro == 'todos') {
            cards[i].style.display = 'block';
        } else {
            let cardBairro = cards[i].getAttribute('data-bairro');
            cards[i].style.display = cardBairro == bairro ? 'block' : 'none';
        }
    }
}

// Carregar centros do localStorage
function carregarCentros() {
    // Inicializar dados se necessário
    inicializarDados();

    // Recupera dados do localStorage
    let dados = localStorage.getItem('centros');
    let centros = dados ? JSON.parse(dados) : [];

    // Seleciona a grid de centros
    let centrosGrid = document.querySelector('.centros-grid');

    if (!centrosGrid) {
        console.error("Elemento .centros-grid não encontrado!");
        return;
    }

    // Limpa a grid
    centrosGrid.innerHTML = '';

    // Remove mensagem vazia se existir
    let msgVazia = document.querySelector('.empty-message');
    if (msgVazia) msgVazia.remove();

    // Se não há centros, mostra mensagem
    if (centros.length === 0) {
        mostrarMensagemVazia(centrosGrid);
        return;
    }

    // Cria cards para cada centro
    for (let i = 0; i < centros.length; i++) {
        let card = criarCardCentro(centros[i]);
        centrosGrid.appendChild(card);
    }
}
// ir para detalhes
function verDetalhes(id) {
    window.location.href = 'centros-detalhes.html?id=' + id;
}

window.addEventListener('DOMContentLoaded', function () {
    carregarCentros();
});
