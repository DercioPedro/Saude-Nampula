// admin-panel.js - Versão corrigida

let token = null;

// Verificar autenticação
function checkAuth() {
    token = getAuthToken();
    if (!token) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

async function carregarInfoUsuario() {
    let usuario = localStorage.getItem('adminUsername') || 'Administrador';
    document.getElementById('nomeUsuario').textContent = usuario;
}

function sair() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('api_token');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'admin-login.html';
    }
}

async function atualizarContadores() {
    try {
        const stats = await apiRequest('/estatisticas');
        document.getElementById('contadorHospitais').textContent = stats.hospitais;
        document.getElementById('contadorCentros').textContent = stats.centros;
        document.getElementById('contadorFarmacias').textContent = stats.farmacias;
        document.getElementById('contadorEmergencias').textContent = stats.emergencias;
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
    }
}

function mudarAba(abaNome) {
    let abas = document.querySelectorAll('.tab');
    for (let i = 0; i < abas.length; i++) {
        abas[i].classList.remove('active');
    }

    let conteudos = document.querySelectorAll('.tab-content');
    for (let i = 0; i < conteudos.length; i++) {
        conteudos[i].classList.remove('active');
    }

    event.target.classList.add('active');
    document.getElementById('aba-' + abaNome).classList.add('active');
    
    // Carregar dados específicos da aba
    if (abaNome === 'avaliacoes') {
        carregarAvaliacoesAdmin();
    }
}

async function carregarTabelas() {
    await Promise.all([
        carregarHospitais(),
        carregarCentros(),
        carregarFarmacias(),
        carregarEmergencias()
    ]);
}

async function carregarHospitais() {
    try {
        const hospitais = await apiRequest('/hospitais');
        let corpo = document.getElementById('corpoHospitais');

        if (hospitais.length === 0) {
            corpo.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum hospital cadastrado</td></tr>';
            return;
        }

        let html = '';
        for (let h of hospitais) {
            html += `
                <tr>
                    <td><strong>${h.nome}</strong></td>
                    <td>${h.endereco}</td>
                    <td>${h.telefone}</td>
                    <td>${h.horario}</td>
                    <td>${h.latitude ? h.latitude + ', ' + h.longitude : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editarItem('hospital', ${h.id})">Editar</button>
                            <button class="btn-delete" onclick="deletarItem('hospital', ${h.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar hospitais:', error);
    }
}

async function carregarCentros() {
    try {
        const centros = await apiRequest('/centros');
        let corpo = document.getElementById('corpoCentros');

        if (centros.length === 0) {
            corpo.innerHTML = '<td><td colspan="7" style="text-align: center;">Nenhum centro cadastrado</td></tr>';
            return;
        }

        let html = '';
        for (let c of centros) {
            html += `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.endereco}</td>
                    <td>${c.telefone}</td>
                    <td>${c.horario}</td>
                    <td>${c.latitude ? c.latitude + ', ' + c.longitude : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editarItem('centro', ${c.id})">Editar</button>
                            <button class="btn-delete" onclick="deletarItem('centro', ${c.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar centros:', error);
    }
}

async function carregarFarmacias() {
    try {
        const farmacias = await apiRequest('/farmacias');
        let corpo = document.getElementById('corpoFarmacias');

        if (farmacias.length === 0) {
            corpo.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma farmácia cadastrada</td></tr>';
            return;
        }

        let html = '';
        for (let f of farmacias) {
            html += `
                <tr>
                    <td><strong>${f.nome}</strong></td>
                    <td>${f.endereco}</td>
                    <td>${f.telefone}</td>
                    <td>${f.horario}</td>
                    <td>${f.latitude ? f.latitude + ', ' + f.longitude : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editarItem('farmacia', ${f.id})">Editar</button>
                            <button class="btn-delete" onclick="deletarItem('farmacia', ${f.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar farmácias:', error);
    }
}

async function carregarEmergencias() {
    try {
        const emergencias = await apiRequest('/emergencias');
        let corpo = document.getElementById('corpoEmergencias');

        if (emergencias.length === 0) {
            corpo.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum contato cadastrado</td></tr>';
            return;
        }

        let html = '';
        for (let e of emergencias) {
            html += `
                <tr>
                    <td><strong>${e.nome}</strong></td>
                    <td>${e.tipo}</td>
                    <td>${e.telefone}</td>
                    <td>${e.disponibilidade}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editarItem('emergencia', ${e.id})">Editar</button>
                            <button class="btn-delete" onclick="deletarItem('emergencia', ${e.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar emergências:', error);
    }
}

// ==================== AVALIAÇÕES ====================

let avaliacaoAtualId = null;
async function carregarAvaliacoesAdmin() {
    try {
        const tipo = document.getElementById('filtroTipoAvaliacao')?.value || '';
        let url = '/avaliacoes/todas';
        if (tipo) {
            url += `?tipo=${tipo}`;
        }

        console.log('Carregando avaliações...');
        
        const result = await apiRequest(url, 'GET', null, token);
        const corpo = document.getElementById('corpoAvaliacoes');

        if (!corpo) {
            console.error('Elemento corpoAvaliacoes não encontrado');
            return;
        }

        if (!result || result.length === 0) {
            corpo.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma avaliação encontrada</td></tr>';
            return;
        }

        let html = '';
        for (const av of result) {
            const estrelas = '★'.repeat(av.nota) + '☆'.repeat(5 - av.nota);
            const comentarioResumido = av.comentario.length > 100 ? av.comentario.substring(0, 100) + '...' : av.comentario;
            
            html += `
                <tr>
                    <td>${av.data || ''}</td>
                    <td>
                        <strong>${escapeHtml(av.nome)}</strong>
                        ${av.email ? `<br><small style="color:#6b7280;">${escapeHtml(av.email)}</small>` : ''}
                     </td>
                    <td><span style="color:#fbbf24;">${estrelas}</span> (${av.nota})</td>
                    <td style="max-width:300px;">${escapeHtml(comentarioResumido)}</td>
                    <td>${av.resposta ? '<span style="color:#059669;">✅ Respondido</span>' : '<span style="color:#6b7280;">⏳ Pendente</span>'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="abrirModalResposta(${av.id})">✏️ Responder</button>
                            <button class="btn-delete" onclick="deletarAvaliacao(${av.id})">🗑️ Excluir</button>
                        </div>
                     </td>
                 </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        const corpo = document.getElementById('corpoAvaliacoes');
        if (corpo) {
            corpo.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">
                ❌ Erro ao carregar: ${error.message}
              </td></tr>`;
        }
    }
}

function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>');
}

function abrirModalResposta(id) {
    avaliacaoAtualId = id;
    
    // Encontrar a linha clicada
    const button = event.target;
    const row = button.closest('tr');
    
    // O comentário está na 4ª coluna (índice 3)
    const comentarioCell = row.cells[3];
    const comentario = comentarioCell.textContent;
    
    document.getElementById('comentarioOriginal').textContent = comentario;
    document.getElementById('respostaTexto').value = '';
    document.getElementById('modalResposta').style.display = 'flex';
}

function fecharModalResposta() {
    document.getElementById('modalResposta').style.display = 'none';
    avaliacaoAtualId = null;
}

async function enviarResposta() {
    const resposta = document.getElementById('respostaTexto').value.trim();

    if (!resposta) {
        alert('Digite uma resposta!');
        return;
    }

    try {
        await apiRequest(`/avaliacoes/${avaliacaoAtualId}/responder`, 'POST', { resposta }, token);
        alert('✅ Resposta enviada com sucesso!');
        fecharModalResposta();
        await carregarAvaliacoesAdmin();
    } catch (error) {
        alert('Erro ao enviar resposta: ' + error.message);
    }
}

async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
        await apiRequest(`/avaliacoes/${id}`, 'DELETE', null, token);
        alert('✅ Avaliação excluída com sucesso!');
        await carregarAvaliacoesAdmin();
    } catch (error) {
        alert('Erro ao excluir: ' + error.message);
    }
}

// ==================== CRUD GERAL ====================

let tipoAtual = '';
let idAtual = null;

function abrirModalAdicionar(tipo) {
    tipoAtual = tipo;
    idAtual = null;

    let titulos = {
        'hospital': 'Adicionar Hospital',
        'centro': 'Adicionar Centro de Saúde',
        'farmacia': 'Adicionar Farmácia',
        'emergencia': 'Adicionar Contato de Emergência'
    };

    document.getElementById('tituloModal').textContent = titulos[tipo];
    mostrarCamposFormulario(tipo);
    document.getElementById('modal').classList.add('active');
}

function buscarCoordenadasPorEndereco() {
    const endereco = document.getElementById('endereco').value;
    if (!endereco) {
        alert('Digite um endereço primeiro para buscar as coordenadas!');
        return;
    }

    const enderecoCompleto = encodeURIComponent(endereco + ', Nampula, Moçambique');
    const url = `https://nominatim.openstreetmap.org/search?q=${enderecoCompleto}&format=json&limit=1`;

    document.getElementById('latitude').value = 'Buscando...';
    document.getElementById('longitude').value = 'Buscando...';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                document.getElementById('latitude').value = data[0].lat;
                document.getElementById('longitude').value = data[0].lon;
                alert('Coordenadas encontradas!');
            } else {
                document.getElementById('latitude').value = '';
                document.getElementById('longitude').value = '';
                alert('Endereço não encontrado. Verifique o endereço ou insira as coordenadas manualmente.');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar coordenadas:', error);
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            alert('Erro ao buscar coordenadas. Insira manualmente.');
        });
}

function abrirMapaParaSelecionar() {
    const endereco = document.getElementById('endereco').value;
    if (!endereco) {
        alert('Digite um endereço primeiro para selecionar no mapa!');
        return;
    }

    const enderecoCompleto = encodeURIComponent(endereco + ', Nampula, Moçambique');
    const url = `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    window.open(url, '_blank');
    alert('No Google Maps, clique com botão direito no local exato e selecione "O que há aqui?" para ver as coordenadas.');
}

function mostrarCamposFormulario(tipo) {
    let campos = document.getElementById('camposFormulario');

    if (tipo === 'hospital' || tipo === 'centro') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Endereço *</label><input type="text" id="endereco" required></div>
            <div class="form-group"><label>Telefone *</label><input type="tel" id="telefone" required></div>
            <div class="form-group"><label>Horário *</label><input type="text" id="horario" required></div>
            <div class="form-group"><label>Serviços</label><textarea id="servicos" placeholder="Separados por vírgula"></textarea></div>
            
            <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
                <h4>📍 Localização Exata (Opcional)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label>Latitude</label><input type="text" id="latitude" placeholder="Ex: -15.1165"></div>
                    <div class="form-group"><label>Longitude</label><input type="text" id="longitude" placeholder="Ex: 39.2667"></div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="button" class="btn-coordenadas" onclick="buscarCoordenadasPorEndereco()" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        🔍 Buscar Coordenadas
                    </button>
                    <button type="button" class="btn-mapa" onclick="abrirMapaParaSelecionar()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        🗺️ Selecionar no Mapa
                    </button>
                </div>
                <small style="color: #6b7280;">Se não informar coordenadas, usaremos o endereço para localização.</small>
            </div>
        `;
    } else if (tipo === 'farmacia') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Endereço *</label><input type="text" id="endereco" required></div>
            <div class="form-group"><label>Telefone *</label><input type="tel" id="telefone" required></div>
            <div class="form-group"><label>Horário *</label><input type="text" id="horario" required></div>
            <div class="form-group"><label>Plantão</label><select id="plantao"><option value="false">Não</option><option value="true">Sim</option></select></div>
            
            <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
                <h4>📍 Localização Exata (Opcional)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label>Latitude</label><input type="text" id="latitude" placeholder="Ex: -15.1165"></div>
                    <div class="form-group"><label>Longitude</label><input type="text" id="longitude" placeholder="Ex: 39.2667"></div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="button" class="btn-coordenadas" onclick="buscarCoordenadasPorEndereco()" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        🔍 Buscar Coordenadas
                    </button>
                    <button type="button" class="btn-mapa" onclick="abrirMapaParaSelecionar()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        🗺️ Selecionar no Mapa
                    </button>
                </div>
                <small style="color: #6b7280;">Se não informar coordenadas, usaremos o endereço para localização.</small>
            </div>
        `;
    } else if (tipo === 'emergencia') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Tipo *</label><select id="tipo" required><option value="">Selecione...</option><option value="Ambulância">Ambulância</option><option value="Bombeiros">Bombeiros</option><option value="Polícia">Polícia</option><option value="Resgate">Resgate</option></select></div>
            <div class="form-group"><label>Telefone *</label><input type="tel" id="telefone" required></div>
            <div class="form-group"><label>Disponibilidade *</label><input type="text" id="disponibilidade" value="24/7" required></div>
        `;
    }
}

async function editarItem(tipo, id) {
    tipoAtual = tipo;
    idAtual = id;

    let endpoint = tipo === 'hospital' ? '/hospitais' : tipo === 'centro' ? '/centros' : tipo === 'farmacia' ? '/farmacias' : '/emergencias';

    try {
        const item = await apiRequest(`${endpoint}/${id}`);

        let titulos = {
            'hospital': 'Editar Hospital',
            'centro': 'Editar Centro de Saúde',
            'farmacia': 'Editar Farmácia',
            'emergencia': 'Editar Contato de Emergência'
        };

        document.getElementById('tituloModal').textContent = titulos[tipo];
        mostrarCamposFormulario(tipo);

        document.getElementById('nome').value = item.nome;
        if (tipo !== 'emergencia') {
            document.getElementById('endereco').value = item.endereco || '';
            if (document.getElementById('latitude')) {
                document.getElementById('latitude').value = item.latitude || '';
                document.getElementById('longitude').value = item.longitude || '';
            }
        }
        document.getElementById('telefone').value = item.telefone;

        if (tipo === 'hospital' || tipo === 'centro') {
            document.getElementById('horario').value = item.horario;
            if (item.servicos) document.getElementById('servicos').value = item.servicos;
        } else if (tipo === 'farmacia') {
            document.getElementById('horario').value = item.horario;
            document.getElementById('plantao').value = item.plantao ? 'true' : 'false';
        } else if (tipo === 'emergencia') {
            document.getElementById('tipo').value = item.tipo;
            document.getElementById('disponibilidade').value = item.disponibilidade;
        }

        document.getElementById('modal').classList.add('active');
    } catch (error) {
        console.error('Erro ao carregar item:', error);
        alert('Erro ao carregar dados do item');
    }
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('formularioItem').reset();
    tipoAtual = '';
    idAtual = null;
}

document.getElementById('formularioItem').addEventListener('submit', async function (e) {
    e.preventDefault();

    let endpoint = tipoAtual === 'hospital' ? '/hospitais' : tipoAtual === 'centro' ? '/centros' : tipoAtual === 'farmacia' ? '/farmacias' : '/emergencias';

    let dadosFormulario = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value
    };

    if (tipoAtual === 'hospital' || tipoAtual === 'centro') {
        dadosFormulario.endereco = document.getElementById('endereco').value;
        dadosFormulario.horario = document.getElementById('horario').value;
        dadosFormulario.servicos = document.getElementById('servicos') ? document.getElementById('servicos').value : '';
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        if (latInput && latInput.value) {
            dadosFormulario.latitude = parseFloat(latInput.value);
            dadosFormulario.longitude = parseFloat(lngInput.value);
        }
    } else if (tipoAtual === 'farmacia') {
        dadosFormulario.endereco = document.getElementById('endereco').value;
        dadosFormulario.horario = document.getElementById('horario').value;
        dadosFormulario.plantao = document.getElementById('plantao').value === 'true';
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        if (latInput && latInput.value) {
            dadosFormulario.latitude = parseFloat(latInput.value);
            dadosFormulario.longitude = parseFloat(lngInput.value);
        }
    } else if (tipoAtual === 'emergencia') {
        dadosFormulario.tipo = document.getElementById('tipo').value;
        dadosFormulario.disponibilidade = document.getElementById('disponibilidade').value;
    }

    try {
        if (idAtual) {
            await apiRequest(`${endpoint}/${idAtual}`, 'PUT', dadosFormulario, token);
            alert('Item atualizado com sucesso!');
        } else {
            await apiRequest(endpoint, 'POST', dadosFormulario, token);
            alert('Item adicionado com sucesso!');
        }

        fecharModal();
        await carregarTabelas();
        await atualizarContadores();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar: ' + error.message);
    }
});

async function deletarItem(tipo, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    let endpoint = tipo === 'hospital' ? '/hospitais' : tipo === 'centro' ? '/centros' : tipo === 'farmacia' ? '/farmacias' : '/emergencias';

    try {
        await apiRequest(`${endpoint}/${id}`, 'DELETE', null, token);
        alert('Item excluído com sucesso!');
        await carregarTabelas();
        await atualizarContadores();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir item');
    }
}

document.getElementById('modal').addEventListener('click', function (e) {
    if (e.target === this) fecharModal();
});

// Tornar funções globais
window.buscarCoordenadasPorEndereco = buscarCoordenadasPorEndereco;
window.abrirMapaParaSelecionar = abrirMapaParaSelecionar;
window.abrirModalResposta = abrirModalResposta;
window.fecharModalResposta = fecharModalResposta;
window.enviarResposta = enviarResposta;
window.deletarAvaliacao = deletarAvaliacao;

// ==================== INICIALIZAÇÃO ====================
if (checkAuth()) {
    carregarInfoUsuario();
    atualizarContadores();
    carregarTabelas();
    // Pequeno delay para garantir que o token está pronto
    setTimeout(() => {
        carregarAvaliacoesAdmin();
    }, 500);
}