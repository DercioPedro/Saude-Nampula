// load-farmacias.js - Versão com Redirecionamento para Páginas

// ==================== CONFIGURAÇÃO INICIAL ====================
// Dados de exemplo para teste (caso não existam no localStorage)
const farmaciasExemplo = [
    {
        id: 1,
        nome: "Farmácia Moderna",
        endereco: "Av. Eduardo Mondlane, Centro",
        telefone: "+258 26 213000",
        horario: "Aberto 24 Horas",
        plantao: true,
        medicamentos: ["Paracetamol 500mg - 50 MZN", "Amoxicilina 500mg - 120 MZN", "Ibuprofeno 400mg - 65 MZN"]
    },
    {
        id: 2,
        nome: "Farmácia Central",
        endereco: "Centro da Cidade, Nampula",
        telefone: "+258 26 213001",
        horario: "08:00 - 20:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 45 MZN", "Dipirona 500mg - 40 MZN", "Omeprazol 20mg - 90 MZN"]
    },
    {
        id: 3,
        nome: "Farmácia São José",
        endereco: "Bairro Muhala, Nampula",
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
        nome: "Farmácia Popular",
        endereco: "Mercado Central, Nampula",
        telefone: "+258 26 213004",
        horario: "08:00 - 18:00",
        plantao: false,
        medicamentos: ["Paracetamol 500mg - 42 MZN", "Dipirona 500mg - 38 MZN", "Metformina 850mg - 75 MZN"]
    },
    {
        id: 6,
        nome: "Farmácia Saúde",
        endereco: "Av. do Trabalho, Nampula",
        telefone: "+258 26 213005",
        horario: "Aberto 24 Horas",
        plantao: true,
        medicamentos: ["Paracetamol 500mg - 52 MZN", "Amoxicilina 500mg - 125 MZN", "Omeprazol 20mg - 95 MZN"]
    }
];

// Inicializar localStorage com dados de exemplo se estiver vazio
function inicializarDados() {
    let dados = localStorage.getItem('farmacias');
    if (!dados || JSON.parse(dados).length === 0) {
        localStorage.setItem('farmacias', JSON.stringify(farmaciasExemplo));
        console.log("Dados de exemplo carregados no localStorage");
    }
}

// ==================== FUNÇÕES PRINCIPAIS ====================

// Carregar farmácias do localStorage
function carregarFarmacias() {
    // Inicializar dados se necessário
    inicializarDados();

    // Recupera dados do localStorage
    let dados = localStorage.getItem('farmacias');
    let farmacias = dados ? JSON.parse(dados) : [];

    // Seleciona a grid de farmácias
    let farmaciasGrid = document.querySelector('.farmacias-grid');

    if (!farmaciasGrid) {
        console.error("Elemento .farmacias-grid não encontrado!");
        return;
    }

    // Limpa a grid
    farmaciasGrid.innerHTML = '';

    // Remove mensagem vazia se existir
    let msgVazia = document.querySelector('.empty-message');
    if (msgVazia) msgVazia.remove();

    // Se não há farmácias, mostra mensagem
    if (farmacias.length === 0) {
        mostrarMensagemVazia(farmaciasGrid);
        return;
    }

    // Cria cards para cada farmácia
    for (let i = 0; i < farmacias.length; i++) {
        let card = criarCardFarmacia(farmacias[i]);
        farmaciasGrid.appendChild(card);
    }
}

// Mostrar mensagem quando não há farmácias
function mostrarMensagemVazia(gridElement) {
    let msg = document.createElement('div');
    msg.className = 'empty-message';
    msg.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 12px; grid-column: 1/-1;">
            <span style="font-size: 48px; display: block; margin-bottom: 16px;"></span>
            <h3 style="font-size: 24px; color: #1f2937; margin-bottom: 16px;">Nenhuma farmácia cadastrada</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">As farmácias cadastradas aparecerão aqui.</p>
            <button onclick="carregarFarmaciasExemplo()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Carregar Farmácias de Exemplo
            </button>
        </div>
    `;
    gridElement.parentNode.insertBefore(msg, gridElement.nextSibling);
}

// Carregar farmácias de exemplo
function carregarFarmaciasExemplo() {
    localStorage.setItem('farmacias', JSON.stringify(farmaciasExemplo));
    carregarFarmacias();
}

// ==================== CRIAÇÃO DE CARDS ====================

// Criar um card de farmácia
function criarCardFarmacia(farmacia) {
    let card = document.createElement('div');
    card.className = 'farmacia-card';
    card.dataset.id = farmacia.id || Date.now();
    card.dataset.plantao = farmacia.plantao || false;

    // Verifica se está em plantão
    let plantao = farmacia.plantao == 'Sim' || farmacia.plantao === true;

    // Cria o badge de plantão se necessário
    let badgePlantao = plantao ?
        '<span class="badge-plantao">🟢 Plantão 24h</span>' : '';

    // Define os serviços
    let servicos = gerarServicos(farmacia, plantao);

    // Cria os itens da lista de serviços
    let servicosHTML = '';
    for (let j = 0; j < servicos.length; j++) {
        servicosHTML += `<li>${servicos[j]}</li>`;
    }

    // Define o horário
    let horario = farmacia.horario || (plantao ? '24 horas' : '08:00 - 18:00');

    // Define o telefone
    let telefone = farmacia.telefone || 'Telefone não informado';

    // Define o endereço
    let endereco = farmacia.endereco || 'Endereço não informado';

    // Define o nome
    let nome = farmacia.nome || 'Farmácia';

    // Codifica o nome para URL
    let nomeCodificado = encodeURIComponent(nome);
    let id = farmacia.id || '';

    // Monta o HTML do card com redirecionamento para páginas
    card.innerHTML = `
        <div class="farmacia-header">
            <div class="farmacia-title">
                <h3>${nome}</h3>
                ${badgePlantao}
            </div>
            <span class="farmacia-icon">img/comprimidos.png</span>
        </div>

        <div class="farmacia-details">
            <div class="detail-item">
                <span class="detail-icon">img/ponto.png</span>
                <span>${endereco}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">img/call.png</span>
                <span>${telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">img/clock.png</span>
                <span>${horario}</span>
            </div>
        </div>

        <div class="farmacia-services">
            <p>Serviços Disponíveis:</p>
            <ul>
                ${servicosHTML}
            </ul>
        </div>

        <div class="button-container">
            <button class="medicamentos-btn" onclick="window.location.href='medicamentos.html?farmacia=${nomeCodificado}&id=${id}'">
                 Medicamentos
            </button>
            <button class="details-btn" onclick="window.location.href='detalhes-farmacia.html?farmacia=${nomeCodificado}&id=${id}'">
                 Detalhes
            </button>
        </div>
    `;

    return card;
}

// Gerar lista de serviços baseado na farmácia
function gerarServicos(farmacia, plantao) {
    let servicos = [
        'Venda de medicamentos',
        'Consultas farmacêuticas'
    ];

    if (plantao) {
        servicos.push('Atendimento 24 horas');
    }

    servicos.push('Medição de pressão arterial');

    if (farmacia.nome && farmacia.nome.toLowerCase().includes('popular')) {
        servicos.push('Preços acessíveis');
    }

    if (farmacia.nome && farmacia.nome.toLowerCase().includes('central')) {
        servicos.push('Ampla variedade');
    }

    // Remove duplicatas
    return [...new Set(servicos)];
}

// ==================== FUNÇÕES DE FILTRO ====================

// Filtrar farmácias
function filtrarFarmacias(filtro) {
    let cards = document.querySelectorAll('.farmacia-card');

    if (cards.length === 0) return;

    let contador = 0;

    for (let i = 0; i < cards.length; i++) {
        if (filtro === 'todas') {
            cards[i].style.display = 'block';
            contador++;
        } else if (filtro === 'plantao') {
            // Verifica se o card tem badge de plantão
            let badge = cards[i].querySelector('.badge-plantao');
            if (badge) {
                cards[i].style.display = 'block';
                contador++;
            } else {
                cards[i].style.display = 'none';
            }
        }
    }

    // Mostra mensagem se nenhum card for encontrado
    let msgNenhum = document.querySelector('.nenhum-resultado');
    if (msgNenhum) msgNenhum.remove();

    if (contador === 0) {
        let grid = document.querySelector('.farmacias-grid');
        let msg = document.createElement('div');
        msg.className = 'nenhum-resultado';
        msg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; margin-top: 20px;';
        msg.innerHTML = `
            <span style="font-size: 48px;">🔍</span>
            <h3 style="margin: 16px 0; color: #374151;">Nenhuma farmácia encontrada</h3>
            <p style="color: #6b7280;">Tente outro filtro ou carregue mais farmácias.</p>
        `;
        if (grid) grid.parentNode.insertBefore(msg, grid.nextSibling);
    }
}

// ==================== FUNÇÕES DE REDIRECIONAMENTO ====================

// Função para redirecionar para página de medicamentos
function irParaMedicamentos(nomeFarmacia, id) {
    let nomeCodificado = encodeURIComponent(nomeFarmacia);
    window.location.href = `medicamentos.html?farmacia=${nomeCodificado}&id=${id}`;
}

// Função para redirecionar para página de detalhes
function irParaDetalhes(nomeFarmacia, id) {
    let nomeCodificado = encodeURIComponent(nomeFarmacia);
    window.location.href = `detalhes-farmacia.html?farmacia=${nomeCodificado}&id=${id}`;
}

// ==================== FUNÇÕES PARA AS PÁGINAS DESTINO ====================

// Função para carregar medicamentos na página medicamentos.html
function carregarMedicamentosDaFarmacia() {
    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFarmacia = urlParams.get('farmacia');
    const id = urlParams.get('id');

    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmácia não encontrada</div>';
        return;
    }

    // Decodificar o nome
    const nomeDecodificado = decodeURIComponent(nomeFarmacia);

    // Buscar dados da farmácia
    let dados = localStorage.getItem('farmacias');
    let farmacias = dados ? JSON.parse(dados) : [];
    let farmacia = farmacias.find(f => f.nome === nomeDecodificado || f.id == id);

    // Atualizar título da página
    document.title = `Medicamentos - ${nomeDecodificado}`;

    // Aqui você pode criar o HTML para mostrar os medicamentos
    let container = document.querySelector('.medicamentos-container') || document.body;

    let medicamentosHTML = `
        <div style="max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                <h1 style="color: #1f2937; margin: 0;"> ${nomeDecodificado}</h1>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">Medicamentos Disponíveis</h2>
            
            <div style="display: grid; gap: 15px;">
    `;

    if (farmacia && farmacia.medicamentos && farmacia.medicamentos.length > 0) {
        for (let i = 0; i < farmacia.medicamentos.length; i++) {
            medicamentosHTML += `
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">${farmacia.medicamentos[i]}</span>
                    <span style="background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 20px; font-size: 14px;">Em stock</span>
                </div>
            `;
        }
    } else {
        medicamentosHTML += `
            <div style="text-align: center; padding: 40px; background: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 18px; color: #6b7280;">Nenhum medicamento cadastrado para esta farmácia.</p>
                <p style="color: #9ca3af; margin-top: 10px;">Visite a farmácia para mais informações.</p>
            </div>
        `;
    }

    medicamentosHTML += `
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #faf5ff; border-radius: 8px;">
                <h3 style="color: #5b21b6; margin-bottom: 10px;"> Contacto</h3>
                <p style="color: #4b5563;">Telefone: ${farmacia ? farmacia.telefone : 'Disponível na farmácia'}</p>
                <p style="color: #4b5563;">Endereço: ${farmacia ? farmacia.endereco : 'Disponível na farmácia'}</p>
            </div>
        </div>
    `;

    if (container === document.body) {
        container.innerHTML = medicamentosHTML;
    } else {
        container.innerHTML = medicamentosHTML;
    }
}

// Função para carregar detalhes na página detalhes-farmacia.html (ATUALIZADA)
function carregarDetalhesDaFarmacia() {
    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFarmacia = urlParams.get('farmacia');
    const id = urlParams.get('id');

    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmácia não encontrada</div>';
        return;
    }

    // Decodificar o nome
    const nomeDecodificado = decodeURIComponent(nomeFarmacia);

    // Buscar dados da farmácia
    let dados = localStorage.getItem('farmacias');
    let farmacias = dados ? JSON.parse(dados) : [];
    let farmacia = farmacias.find(f => f.nome === nomeDecodificado || f.id == id);

    // Buscar produtos cadastrados para contar
    let produtos = [];
    let produtosDados = localStorage.getItem('produtos');
    if (produtosDados) {
        let todosProdutos = JSON.parse(produtosDados);
        let farmaciaId = farmacia ? (farmacia.id || farmacia.nome) : id;
        produtos = todosProdutos.filter(p => p.farmaciaId == farmaciaId);
    }

    // Atualizar título da página
    document.title = `Detalhes - ${nomeDecodificado}`;

    // Container para os detalhes
    let container = document.querySelector('.detalhes-container') || document.body;

    // Determinar status
    let plantaoTexto = farmacia && farmacia.plantao ? ' Sim (24 horas)' : ' Não';
    let horario = farmacia ? (farmacia.horario || (farmacia.plantao ? '24 horas' : '08:00 - 18:00')) : 'Informação não disponível';

    // Gerar link do Google Maps baseado no endereço
    let enderecoCompleto = farmacia ? farmacia.endereco : 'Endereço não informado';
    let enderecoParaMapa = encodeURIComponent(enderecoCompleto + ', Nampula, Moçambique');
    let googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${enderecoParaMapa}`;

    // Gerar link para Waze
    let wazeLink = `https://www.waze.com/ul?q=${enderecoParaMapa}&navigate=yes`;

    // Lista completa de serviços
    let servicosCompletos = [
        'Venda de medicamentos',
        'Consultas farmacêuticas',
        'Medição de pressão arterial',
        'Medição de glicemia',
        'Aplicação de injetáveis',
        'Medicamentos genéricos',
        'Produtos de higiene e cosmética',
        'Suplementos vitamínicos'
    ];

    if (farmacia && farmacia.plantao) {
        servicosCompletos.push('Atendimento emergencial 24h');
    }

    if (farmacia && farmacia.nome && farmacia.nome.toLowerCase().includes('popular')) {
        servicosCompletos.push('Preços populares');
        servicosCompletos.push('Descontos para idosos');
    }

    // Gerar horário detalhado
    let horarioDetalhado = '';
    if (farmacia && farmacia.plantao) {
        horarioDetalhado = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Segunda a Domingo:</span>
                <span style="font-weight: bold; color: #059669;">24 horas</span>
            </div>
        `;
    } else {
        horarioDetalhado = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Segunda a Sexta:</span>
                <span style="font-weight: bold;">08:00 - 18:00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Sábado:</span>
                <span style="font-weight: bold;">08:00 - 12:00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Domingo:</span>
                <span style="font-weight: bold; color: #ef4444;">Fechado</span>
            </div>
        `;
    }

    // Gerar avaliação simulada
    let avaliacao = (Math.random() * 2 + 3).toFixed(1); // Entre 3.0 e 5.0
    let estrelas = '';
    for (let i = 0; i < 5; i++) {
        if (i < Math.floor(avaliacao)) {
            estrelas += '⭐';
        } else if (i < avaliacao) {
            estrelas += '✨';
        } else {
            estrelas += '☆';
        }
    }

    let detalhesHTML = `
        <div style="max-width: 900px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <!-- Cabeçalho -->
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                <h1 style="color: #1f2937; margin: 0; flex: 1;"> ${nomeDecodificado}</h1>
                <span style="background: ${farmacia && farmacia.plantao ? '#dbeafe' : '#d1fae5'}; color: ${farmacia && farmacia.plantao ? '#1e40af' : '#047857'}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                    ${farmacia && farmacia.plantao ? ' 24 Horas' : ' Horário Comercial'}
                </span>
            </div>

            <!-- Grid de Informações -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
                <!-- Coluna Esquerda -->
                <div>
                    <!-- Informações de Contato -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h3 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;"></span> Localização e Contacto
                        </h3>
                        
                        <div style="margin-bottom: 15px;">
                            <p style="margin-bottom: 8px;"><strong>Endereço completo:</strong></p>
                            <p style="color: #4b5563; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                ${enderecoCompleto}<br>
                                <small style="color: #6b7280;">Nampula, Moçambique</small>
                            </p>
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <a href="tel:${farmacia ? farmacia.telefone : ''}" style="flex: 1; background: #7c3aed; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                 Ligar Agora
                            </a>
                            <a href="#" onclick="window.location.href='https://wa.me/258${(farmacia ? farmacia.telefone : '').replace(/[^0-9]/g, '')}'" style="flex: 1; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                WhatsApp
                            </a>
                        </div>

                        <!-- Botões de Navegação -->
                        <div style="display: flex; gap: 10px;">
                            <a href="${googleMapsLink}" target="_blank" style="flex: 1; background: #4285F4; color: white; text-decoration: none; padding: 10px; border-radius: 8px; text-align: center; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                Google Maps
                            </a>
                            <a href="${wazeLink}" target="_blank" style="flex: 1; background: #33CCFF; color: white; text-decoration: none; padding: 10px; border-radius: 8px; text-align: center; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                Waze
                            </a>
                        </div>
                    </div>

                    <!-- Horário de Funcionamento Detalhado -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                        <h3 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;"></span> Horário de Funcionamento
                        </h3>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            ${horarioDetalhado}
                        </div>

                        ${farmacia && farmacia.plantao ?
            '<p style="margin-top: 10px; color: #059669; font-size: 14px; display: flex; align-items: center; gap: 5px;">✅ Aberto 24 horas, inclusive feriados</p>' :
            '<p style="margin-top: 10px; color: #6b7280; font-size: 14px;"> Horário pode variar em feriados</p>'
        }
                    </div>
                </div>

                <!-- Coluna Direita -->
                <div>
                    <!-- Avaliação -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h3 style="color: #374151; margin-bottom: 15px;"> Avaliação</h3>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 5px;">${estrelas}</div>
                            <div style="font-size: 20px; font-weight: bold; color: #1f2937;">${avaliacao}</div>
                            <div style="color: #6b7280; font-size: 14px;">de 5 estrelas</div>
                            <div style="margin-top: 10px; color: #7c3aed; font-size: 14px;"> 150+ avaliações</div>
                        </div>
                    </div>

                    <!-- Estatísticas -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h3 style="color: #374151; margin-bottom: 15px;"> Estatísticas</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
                                <div style="font-size: 24px; color: #7c3aed;">${produtos.length}</div>
                                <div style="color: #6b7280; font-size: 12px;">Produtos</div>
                            </div>
                            <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
                                <div style="font-size: 24px; color: #7c3aed;">${Math.floor(Math.random() * 50 + 20)}</div>
                                <div style="color: #6b7280; font-size: 12px;">Clientes/dia</div>
                            </div>
                        </div>
                    </div>

                    <!-- Formas de Pagamento -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                        <h3 style="color: #374151; margin-bottom: 15px;">💳 Pagamento</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">💵 Dinheiro</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">💳 Cartão</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">📱 M-Pesa</span>
                            <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">📱 E-Mola</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Serviços Oferecidos -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;"></span> Serviços Oferecidos
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                    ${servicosCompletos.map(servico => `
                        <div style="background: white; padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                            <span style="color: #7c3aed;">✓</span>
                            <span>${servico}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Mapa Estático (placeholder) -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-bottom: 15px;"> Localização no Mapa</h3>
                <div style="background: #e5e7eb; height: 200px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                    <div style="text-align: center;">
                        <span style="font-size: 40px; display: block; margin-bottom: 10px;"></span>
                        <p>Visualize o mapa no Google Maps</p>
                        <a href="${googleMapsLink}" target="_blank" style="color: #7c3aed; text-decoration: none;">Clique aqui para abrir</a>
                    </div>
                </div>
            </div>

            <!-- Botões de Ação -->
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button onclick="window.location.href='medicamentos.html?farmacia=${nomeFarmacia}&id=${id}'" style="background: #059669; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 16px;">
                     Ver Medicamentos (${produtos.length})
                </button>
                <button onclick="window.location.href='farm.html'" style="background: white; color: #7c3aed; border: 2px solid #7c3aed; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 16px;">
                    ← Voltar para Lista
                </button>
            </div>

            <!-- Informações Adicionais -->
            <div style="margin-top: 30px; padding: 15px; background: #faf5ff; border-radius: 8px; font-size: 14px; color: #5b21b6; text-align: center;">
                <p> Estacionamento disponível • Acessibilidade •  Farmacêutico de plantão</p>
                <p style="margin-top: 5px; color: #6b7280;">Última atualização: ${new Date().toLocaleDateString('pt-PT')}</p>
            </div>
        </div>
    `;

    if (container === document.body) {
        container.innerHTML = detalhesHTML;
    } else {
        container.innerHTML = detalhesHTML;
    }
}

// ==================== INICIALIZAÇÃO ====================

// Torna as funções globais para uso no HTML
window.carregarFarmacias = carregarFarmacias;
window.filtrarFarmacias = filtrarFarmacias;
window.irParaMedicamentos = irParaMedicamentos;
window.irParaDetalhes = irParaDetalhes;
window.carregarFarmaciasExemplo = carregarFarmaciasExemplo;
window.carregarMedicamentosDaFarmacia = carregarMedicamentosDaFarmacia;
window.carregarDetalhesDaFarmacia = carregarDetalhesDaFarmacia;

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    // Verificar em qual página estamos
    const path = window.location.pathname;

    if (path.includes('medicamentos.html')) {
        // Estamos na página de medicamentos
        carregarMedicamentosDaFarmacia();
    } else if (path.includes('detalhes-farmacia.html')) {
        // Estamos na página de detalhes
        carregarDetalhesDaFarmacia();
    } else {
        // Estamos na página principal de farmácias
        inicializarDados();
        carregarFarmacias();

        // Configura o select de filtro se ele existir
        let filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', function (e) {
                filtrarFarmacias(e.target.value);
            });
        }

        console.log(" Sistema de farmácias inicializado com sucesso!");
    }
});


// Função para carregar medicamentos na página medicamentos.html (atualizada)
function carregarMedicamentosDaFarmacia() {
    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFarmacia = urlParams.get('farmacia');
    const id = urlParams.get('id');

    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmácia não encontrada</div>';
        return;
    }

    // Decodificar o nome
    const nomeDecodificado = decodeURIComponent(nomeFarmacia);

    // Buscar dados da farmácia
    let dados = localStorage.getItem('farmacias');
    let farmacias = dados ? JSON.parse(dados) : [];
    let farmacia = farmacias.find(f => f.nome === nomeDecodificado || f.id == id);

    // Buscar produtos cadastrados
    let produtos = [];
    let produtosDados = localStorage.getItem('produtos');
    if (produtosDados) {
        let todosProdutos = JSON.parse(produtosDados);
        // Filtrar produtos da farmácia
        let farmaciaId = farmacia ? (farmacia.id || farmacia.nome) : id;
        produtos = todosProdutos.filter(p => p.farmaciaId == farmaciaId);
    }

    // Atualizar título da página
    document.title = `Medicamentos - ${nomeDecodificado}`;

    // Container para os medicamentos
    let container = document.querySelector('.medicamentos-container') || document.body;

    let medicamentosHTML = `
        <div style="max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                <h1 style="color: #1f2937; margin: 0;"> ${nomeDecodificado}</h1>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #374151;">Medicamentos Disponíveis</h2>
                <span style="background: #7c3aed; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">
                    ${produtos.length} produtos
                </span>
            </div>
            
            <div style="display: grid; gap: 15px;">
    `;

    if (produtos.length > 0) {
        // Ordenar por categoria
        let medicamentos = produtos.filter(p => p.categoria === 'Medicamento' || p.categoria === 'Genérico');
        let outros = produtos.filter(p => p.categoria !== 'Medicamento' && p.categoria !== 'Genérico');

        if (medicamentos.length > 0) {
            medicamentosHTML += `
                <h3 style="color: #059669; margin-top: 10px;"> Medicamentos</h3>
            `;

            for (let i = 0; i < medicamentos.length; i++) {
                let p = medicamentos[i];
                let statusClass = p.quantidade > 0 ? 'disponivel' : 'indisponivel';
                let statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponível';
                let statusColor = p.quantidade > 0 ? '#047857' : '#6b7280';
                let statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';

                medicamentosHTML += `
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-weight: 500;">${p.nome}</span>
                            ${p.fabricante ? `<br><small style="color: #6b7280;">${p.fabricante}</small>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <span style="font-weight: bold; color: #059669; display: block;">${p.preco} MZN</span>
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${statusText}</span>
                        </div>
                    </div>
                `;
            }
        }

        if (outros.length > 0) {
            medicamentosHTML += `
                <h3 style="color: #7c3aed; margin-top: 20px;"> Outros Produtos</h3>
            `;

            for (let i = 0; i < outros.length; i++) {
                let p = outros[i];
                let statusClass = p.quantidade > 0 ? 'disponivel' : 'indisponivel';
                let statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponível';
                let statusColor = p.quantidade > 0 ? '#047857' : '#6b7280';
                let statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';

                medicamentosHTML += `
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-weight: 500;">${p.nome}</span>
                            <br><small style="color: #6b7280;">${p.categoria}</small>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-weight: bold; color: #7c3aed; display: block;">${p.preco} MZN</span>
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${statusText}</span>
                        </div>
                    </div>
                `;
            }
        }
    } else {
        medicamentosHTML += `
            <div style="text-align: center; padding: 40px; background: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 18px; color: #6b7280;">Nenhum medicamento cadastrado para esta farmácia.</p>
                <p style="color: #9ca3af; margin-top: 10px;">Visite a farmácia para mais informações.</p>
            </div>
        `;
    }

    medicamentosHTML += `
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #faf5ff; border-radius: 8px;">
                <h3 style="color: #5b21b6; margin-bottom: 10px;"> Contacto</h3>
                <p style="color: #4b5563;">Telefone: ${farmacia ? farmacia.telefone : 'Disponível na farmácia'}</p>
                <p style="color: #4b5563;">Endereço: ${farmacia ? farmacia.endereco : 'Disponível na farmácia'}</p>
                <p style="color: #4b5563;">Horário: ${farmacia ? (farmacia.horario || (farmacia.plantao ? '24 horas' : '08:00 - 18:00')) : 'Disponível na farmácia'}</p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <a href="farm.html" style="color: #7c3aed; text-decoration: none;">← Voltar para lista de farmácias</a>
            </div>
        </div>
    `;

    if (container === document.body) {
        container.innerHTML = medicamentosHTML;
    } else {
        container.innerHTML = medicamentosHTML;
    }
}
