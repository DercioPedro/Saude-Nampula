// load-farmacias.js - Versão corrigida com direções funcionando

// ==================== FUNÇÃO PARA BUSCAR ESTATÍSTICAS DE AVALIAÇÕES ====================
async function buscarStatsAvaliacao(tipo, id) {
    try {
        const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';
        const response = await fetch(API_URL + '/avaliacoes/estatisticas?tipo=' + tipo + '&tipo_id=' + id);
        if (!response.ok) return { total: 0, media: 0 };
        const stats = await response.json();
        return stats;
    } catch (error) {
        return { total: 0, media: 0 };
    }
}

// ==================== FUNÇÃO PARA OBTER LOCALIZAÇÃO ATUAL (COM FALLBACK) ====================
function obterLocalizacaoAtual() {
    return new Promise(function(resolve) {
        if (!navigator.geolocation) {
            console.warn('Geolocalização não suportada pelo navegador');
            resolve(null);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('Localização obtida:', position.coords.latitude, position.coords.longitude);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            function(error) {
                console.warn('Erro ao obter localização:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
        
        setTimeout(function() {
            resolve(null);
        }, 5000);
    });
}

// ==================== FUNÇÕES DE DIREÇÕES ====================

async function obterUrlDirecoes(item) {
    var origem = await obterLocalizacaoAtual();
    
    var destino = '';
    if (item.endereco) {
        destino = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
    } else if (item.latitude && item.longitude) {
        destino = item.latitude + ',' + item.longitude;
    } else {
        console.error('Sem endereço ou coordenadas para:', item);
        return '#';
    }
    
    if (origem) {
        return 'https://www.google.com/maps/dir/?api=1&origin=' + origem.latitude + ',' + origem.longitude + '&destination=' + destino + '&travelmode=driving';
    }
    
    return 'https://www.google.com/maps/search/?api=1&query=' + destino;
}

async function obterUrlWaze(item) {
    var origem = await obterLocalizacaoAtual();
    
    var destino = '';
    if (item.endereco) {
        destino = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
    } else if (item.latitude && item.longitude) {
        destino = item.latitude + ',' + item.longitude;
    } else {
        return '#';
    }
    
    if (origem) {
        return 'https://www.waze.com/ul?q=' + destino + '&navigate=yes';
    }
    
    return 'https://www.waze.com/ul?q=' + destino;
}

// ==================== FUNÇÃO PARA ABRIR DIREÇÕES ====================

async function abrirDirecoes(farmaciaId) {
    try {
        var btn = event && event.target ? event.target : document.activeElement;
        if (btn) {
            btn.textContent = 'Carregando...';
            btn.disabled = true;
        }
        
        var farmacia = await apiRequest('/farmacias/' + farmaciaId);
        
        if (!farmacia) {
            alert('Farmácia não encontrada!');
            return;
        }
        
        if (!farmacia.endereco && !(farmacia.latitude && farmacia.longitude)) {
            alert('Esta farmácia não tem endereço ou coordenadas cadastradas.');
            return;
        }
        
        var url = await obterUrlDirecoes(farmacia);
        
        if (url && url !== '#') {
            window.open(url, '_blank');
        } else {
            alert('Não foi possível gerar as direções.');
        }
    } catch (error) {
        console.error('Erro ao abrir direções:', error);
        alert('Erro ao carregar as direções. Tente novamente.');
    } finally {
        var btn = event && event.target ? event.target : document.activeElement;
        if (btn) {
            btn.textContent = 'Como Chegar';
            btn.disabled = false;
        }
    }
}

async function abrirWaze(farmaciaId) {
    try {
        var farmacia = await apiRequest('/farmacias/' + farmaciaId);
        
        if (!farmacia) {
            alert('Farmácia não encontrada!');
            return;
        }
        
        if (!farmacia.endereco && !(farmacia.latitude && farmacia.longitude)) {
            alert('Esta farmácia não tem endereço ou coordenadas cadastradas.');
            return;
        }
        
        var url = await obterUrlWaze(farmacia);
        
        if (url && url !== '#') {
            window.open(url, '_blank');
        } else {
            alert('Não foi possível gerar as direções no Waze.');
        }
    } catch (error) {
        console.error('Erro ao abrir Waze:', error);
        alert('Erro ao carregar o Waze. Tente novamente.');
    }
}

// ==================== FUNÇÃO DE STATUS DA FARMÁCIA (VERSÃO ATUALIZADA) ====================
function verificarStatusFarmacia(farmacia) {
    var agora = new Date();
    var horaMoçambique = new Date(agora.toLocaleString('en-US', { timeZone: 'Africa/Maputo' }));
    var horaAtual = horaMoçambique.getHours();
    var minutoAtual = horaMoçambique.getMinutes();
    var minutosAtual = horaAtual * 60 + minutoAtual;
    
    // Obter dia da semana (0=Domingo, 1=Segunda, ...)
    var diaSemana = horaMoçambique.getDay();
    var diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    var nomeDia = diasSemana[diaSemana];
    var isDomingo = diaSemana === 0;
    
    // Verificar se é plantão 24h
    if (farmacia.plantao === true || farmacia.horario === '24hr' || farmacia.horario === '24h') {
        return {
            aberto: true,
            texto: 'Aberto 24h',
            cor: '#059669',
            bg: '#d1fae5',
            icon: '<img src="/img/clock.png" alt="Aberto" style="width: 14px; height: 14px;">'
        };
    }
    
    // Verificar se é domingo e a farmácia não funciona domingo
    if (isDomingo && farmacia.funciona_domingo !== true) {
        return {
            aberto: false,
            texto: 'Fechado aos domingos',
            cor: '#dc2626',
            bg: '#fee2e2',
            icon: '<img src="/img/clock.png" alt="Fechado" style="width: 14px; height: 14px;">'
        };
    }
    
    // Função para converter hora em minutos
    function paraMinutos(horaStr) {
        if (!horaStr) return null;
        horaStr = horaStr.trim();
        var partes = horaStr.split(':');
        if (partes.length !== 2) return null;
        var horas = parseInt(partes[0]);
        var minutos = parseInt(partes[1]);
        if (isNaN(horas) || isNaN(minutos)) return null;
        return horas * 60 + minutos;
    }
    
    // Função para extrair horário de uma string
    function extrairHorario(horarioStr) {
        if (!horarioStr) return null;
        var padrao = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/;
        var match = horarioStr.match(padrao);
        if (match) {
            return { inicio: match[1], fim: match[2] };
        }
        return null;
    }
    
    // Obter horário do dia específico ou horário geral
    var horarioDia = null;
    
    // Verificar se tem horário específico para o dia
    var campoHorarioDia = 'horario_' + nomeDia;
    if (farmacia[campoHorarioDia]) {
        horarioDia = farmacia[campoHorarioDia];
    }
    
    // Se for domingo e tem horário específico de domingo
    if (isDomingo && farmacia.horario_domingo) {
        horarioDia = farmacia.horario_domingo;
    }
    
    // Usar horário do dia específico ou horário geral
    var horario = horarioDia || farmacia.horario || '08:00 - 18:00';
    
    // Extrair horários
    var hrs = extrairHorario(horario);
    var aberturaMin = null;
    var fechoMin = null;
    
    if (hrs) {
        aberturaMin = paraMinutos(hrs.inicio);
        fechoMin = paraMinutos(hrs.fim);
    }
    
    // Verificar intervalo de almoço
    var almocoInicioMin = null;
    var almocoFimMin = null;
    if (farmacia.horario_almoco_inicio && farmacia.horario_almoco_fim) {
        almocoInicioMin = paraMinutos(farmacia.horario_almoco_inicio);
        almocoFimMin = paraMinutos(farmacia.horario_almoco_fim);
    }
    
    // Determinar status
    var estaAberto = false;
    var textoStatus = 'Fechado';
    var corStatus = '#dc2626';
    var bgStatus = '#fee2e2';
    
    if (aberturaMin !== null && fechoMin !== null) {
        // Verificar se está dentro do horário de funcionamento
        if (minutosAtual >= aberturaMin && minutosAtual < fechoMin) {
            estaAberto = true;
            
            // Verificar se está em horário de almoço
            if (almocoInicioMin !== null && almocoFimMin !== null) {
                if (minutosAtual >= almocoInicioMin && minutosAtual < almocoFimMin) {
                    estaAberto = false;
                    textoStatus = 'Intervalo de almoço';
                    corStatus = '#f59e0b';
                    bgStatus = '#fef3c7';
                }
            }
            
            if (estaAberto) {
                textoStatus = 'Aberto agora';
                corStatus = '#059669';
                bgStatus = '#d1fae5';
            }
        } else {
            // Verificar se é domingo e está dentro do horário de domingo
            if (isDomingo && farmacia.horario_domingo) {
                var hrsDom = extrairHorario(farmacia.horario_domingo);
                if (hrsDom) {
                    var aberturaDom = paraMinutos(hrsDom.inicio);
                    var fechoDom = paraMinutos(hrsDom.fim);
                    if (aberturaDom !== null && fechoDom !== null) {
                        if (minutosAtual >= aberturaDom && minutosAtual < fechoDom) {
                            estaAberto = true;
                            textoStatus = 'Aberto (domingo)';
                            corStatus = '#059669';
                            bgStatus = '#d1fae5';
                        }
                    }
                }
            }
        }
    }
    
    // Se está fechado, mostrar próximo dia de abertura
    if (!estaAberto && !isDomingo) {
        // Verificar se o horário de hoje existe, se não, a farmácia não abre hoje
        if (!horarioDia && !farmacia.horario) {
            textoStatus = 'Fechado hoje';
        }
    }
    
    // Se está fechado e é domingo
    if (!estaAberto && isDomingo && farmacia.funciona_domingo !== true) {
        textoStatus = 'Fechado (não abre domingo)';
    }
    
    // Se está fechado e tem horário específico para amanhã
    if (!estaAberto && textoStatus === 'Fechado') {
        var amanha = (diaSemana + 1) % 7;
        var nomeAmanha = diasSemana[amanha];
        var campoAmanha = 'horario_' + nomeAmanha;
        
        if (farmacia[campoAmanha]) {
            textoStatus = 'Fechado (abre ' + nomeAmanha + ')';
        } else if (amanha === 0 && farmacia.funciona_domingo === true) {
            textoStatus = 'Fechado (abre domingo)';
        }
    }
    
    return {
        aberto: estaAberto,
        texto: textoStatus,
        cor: corStatus,
        bg: bgStatus,
        icon: estaAberto 
            ? '<img src="/img/clock.png" alt="Aberto" style="width: 14px; height: 14px;">' 
            : '<img src="/img/clock.png" alt="Fechado" style="width: 14px; height: 14px;">'
    };
}

// ==================== FUNÇÃO PARA CARREGAR FARMÁCIAS ====================
async function carregarFarmacias() {
    try {
        var farmacias = await apiRequest('/farmacias');
        
        var farmaciasGrid = document.querySelector('.farmacias-grid');
        if (!farmaciasGrid) {
            console.error('Elemento .farmacias-grid nao encontrado!');
            return;
        }
        
        farmaciasGrid.innerHTML = '';
        
        var msgVazia = document.querySelector('.empty-message');
        if (msgVazia) msgVazia.remove();
        
        if (farmacias.length === 0) {
            mostrarMensagemVazia(farmaciasGrid);
            return;
        }
        
        for (var i = 0; i < farmacias.length; i++) {
            var card = await criarCardFarmacia(farmacias[i]);
            farmaciasGrid.appendChild(card);
        }
        
    } catch (error) {
        console.error('Erro ao carregar farmacias:', error);
        mostrarMensagemErro('Erro ao carregar farmacias. Tente novamente.');
    }
}

function mostrarMensagemVazia(gridElement) {
    var msg = document.createElement('div');
    msg.className = 'empty-message';
    msg.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 12px; grid-column: 1/-1;">
            <img src="/img/comprimidos.png" alt="Farmacia" style="width: 48px; height: 48px; margin-bottom: 16px;">
            <h3 style="font-size: 24px; color: #1f2937; margin-bottom: 16px;">Nenhuma farmacia cadastrada</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">As farmacias cadastradas aparecerao aqui.</p>
        </div>
    `;
    gridElement.parentNode.insertBefore(msg, gridElement.nextSibling);
}

function mostrarMensagemErro(mensagem) {
    var farmaciasGrid = document.querySelector('.farmacias-grid');
    if (farmaciasGrid) {
        var msg = document.createElement('div');
        msg.className = 'empty-message';
        msg.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: #fee2e2; border-radius: 12px; grid-column: 1/-1;">
                <span style="font-size: 48px;">⚠️</span>
                <h3 style="font-size: 24px; color: #b91c1c; margin-bottom: 16px;">Erro ao carregar dados</h3>
                <p style="color: #6b7280;">${mensagem}</p>
                <button onclick="location.reload()" style="margin-top: 15px; background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
        farmaciasGrid.parentNode.insertBefore(msg, farmaciasGrid.nextSibling);
    }
}

// ==================== FUNÇÃO PARA CRIAR CARD DA FARMÁCIA ====================
async function criarCardFarmacia(farmacia) {
    var card = document.createElement('div');
    card.className = 'farmacia-card';
    card.setAttribute('data-id', farmacia.id);
    card.dataset.id = farmacia.id;
    card.dataset.plantao = farmacia.plantao || false;
    
    var plantao = farmacia.plantao === true;
    var badgePlantao = plantao ? '<span class="badge-plantao">Plantao 24h</span>' : '';
    
    var status = verificarStatusFarmacia(farmacia);
    
    var stats = await buscarStatsAvaliacao('farmacia', farmacia.id);
    var media = stats.media || 0;
    var total = stats.total || 0;
    
    var servicos = gerarServicos(farmacia, plantao);
    var servicosHTML = '';
    for (var j = 0; j < servicos.length; j++) {
        servicosHTML += '<li>' + servicos[j] + '</li>';
    }
    
    var horario = farmacia.horario || (plantao ? '24 horas' : '08:00 - 18:00');
    var telefone = farmacia.telefone || 'Telefone nao informado';
    var endereco = farmacia.endereco || 'Endereco nao informado';
    var nome = farmacia.nome || 'Farmacia';
    
    var nomeCodificado = encodeURIComponent(nome);
    var id = farmacia.id;
    
    var estrelasCheias = Math.round(media);
    var estrelasHTML = '';
    for (var k = 0; k < 5; k++) {
        if (k < estrelasCheias) {
            estrelasHTML += '<span style="color: #fbbf24;">★</span>';
        } else {
            estrelasHTML += '<span style="color: #d1d5db;">☆</span>';
        }
    }
    
    card.innerHTML = `
        <div class="farmacia-header">
            <div class="farmacia-title">
                <h3>${nome}</h3>
                <div class="avaliacao-stats" style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                    ${total > 0 ? `
                        <span style="font-size: 14px;">${estrelasHTML}</span>
                        <span style="font-size: 13px; font-weight: 600; color: #059669;">${media.toFixed(1)}</span>
                        <span style="font-size: 12px; color: #6b7280;">(${total} avaliações)</span>
                    ` : `
                        <span style="font-size: 13px; color: #6b7280;">Ainda sem avaliações</span>
                    `}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 5px; flex-wrap: wrap;">
                    ${badgePlantao}
                    <span class="status-badge" style="background: ${status.bg}; color: ${status.cor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                        ${status.icon} ${status.texto}
                    </span>
                </div>
            </div>
            <span class="farmacia-icon"><img src="/img/comprimidos.png" alt="Farmacia" style="width: 32px; height: 32px;"></span>
        </div>
        <div class="farmacia-details">
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/ponto.png" alt="Localizacao" style="width: 16px; height: 16px;"></span>
                <span>${endereco}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/call.png" alt="Telefone" style="width: 16px; height: 16px;"></span>
                <span>${telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon"><img src="/img/clock.png" alt="Horario" style="width: 16px; height: 16px;"></span>
                <span>${horario}</span>
            </div>
        </div>
        <div class="farmacia-services">
            <p>Servicos Disponiveis:</p>
            <ul>${servicosHTML}</ul>
        </div>
        <div class="button-container" style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button class="medicamentos-btn" onclick="window.location.href='medicamentos.html?farmacia=${nomeCodificado}&id=${id}'" style="flex: 1;">
                <img src="/img/comprimidos.png" alt="Medicamentos" style="width: 16px; height: 16px; vertical-align: middle;"> Medicamentos
            </button>
            <button class="details-btn" onclick="window.location.href='detalhes-farmacia.html?farmacia=${nomeCodificado}&id=${id}'" style="flex: 1;">
                <img src="/img/details.png" alt="Detalhes" style="width: 16px; height: 16px; vertical-align: middle;"> Detalhes
            </button>
        </div>
        <div class="directions-container" style="display: flex; gap: 8px;">
            <button class="directions-btn" onclick="abrirDirecoes(${id})" style="flex: 1; background: #4285F4; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                <img src="/img/ponto.png" alt="Como Chegar" style="width: 14px; height: 14px;"> Como Chegar
            </button>
            <button class="waze-btn" onclick="abrirWaze(${id})" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                Waze
            </button>
        </div>
        <div class="avaliar-container" style="margin-top: 10px;">
            <button class="avaliar-btn" onclick="abrirModalAvaliacao('farmacia', ${id})">
                Avaliar
            </button>
        </div>
    `;
    
    return card;
}

function gerarServicos(farmacia, plantao) {
    var servicos = ['Venda de medicamentos', 'Consultas farmaceuticas'];
    if (plantao) servicos.push('Atendimento 24 horas');
    servicos.push('Medicao de pressao arterial');
    if (farmacia.nome && farmacia.nome.toLowerCase().includes('popular')) {
        servicos.push('Precos acessiveis');
    }
    if (farmacia.nome && farmacia.nome.toLowerCase().includes('central')) {
        servicos.push('Ampla variedade');
    }
    return Array.from(new Set(servicos));
}

// ==================== FUNÇÃO PARA FILTRAR FARMÁCIAS ====================
function filtrarFarmacias(filtro) {
    var cards = document.querySelectorAll('.farmacia-card');
    if (cards.length === 0) return;
    
    var contador = 0;
    for (var i = 0; i < cards.length; i++) {
        if (filtro === 'todas') {
            cards[i].style.display = 'block';
            contador++;
        } else if (filtro === 'plantao') {
            var badge = cards[i].querySelector('.badge-plantao');
            if (badge) {
                cards[i].style.display = 'block';
                contador++;
            } else {
                cards[i].style.display = 'none';
            }
        }
    }
    
    var msgNenhum = document.querySelector('.nenhum-resultado');
    if (msgNenhum) msgNenhum.remove();
    
    if (contador === 0) {
        var grid = document.querySelector('.farmacias-grid');
        if (grid) {
            var msg = document.createElement('div');
            msg.className = 'nenhum-resultado';
            msg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; margin-top: 20px;';
            msg.innerHTML = `
                <span style="font-size: 48px;">🔍</span>
                <h3 style="margin: 16px 0; color: #374151;">Nenhuma farmacia encontrada</h3>
                <p style="color: #6b7280;">Tente outro filtro ou carregue mais farmacias.</p>
            `;
            grid.parentNode.insertBefore(msg, grid.nextSibling);
        }
    }
}

// ==================== FUNÇÕES PARA AS PÁGINAS DESTINO ====================

async function carregarMedicamentosDaFarmacia() {
    var urlParams = new URLSearchParams(window.location.search);
    var nomeFarmacia = urlParams.get('farmacia');
    var id = urlParams.get('id');
    
    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmacia nao encontrada</div>';
        return;
    }
    
    var nomeDecodificado = decodeURIComponent(nomeFarmacia);
    document.title = 'Medicamentos - ' + nomeDecodificado;
    
    try {
        var farmacia = await apiRequest('/farmacias/' + id);
        var produtos = await apiRequest('/produtos?farmaciaId=' + id);
        
        var container = document.querySelector('.medicamentos-container') || document.body;
        
        var urlDirecoes = await obterUrlDirecoes(farmacia);
        var urlWaze = await obterUrlWaze(farmacia);
        
        var medicamentosHTML = `
            <div style="max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                    <h1 style="color: #1f2937; margin: 0;"><img src="/img/comprimidos.png" alt="Medicamentos" style="width: 28px; height: 28px; vertical-align: middle;"> ${nomeDecodificado}</h1>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: #374151;">Medicamentos Disponiveis</h2>
                    <span style="background: #7c3aed; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">
                        ${produtos.length} produtos
                    </span>
                </div>
                
                <div style="display: grid; gap: 15px;">
        `;
        
        if (produtos && produtos.length > 0) {
            var medicamentos = produtos.filter(function(p) { return p.categoria === 'Medicamento' || p.categoria === 'Generico'; });
            var outros = produtos.filter(function(p) { return p.categoria !== 'Medicamento' && p.categoria !== 'Generico'; });
            
            if (medicamentos.length > 0) {
                medicamentosHTML += '<h3 style="color: #059669; margin-top: 10px;"><img src="/img/comprimidos.png" alt="Medicamentos" style="width: 20px; height: 20px;"> Medicamentos</h3>';
                for (var m = 0; m < medicamentos.length; m++) {
                    var p = medicamentos[m];
                    var statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponivel';
                    var statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';
                    var statusColor = p.quantidade > 0 ? '#047857' : '#6b7280';
                    
                    medicamentosHTML += `
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-weight: 500;">${p.nome}</span>
                                ${p.fabricante ? '<br><small style="color: #6b7280;">' + p.fabricante + '</small>' : ''}
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
                medicamentosHTML += '<h3 style="color: #7c3aed; margin-top: 20px;"><img src="/img/details.png" alt="Outros Produtos" style="width: 20px; height: 20px;"> Outros Produtos</h3>';
                for (var o = 0; o < outros.length; o++) {
                    var p = outros[o];
                    var statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponivel';
                    var statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';
                    
                    medicamentosHTML += `
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-weight: 500;">${p.nome}</span>
                                <br><small style="color: #6b7280;">${p.categoria}</small>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-weight: bold; color: #7c3aed; display: block;">${p.preco} MZN</span>
                                <span style="background: ${statusBg}; color: #047857; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${statusText}</span>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            medicamentosHTML += `
                <div style="text-align: center; padding: 40px; background: #f3f4f6; border-radius: 8px;">
                    <p style="font-size: 18px; color: #6b7280;">Nenhum medicamento cadastrado para esta farmacia.</p>
                    <p style="color: #9ca3af; margin-top: 10px;">Visite a farmacia para mais informacoes.</p>
                </div>
            `;
        }
        
        medicamentosHTML += `
                </div>
                <div style="margin-top: 30px; padding: 20px; background: #faf5ff; border-radius: 8px;">
                    <h3 style="color: #5b21b6; margin-bottom: 10px;"><img src="/img/call.png" alt="Contacto" style="width: 20px; height: 20px;"> Contacto</h3>
                    <p style="color: #4b5563;">Telefone: ${farmacia.telefone || 'Disponivel na farmacia'}</p>
                    <p style="color: #4b5563;">Endereco: ${farmacia.endereco || 'Disponivel na farmacia'}</p>
                    <p style="color: #4b5563;">Horario: ${farmacia.horario || (farmacia.plantao ? '24 horas' : '08:00 - 18:00')}</p>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="window.open('${urlDirecoes}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                        Como Chegar (Google Maps)
                    </button>
                    <button onclick="window.open('${urlWaze}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">
                        Abrir no Waze
                    </button>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="farm.html" style="color: #7c3aed; text-decoration: none;">← Voltar para lista de farmacias</a>
                </div>
            </div>
        `;
        
        if (container === document.body) {
            container.innerHTML = medicamentosHTML;
        } else {
            container.innerHTML = medicamentosHTML;
        }
    } catch (error) {
        console.error('Erro ao carregar medicamentos:', error);
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Erro ao carregar medicamentos</div>';
    }
}

async function carregarDetalhesDaFarmacia() {
    var urlParams = new URLSearchParams(window.location.search);
    var nomeFarmacia = urlParams.get('farmacia');
    var id = urlParams.get('id');
    
    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmacia nao encontrada</div>';
        return;
    }
    
    var nomeDecodificado = decodeURIComponent(nomeFarmacia);
    document.title = 'Detalhes - ' + nomeDecodificado;
    
    try {
        var farmacia = await apiRequest('/farmacias/' + id);
        var produtos = await apiRequest('/produtos?farmaciaId=' + id);
        
        var status = verificarStatusFarmacia(farmacia);
        
        var container = document.querySelector('.detalhes-container') || document.body;
        
        var enderecoCompleto = farmacia.endereco || 'Endereco nao informado';
        
        var urlDirecoes = await obterUrlDirecoes(farmacia);
        var urlWaze = await obterUrlWaze(farmacia);
        
        // ==================== GERAR TABELA DE HORÁRIOS ====================
        var horariosHTML = gerarTabelaHorarios(farmacia);
        
        var detalhesHTML = `
            <div style="max-width: 900px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                    <h1 style="color: #1f2937; margin: 0; flex: 1;"><img src="/img/comprimidos.png" alt="Farmacia" style="width: 28px; height: 28px; vertical-align: middle;"> ${nomeDecodificado}</h1>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span style="background: ${farmacia.plantao ? '#dbeafe' : '#d1fae5'}; color: ${farmacia.plantao ? '#1e40af' : '#047857'}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                            ${farmacia.plantao ? '24 Horas' : 'Horario Comercial'}
                        </span>
                        <span style="background: ${status.bg}; color: ${status.cor}; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
                            ${status.icon} ${status.texto}
                        </span>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"><img src="/img/ponto.png" alt="Localizacao" style="width: 20px; height: 20px;"> Localizacao e Contacto</h3>
                            <div style="margin-bottom: 15px;">
                                <p><strong>Endereco:</strong></p>
                                <p style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    ${enderecoCompleto}<br>
                                    <small style="color: #6b7280;">Nampula, Mocambique</small>
                                </p>
                            </div>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <a href="tel:${farmacia.telefone}" style="flex: 1; background: #7c3aed; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;">
                                    <img src="/img/call.png" alt="Ligar" style="width: 16px; height: 16px; vertical-align: middle;"> Ligar Agora
                                </a>
                                <a href="https://wa.me/258${(farmacia.telefone || '').replace(/[^0-9]/g, '')}" style="flex: 1; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;">
                                    <img src="/img/call.png" alt="WhatsApp" style="width: 16px; height: 16px; vertical-align: middle;"> WhatsApp
                                </a>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="window.open('${urlDirecoes}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                                    Como Chegar
                                </button>
                                <button onclick="window.open('${urlWaze}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                                    Waze
                                </button>
                            </div>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"><img src="/img/clock.png" alt="Horario" style="width: 20px; height: 20px;"> Horario de Funcionamento</h3>
                            <div style="background: white; padding: 15px; border-radius: 8px;">
                                ${farmacia.plantao ? 
                                    '<div>Segunda a Domingo: <strong style="color: #059669;">24 horas</strong></div>' :
                                    '<div>Horario: <strong>' + (farmacia.horario || '08:00 - 18:00') + '</strong></div>'
                                }
                                ${farmacia.horario_almoco_inicio && farmacia.horario_almoco_fim ? `
                                    <div style="margin-top: 8px; color: #d97706;">
                                        <small>Intervalo de almoço: <strong>${farmacia.horario_almoco_inicio} - ${farmacia.horario_almoco_fim}</strong></small>
                                    </div>
                                ` : ''}
                                ${farmacia.funciona_domingo === false ? `
                                    <div style="margin-top: 8px; color: #dc2626;">
                                        <small>Não funciona aos domingos</small>
                                    </div>
                                ` : ''}
                                ${farmacia.funciona_domingo === true && farmacia.horario_domingo ? `
                                    <div style="margin-top: 8px; color: #1e40af;">
                                        <small>Domingo: <strong>${farmacia.horario_domingo}</strong></small>
                                    </div>
                                ` : ''}
                            </div>
                            ${farmacia.plantao ? 
                                '<p style="margin-top: 10px; color: #059669;">Aberto 24 horas, inclusive feriados</p>' : 
                                '<p style="margin-top: 10px; color: #6b7280;">Horario pode variar em feriados</p>'
                            }
                        </div>
                    </div>
                    
                    <div>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"><img src="/img/comprimidos.png" alt="Produtos" style="width: 20px; height: 20px;"> Estatisticas</h3>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; color: #7c3aed;">${produtos.length}</div>
                                <div style="font-size: 12px;">Produtos disponiveis</div>
                            </div>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"> Formas de Pagamento</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">Dinheiro</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">Cartao</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">M-Pesa</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; border: 1px solid #e5e7eb;">E-Mola</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ==================== TABELA DE HORÁRIOS DETALHADOS ==================== -->
                ${horariosHTML}
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button onclick="window.location.href='medicamentos.html?farmacia=${nomeFarmacia}&id=${farmacia.id}'" style="background: #059669; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        <img src="/img/comprimidos.png" alt="Medicamentos" style="width: 16px; height: 16px; vertical-align: middle;"> Ver Medicamentos (${produtos.length})
                    </button>
                    <button onclick="window.location.href='farm.html'" style="background: white; color: #7c3aed; border: 2px solid #7c3aed; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        ← Voltar para Lista
                    </button>
                </div>
            </div>
        `;
        
        if (container === document.body) {
            container.innerHTML = detalhesHTML;
        } else {
            container.innerHTML = detalhesHTML;
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Erro ao carregar detalhes da farmacia</div>';
    }
}

// ==================== GERAR TABELA DE HORÁRIOS ====================
function gerarTabelaHorarios(farmacia) {
    // Se for plantão 24h, não mostrar tabela
    if (farmacia.plantao === true) {
        return '';
    }
    
    var dias = [
        { nome: 'Segunda', campo: 'horario_segunda', diaSemana: 1 },
        { nome: 'Terça', campo: 'horario_terca', diaSemana: 2 },
        { nome: 'Quarta', campo: 'horario_quarta', diaSemana: 3 },
        { nome: 'Quinta', campo: 'horario_quinta', diaSemana: 4 },
        { nome: 'Sexta', campo: 'horario_sexta', diaSemana: 5 },
        { nome: 'Sábado', campo: 'horario_sabado', diaSemana: 6 },
        { nome: 'Domingo', campo: 'horario_domingo', diaSemana: 0 }
    ];
    
    var agora = new Date();
    var horaMoçambique = new Date(agora.toLocaleString('en-US', { timeZone: 'Africa/Maputo' }));
    var diaAtual = horaMoçambique.getDay();
    
    var tabelaHTML = `
        <div class="horarios-detalhados">
            <h4><img src="/img/clock.png" alt="Horarios"> Horários por Dia da Semana</h4>
            <table class="tabela-horarios">
                <thead>
                    <tr>
                        <th>Dia</th>
                        <th>Horário</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (var i = 0; i < dias.length; i++) {
        var dia = dias[i];
        var horario = farmacia[dia.campo] || farmacia.horario || 'Fechado';
        var isDiaAtual = (dia.diaSemana === diaAtual);
        var rowClass = isDiaAtual ? 'dia-atual' : '';
        var statusText = '';
        var statusClass = '';
        
        // Verificar se é domingo e a farmácia não funciona domingo
        if (dia.diaSemana === 0 && farmacia.funciona_domingo === false) {
            statusText = 'Fechado';
            statusClass = 'status-dia-fechado';
        } else if (horario === 'Fechado' || !horario) {
            statusText = 'Fechado';
            statusClass = 'status-dia-fechado';
        } else {
            // Verificar horário atual para o dia atual
            if (isDiaAtual) {
                var statusAtual = verificarStatusFarmacia(farmacia);
                if (statusAtual.aberto) {
                    if (statusAtual.texto === 'Intervalo de almoço') {
                        statusText = 'Intervalo';
                        statusClass = 'status-dia-intervalo';
                    } else {
                        statusText = 'Aberto';
                        statusClass = 'status-dia-aberto';
                    }
                } else {
                    statusText = 'Fechado';
                    statusClass = 'status-dia-fechado';
                }
            } else {
                statusText = 'Abre';
                statusClass = 'status-dia-aberto';
            }
        }
        
        // Verificar se tem intervalo de almoço
        var intervaloInfo = '';
        if (farmacia.horario_almoco_inicio && farmacia.horario_almoco_fim && horario !== 'Fechado') {
            intervaloInfo = `<span class="intervalo-info">Almoço: ${farmacia.horario_almoco_inicio} - ${farmacia.horario_almoco_fim}</span>`;
        }
        
        // Verificar se é domingo e tem horário especial
        var domingoBadge = '';
        if (dia.diaSemana === 0 && farmacia.funciona_domingo === true && farmacia.horario_domingo) {
            domingoBadge = '<span class="horario-especial-badge">Especial</span>';
        }
        
        tabelaHTML += `
            <tr class="${rowClass}">
                <td><strong>${dia.nome}</strong> ${isDiaAtual ? '🔵' : ''}</td>
                <td>${horario !== 'Fechado' ? horario : '—'} ${intervaloInfo} ${domingoBadge}</td>
                <td><span class="status-dia ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }
    
    tabelaHTML += `
                </tbody>
            </table>
            <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">
                <span style="display: inline-block; margin-right: 16px;">🔵 Hoje</span>
                <span style="display: inline-block; margin-right: 16px;">🟢 Aberto</span>
                <span style="display: inline-block; margin-right: 16px;">🟡 Intervalo</span>
                <span style="display: inline-block;">🔴 Fechado</span>
            </div>
        </div>
    `;
    
    return tabelaHTML;
}
// ==================== INICIALIZAÇÃO ====================

// Exportar funções para uso global
window.obterLocalizacaoAtual = obterLocalizacaoAtual;
window.obterUrlDirecoes = obterUrlDirecoes;
window.obterUrlWaze = obterUrlWaze;
window.abrirDirecoes = abrirDirecoes;
window.abrirWaze = abrirWaze;
window.filtrarFarmacias = filtrarFarmacias;
window.carregarFarmacias = carregarFarmacias;
window.carregarMedicamentosDaFarmacia = carregarMedicamentosDaFarmacia;
window.carregarDetalhesDaFarmacia = carregarDetalhesDaFarmacia;
window.verificarStatusFarmacia = verificarStatusFarmacia;
window.buscarStatsAvaliacao = buscarStatsAvaliacao;
window.criarCardFarmacia = criarCardFarmacia;

var inicializado = false;

document.addEventListener('DOMContentLoaded', function() {
    if (inicializado) return;
    inicializado = true;
    
    var path = window.location.pathname;
    
    // VERIFICAR SE É PÁGINA DE LOGIN - NÃO EXECUTAR NADA
    if (path.includes('/login-farmacia') || path.includes('/admin-login')) {
        console.log('Página de login - carregamento de farmácias ignorado');
        return;
    }
    
    if (path.includes('/medicamentos')) {
        carregarMedicamentosDaFarmacia();
    } else if (path.includes('/detalhes-farmacia')) {
        carregarDetalhesDaFarmacia();
    } else if (path.includes('/farm') || path === '/' || path.includes('farm')) {
        setTimeout(function() {
            carregarFarmacias();
        }, 100);
        
        var filterSelect = document.getElementById('filter-select');
        if (filterSelect && !filterSelect.hasAttribute('data-listener')) {
            filterSelect.setAttribute('data-listener', 'true');
            filterSelect.addEventListener('change', function(e) {
                filtrarFarmacias(e.target.value);
            });
        }
    }
});
