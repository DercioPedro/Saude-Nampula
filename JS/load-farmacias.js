// load-farmacias.js - Versão com API e priorização de coordenadas

// Funções auxiliares para obter URLs com prioridade para coordenadas
function obterUrlGoogleMaps(item) {
    if (item.latitude && item.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

function obterUrlWaze(item) {
    if (item.latitude && item.longitude) {
        return `https://www.waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

function obterUrlDirecoes(item) {
    if (item.latitude && item.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
}

// Carregar farmácias da API
async function carregarFarmacias() {
    try {
        console.log('Carregando farmácias...');
        const farmacias = await apiRequest('/farmacias');
        console.log('Farmácias recebidas:', farmacias);
        
        let farmaciasGrid = document.querySelector('.farmacias-grid');
        if (!farmaciasGrid) {
            console.error("Elemento .farmacias-grid não encontrado!");
            return;
        }
        
        farmaciasGrid.innerHTML = '';
        
        let msgVazia = document.querySelector('.empty-message');
        if (msgVazia) msgVazia.remove();
        
        if (farmacias.length === 0) {
            mostrarMensagemVazia(farmaciasGrid);
            return;
        }
        
        for (let i = 0; i < farmacias.length; i++) {
            let card = criarCardFarmacia(farmacias[i]);
            farmaciasGrid.appendChild(card);
        }
        
        // console.log("✅ Farmácias carregadas com sucesso!");
        
    } catch (error) {
        console.error('Erro ao carregar farmácias:', error);
        mostrarMensagemErro('Erro ao carregar farmácias. Tente novamente.');
    }
}

// Mostrar mensagem quando não há farmácias
function mostrarMensagemVazia(gridElement) {
    let msg = document.createElement('div');
    msg.className = 'empty-message';
    msg.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 12px; grid-column: 1/-1;">
            <span style="font-size: 48px; display: block; margin-bottom: 16px;">💊</span>
            <h3 style="font-size: 24px; color: #1f2937; margin-bottom: 16px;">Nenhuma farmácia cadastrada</h3>
            <p style="color: #6b7280; margin-bottom: 20px;">As farmácias cadastradas aparecerão aqui.</p>
        </div>
    `;
    gridElement.parentNode.insertBefore(msg, gridElement.nextSibling);
}

function mostrarMensagemErro(mensagem) {
    let farmaciasGrid = document.querySelector('.farmacias-grid');
    if (farmaciasGrid) {
        let msg = document.createElement('div');
        msg.className = 'empty-message';
        msg.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: #fee2e2; border-radius: 12px; grid-column: 1/-1;">
                <span style="font-size: 48px; display: block; margin-bottom: 16px;">⚠️</span>
                <h3 style="font-size: 24px; color: #b91c1c; margin-bottom: 16px;">Erro ao carregar dados</h3>
                <p style="color: #6b7280;">${mensagem}</p>
                <button onclick="location.reload()" style="margin-top: 15px; background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
        farmaciasGrid.parentNode.insertBefore(msg, farmaciasGrid.nextSibling);
    }
}

// Criar um card de farmácia
function criarCardFarmacia(farmacia) {
    let card = document.createElement('div');
    card.className = 'farmacia-card';
    card.dataset.id = farmacia.id;
    card.dataset.plantao = farmacia.plantao || false;
    
    let plantao = farmacia.plantao === true;
    let badgePlantao = plantao ? '<span class="badge-plantao">🟢 Plantão 24h</span>' : '';
    
    let servicos = gerarServicos(farmacia, plantao);
    let servicosHTML = '';
    for (let j = 0; j < servicos.length; j++) {
        servicosHTML += `<li>${servicos[j]}</li>`;
    }
    
    let horario = farmacia.horario || (plantao ? '24 horas' : '08:00 - 18:00');
    let telefone = farmacia.telefone || 'Telefone não informado';
    let endereco = farmacia.endereco || 'Endereço não informado';
    let nome = farmacia.nome || 'Farmácia';
    
    let nomeCodificado = encodeURIComponent(nome);
    let id = farmacia.id;
    
    // Obter URLs baseadas em coordenadas (prioridade)
    const urlDirecoes = obterUrlDirecoes(farmacia);
    const urlWaze = obterUrlWaze(farmacia);
    
    card.innerHTML = `
        <div class="farmacia-header">
            <div class="farmacia-title">
                <h3>${nome}</h3>
                ${badgePlantao}
            </div>
            <span class="farmacia-icon"></span>
        </div>
        <div class="farmacia-details">
            <div class="detail-item">
                <span class="detail-icon"></span>
                <span>${endereco}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">📞</span>
                <span>${telefone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-icon">🕒</span>
                <span>${horario}</span>
            </div>
        </div>
        <div class="farmacia-services">
            <p>Serviços Disponíveis:</p>
            <ul>${servicosHTML}</ul>
        </div>
        <div class="button-container" style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button class="medicamentos-btn" onclick="window.location.href='medicamentos.html?farmacia=${nomeCodificado}&id=${id}'" style="flex: 1;">
                 Medicamentos
            </button>
            <button class="details-btn" onclick="window.location.href='detalhes-farmacia.html?farmacia=${nomeCodificado}&id=${id}'" style="flex: 1;">
                 Detalhes
            </button>
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

function gerarServicos(farmacia, plantao) {
    let servicos = ['Venda de medicamentos', 'Consultas farmacêuticas'];
    if (plantao) servicos.push('Atendimento 24 horas');
    servicos.push('Medição de pressão arterial');
    if (farmacia.nome && farmacia.nome.toLowerCase().includes('popular')) {
        servicos.push('Preços acessíveis');
    }
    if (farmacia.nome && farmacia.nome.toLowerCase().includes('central')) {
        servicos.push('Ampla variedade');
    }
    return [...new Set(servicos)];
}

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
            let badge = cards[i].querySelector('.badge-plantao');
            if (badge) {
                cards[i].style.display = 'block';
                contador++;
            } else {
                cards[i].style.display = 'none';
            }
        }
    }
    
    let msgNenhum = document.querySelector('.nenhum-resultado');
    if (msgNenhum) msgNenhum.remove();
    
    if (contador === 0) {
        let grid = document.querySelector('.farmacias-grid');
        if (grid) {
            let msg = document.createElement('div');
            msg.className = 'nenhum-resultado';
            msg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; margin-top: 20px;';
            msg.innerHTML = `
                <span style="font-size: 48px;">🔍</span>
                <h3 style="margin: 16px 0; color: #374151;">Nenhuma farmácia encontrada</h3>
                <p style="color: #6b7280;">Tente outro filtro ou carregue mais farmácias.</p>
            `;
            grid.parentNode.insertBefore(msg, grid.nextSibling);
        }
    }
}

// ==================== FUNÇÕES PARA AS PÁGINAS DESTINO ====================

// Carregar medicamentos da farmácia via API
async function carregarMedicamentosDaFarmacia() {
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFarmacia = urlParams.get('farmacia');
    const id = urlParams.get('id');
    
    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmácia não encontrada</div>';
        return;
    }
    
    const nomeDecodificado = decodeURIComponent(nomeFarmacia);
    document.title = `Medicamentos - ${nomeDecodificado}`;
    
    try {
        // Buscar farmácia específica
        const farmacia = await apiRequest(`/farmacias/${id}`);
        const produtos = await apiRequest(`/produtos?farmaciaId=${id}`);
        
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
        
        if (produtos && produtos.length > 0) {
            let medicamentos = produtos.filter(p => p.categoria === 'Medicamento' || p.categoria === 'Genérico');
            let outros = produtos.filter(p => p.categoria !== 'Medicamento' && p.categoria !== 'Genérico');
            
            if (medicamentos.length > 0) {
                medicamentosHTML += `<h3 style="color: #059669; margin-top: 10px;"> Medicamentos</h3>`;
                for (let p of medicamentos) {
                    let statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponível';
                    let statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';
                    let statusColor = p.quantidade > 0 ? '#047857' : '#6b7280';
                    
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
                medicamentosHTML += `<h3 style="color: #7c3aed; margin-top: 20px;">📦 Outros Produtos</h3>`;
                for (let p of outros) {
                    let statusText = p.quantidade > 0 ? 'Em stock' : 'Indisponível';
                    let statusBg = p.quantidade > 0 ? '#d1fae5' : '#f3f4f6';
                    
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
                    <p style="font-size: 18px; color: #6b7280;">Nenhum medicamento cadastrado para esta farmácia.</p>
                    <p style="color: #9ca3af; margin-top: 10px;">Visite a farmácia para mais informações.</p>
                </div>
            `;
        }
        
        const urlDirecoes = obterUrlDirecoes(farmacia);
        const urlWaze = obterUrlWaze(farmacia);
        
        medicamentosHTML += `
                </div>
                <div style="margin-top: 30px; padding: 20px; background: #faf5ff; border-radius: 8px;">
                    <h3 style="color: #5b21b6; margin-bottom: 10px;"> Contacto</h3>
                    <p style="color: #4b5563;">Telefone: ${farmacia.telefone || 'Disponível na farmácia'}</p>
                    <p style="color: #4b5563;">Endereço: ${farmacia.endereco || 'Disponível na farmácia'}</p>
                    <p style="color: #4b5563;">Horário: ${farmacia.horario || (farmacia.plantao ? '24 horas' : '08:00 - 18:00')}</p>
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
                    <a href="farm.html" style="color: #7c3aed; text-decoration: none;">← Voltar para lista de farmácias</a>
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

// Carregar detalhes da farmácia via API
async function carregarDetalhesDaFarmacia() {
    const urlParams = new URLSearchParams(window.location.search);
    const nomeFarmacia = urlParams.get('farmacia');
    const id = urlParams.get('id');
    
    if (!nomeFarmacia) {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Farmácia não encontrada</div>';
        return;
    }
    
    const nomeDecodificado = decodeURIComponent(nomeFarmacia);
    document.title = `Detalhes - ${nomeDecodificado}`;
    
    try {
        const farmacia = await apiRequest(`/farmacias/${id}`);
        const produtos = await apiRequest(`/produtos?farmaciaId=${id}`);
        
        let container = document.querySelector('.detalhes-container') || document.body;
        
        let plantaoTexto = farmacia.plantao ? ' Sim (24 horas)' : ' Não';
        let horario = farmacia.horario || (farmacia.plantao ? '24 horas' : '08:00 - 18:00');
        
        let enderecoCompleto = farmacia.endereco || 'Endereço não informado';
        
        const urldirecoes = obterUrlDirecoes(farmacia);
        const urlWaze = obterUrlWaze(farmacia);
        
        let detalhesHTML = `
            <div style="max-width: 900px; margin: 40px auto; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <a href="farm.html" style="text-decoration: none; color: #7c3aed; font-size: 18px;">← Voltar</a>
                    <h1 style="color: #1f2937; margin: 0; flex: 1;"> ${nomeDecodificado}</h1>
                    <span style="background: ${farmacia.plantao ? '#dbeafe' : '#d1fae5'}; color: ${farmacia.plantao ? '#1e40af' : '#047857'}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                        ${farmacia.plantao ? ' 24 Horas' : ' Horário Comercial'}
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"> Localização e Contacto</h3>
                            <div style="margin-bottom: 15px;">
                                <p><strong>Endereço:</strong></p>
                                <p style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    ${enderecoCompleto}<br>
                                    <small style="color: #6b7280;">Nampula, Moçambique</small>
                                </p>
                            </div>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <a href="tel:${farmacia.telefone}" style="flex: 1; background: #7c3aed; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;"> Ligar Agora</a>
                                <a href="https://wa.me/258${(farmacia.telefone || '').replace(/[^0-9]/g, '')}" style="flex: 1; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;">💬 WhatsApp</a>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="window.open('${urldirecoes}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;"> Como Chegar</button>
                                <button onclick="window.open('${urlWaze}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;"> Waze</button>
                            </div>
                        </div>
                        
                    // Horário de Funcionamento
<div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
    <h3 style="color: #374151; margin-bottom: 15px;">🕒 Horário de Funcionamento</h3>
    
    <div style="background: white; padding: 15px; border-radius: 8px;">
        ${farmacia.plantao ? 
            '<div>Segunda a Domingo: <strong style="color: #059669;">24 horas</strong></div>' :
            `<div>Horário: <strong>${farmacia.horario || '08:00 - 18:00'}</strong></div>`
        }
    </div>
    
    ${farmacia.plantao ? 
        '<p style="margin-top: 10px; color: #059669;">✅ Aberto 24 horas, inclusive feriados</p>' : 
        '<p style="margin-top: 10px; color: #6b7280;">⚠️ Horário pode variar em feriados</p>'
    }
</div>
                    
                    <div>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                            <h3 style="color: #374151; margin-bottom: 15px;">💳 Pagamento</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <span style="background: white; padding: 8px 12px; border-radius: 20px;"> Dinheiro</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px;"> Cartão</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px;"> M-Pesa</span>
                                <span style="background: white; padding: 8px 12px; border-radius: 20px;"> E-Mola</span>
                            </div>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-top: 20px;">
                            <h3 style="color: #374151; margin-bottom: 15px;"> Estatísticas</h3>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; color: #7c3aed;">${produtos.length}</div>
                                <div style="font-size: 12px;">Produtos disponíveis</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button onclick="window.location.href='medicamentos.html?farmacia=${nomeFarmacia}&id=${farmacia.id}'" style="background: #059669; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                         Ver Medicamentos (${produtos.length})
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
        document.body.innerHTML = '<div style="text-align: center; padding: 50px;">Erro ao carregar detalhes da farmácia</div>';
    }
}

// ==================== INICIALIZAÇÃO ====================

// Tornar funções globais
window.obterUrlDirecoes = obterUrlDirecoes;
window.obterUrlWaze = obterUrlWaze;
window.obterUrlGoogleMaps = obterUrlGoogleMaps;
window.filtrarFarmacias = filtrarFarmacias;
window.carregarFarmacias = carregarFarmacias;
window.carregarMedicamentosDaFarmacia = carregarMedicamentosDaFarmacia;
window.carregarDetalhesDaFarmacia = carregarDetalhesDaFarmacia;

// Inicialização
let inicializado = false;

document.addEventListener('DOMContentLoaded', function () {
    if (inicializado) return;
    inicializado = true;
    
    const path = window.location.pathname;
    
    if (path.includes('medicamentos.html')) {
        carregarMedicamentosDaFarmacia();
    } else if (path.includes('detalhes-farmacia.html')) {
        carregarDetalhesDaFarmacia();
    } else if (path.includes('farm.html') || path === '/' || path.includes('farm')) {
        setTimeout(() => {
            carregarFarmacias();
        }, 100);
        
        let filterSelect = document.getElementById('filter-select');
        if (filterSelect && !filterSelect.hasAttribute('data-listener')) {
            filterSelect.setAttribute('data-listener', 'true');
            filterSelect.addEventListener('change', function (e) {
                filtrarFarmacias(e.target.value);
            });
        }
    }
});
