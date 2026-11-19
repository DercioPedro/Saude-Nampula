// admin-panel.js - Versão Completa e Corrigida

let token = null;

// Verificar autenticação ao carregar a página
function checkAuth() {
    token = getAuthToken();
    if (!token) {
        window.location.href = '/admin-login';
        return false;
    }
    return true;
}

async function carregarInfoUsuario() {
    let usuario = localStorage.getItem('adminUsername') || 'Administrador';
    document.getElementById('nomeUsuario').textContent = usuario;
}

// ==================== LOGOUT CORRIGIDO ====================
function sair() {
    if (confirm('Tem certeza que deseja sair?')) {
        // 1. Limpar todas as variáveis de login
        localStorage.removeItem('api_token');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        
        // 2. Desregistar Service Worker (Para não ficar preso no cache)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        
        // 3. Redirecionar e forçar recarregamento limpo
        window.location.replace('/admin-login');
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
    for (let i = 0; i < abas.length; i++) abas[i].classList.remove('active');
    
    let conteudos = document.querySelectorAll('.tab-content');
    for (let i = 0; i < conteudos.length; i++) conteudos[i].classList.remove('active');

    let botaoClicado = null;
    for (let i = 0; i < abas.length; i++) {
        if (abas[i].textContent.trim().toLowerCase() === abaNome.toLowerCase() || 
            abas[i].getAttribute('onclick')?.includes(abaNome)) {
            botaoClicado = abas[i];
            break;
        }
    }
    
    if (botaoClicado) botaoClicado.classList.add('active');
    document.getElementById('aba-' + abaNome).classList.add('active');
    
    if (abaNome === 'avaliacoes') carregarAvaliacoesAdmin();
    if (abaNome === 'publicacoes') carregarPublicacoesAdmin();
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
            corpo.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum hospital cadastrado</td></tr>';
            return;
        }

        let html = '';
        for (let h of hospitais) {
            const localizacao = h.latitude && h.longitude ? h.latitude + ', ' + h.longitude : (h.endereco || '-');
            html += `
                <tr>
                    <td><strong>${escapeHtml(h.nome)}</strong></td>
                    <td>${escapeHtml(h.endereco || '-')}</td>
                    <td>${escapeHtml(h.telefone || '-')}</td>
                    <td>${escapeHtml(h.horario || '-')}</td>
                    <td>${escapeHtml(localizacao)}</td>
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
            corpo.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum centro cadastrado</td></tr>';
            return;
        }
        let html = '';
        for (let c of centros) {
            const localizacao = c.latitude && c.longitude ? c.latitude + ', ' + c.longitude : (c.endereco || '-');
            html += `
                <tr>
                    <td><strong>${escapeHtml(c.nome)}</strong></td>
                    <td>${escapeHtml(c.endereco || '-')}</td>
                    <td>${escapeHtml(c.telefone || '-')}</td>
                    <td>${escapeHtml(c.horario || '-')}</td>
                    <td>${escapeHtml(localizacao)}</td>
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
            corpo.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma farmácia cadastrada</td></tr>';
            return;
        }
        let html = '';
        for (let f of farmacias) {
            const localizacao = f.latitude && f.longitude ? f.latitude + ', ' + f.longitude : (f.endereco || '-');
            html += `
                <tr>
                    <td><strong>${escapeHtml(f.nome)}</strong></td>
                    <td>${escapeHtml(f.endereco || '-')}</td>
                    <td>${escapeHtml(f.telefone || '-')}</td>
                    <td>${escapeHtml(f.horario || '-')}</td>
                    <td>${escapeHtml(localizacao)}</td>
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
                    <td><strong>${escapeHtml(e.nome)}</strong></td>
                    <td>${escapeHtml(e.tipo)}</td>
                    <td>${escapeHtml(e.telefone || '-')}</td>
                    <td>${escapeHtml(e.disponibilidade || '-')}</td>
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
        if (tipo) url += '?tipo=' + tipo;

        const result = await apiRequest(url, 'GET', null, token);
        const corpo = document.getElementById('corpoAvaliacoes');
        if (!corpo) return;

        if (!result || result.length === 0) {
            corpo.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma avaliação encontrada</td></tr>';
            return;
        }

        let html = '';
        for (const av of result) {
            var estrelas = '';
            for (var i = 0; i < av.nota; i++) estrelas += '★';
            for (var j = av.nota; j < 5; j++) estrelas += '☆';
            
            var comentarioResumido = av.comentario.length > 100 ? av.comentario.substring(0, 100) + '...' : av.comentario;
            
            html += `
                <tr>
                    <td>${av.data || ''}</td>
                    <td><strong>${escapeHtml(av.nome)}</strong>${av.email ? '<br><small style="color:#6b7280;">' + escapeHtml(av.email) + '</small>' : ''}</td>
                    <td><span style="color:#fbbf24;">${estrelas}</span> (${av.nota})</td>
                    <td style="max-width:300px;">${escapeHtml(comentarioResumido)}</td>
                    <td>${av.resposta ? '<span style="color:#059669;">Respondido</span>' : '<span style="color:#6b7280;">Pendente</span>'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="abrirModalResposta(${av.id})">Responder</button>
                            <button class="btn-delete" onclick="deletarAvaliacao(${av.id})">Excluir</button>
                        </div>
                     </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        const corpo = document.getElementById('corpoAvaliacoes');
        if (corpo) corpo.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#dc2626;">Erro ao carregar: ' + error.message + '</td></tr>';
    }
}

function escapeHtml(texto) {
    if (!texto) return '';
    return texto.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '<br>');
}

function abrirModalResposta(id) {
    avaliacaoAtualId = id;
    var button = event.target;
    var row = button.closest('tr');
    var comentarioCell = row.cells[3];
    document.getElementById('comentarioOriginal').textContent = comentarioCell.textContent;
    document.getElementById('respostaTexto').value = '';
    document.getElementById('modalResposta').style.display = 'flex';
}

function fecharModalResposta() {
    document.getElementById('modalResposta').style.display = 'none';
    avaliacaoAtualId = null;
}

async function enviarResposta() {
    var resposta = document.getElementById('respostaTexto').value.trim();
    if (!resposta) return alert('Digite uma resposta!');

    try {
        await apiRequest('/avaliacoes/' + avaliacaoAtualId + '/responder', 'POST', { resposta: resposta }, token);
        alert('Resposta enviada com sucesso!');
        fecharModalResposta();
        await carregarAvaliacoesAdmin();
    } catch (error) {
        alert('Erro ao enviar resposta: ' + error.message);
    }
}

// ==================== DELETAR AVALIAÇÃO (CORRIGIDO) ====================
async function deletarAvaliacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
        const tokenAtual = getAuthToken();
        await apiRequest('/avaliacoes/' + id, 'DELETE', null, tokenAtual);
        alert('Avaliação excluída com sucesso!');
        await carregarAvaliacoesAdmin();
    } catch (error) {
        alert('Erro ao excluir: ' + error.message);
    }
}

// ==================== PUBLICAÇÕES ====================
var publicacaoEditandoId = null;

async function carregarPublicacoesAdmin() {
    try {
        var categoria = document.getElementById('filtroCategoriaPublicacao')?.value || '';
        var url = '/publicacoes';
        if (categoria) url += '?categoria=' + categoria;

        var publicacoes = await apiRequest(url);
        var corpo = document.getElementById('corpoPublicacoes');
        if (!corpo) return;

        if (!publicacoes || publicacoes.length === 0) {
            corpo.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">Nenhuma publicação encontrada</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < publicacoes.length; i++) {
            var pub = publicacoes[i];
            var dataFormatada = new Date(pub.data).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
            var statusHTML = pub.ativo !== false
                ? '<span style="color: #059669; background: #d1fae5; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Ativo</span>'
                : '<span style="color: #6b7280; background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Inativo</span>';

            html += `
                <tr>
                    <td><strong>${escapeHtml(pub.titulo)}</strong></td>
                    <td><span style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${escapeHtml(pub.categoria)}</span></td>
                    <td>${dataFormatada}</td>
                    <td>${statusHTML}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editarPublicacao(${pub.id})">Editar</button>
                            <button class="btn-toggle" onclick="togglePublicacao(${pub.id})" style="background: #fef3c7; color: #d97706; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">${pub.ativo !== false ? 'Desativar' : 'Ativar'}</button>
                            <button class="btn-delete" onclick="deletarPublicacao(${pub.id})">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        corpo.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar publicações:', error);
        var corpo = document.getElementById('corpoPublicacoes');
        if (corpo) corpo.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #dc2626;">Erro ao carregar: ' + error.message + '</td></tr>';
    }
}

function abrirModalPublicacao() {
    publicacaoEditandoId = null;
    document.getElementById('tituloModalPublicacao').textContent = 'Nova Publicação';
    document.getElementById('publicacaoId').value = '';
    document.getElementById('publicacaoTitulo').value = '';
    document.getElementById('publicacaoCategoria').value = 'Noticia';
    document.getElementById('publicacaoResumo').value = '';
    document.getElementById('publicacaoConteudo').value = '';
    document.getElementById('publicacaoImagem').value = '';
    document.getElementById('publicacaoAutor').value = '';
    document.getElementById('modalPublicacao').classList.add('active');
}

function fecharModalPublicacao() {
    document.getElementById('modalPublicacao').classList.remove('active');
    publicacaoEditandoId = null;
}

async function editarPublicacao(id) {
    try {
        var pub = await apiRequest('/publicacoes/' + id);
        publicacaoEditandoId = id;
        document.getElementById('tituloModalPublicacao').textContent = 'Editar Publicação';
        document.getElementById('publicacaoId').value = pub.id;
        document.getElementById('publicacaoTitulo').value = pub.titulo || '';
        document.getElementById('publicacaoCategoria').value = pub.categoria || 'Noticia';
        document.getElementById('publicacaoResumo').value = pub.resumo || '';
        document.getElementById('publicacaoConteudo').value = pub.conteudo || '';
        document.getElementById('publicacaoImagem').value = pub.imagem || '';
        document.getElementById('publicacaoAutor').value = pub.autor || '';
        document.getElementById('modalPublicacao').classList.add('active');
    } catch (error) {
        alert('Erro ao carregar publicação: ' + error.message);
    }
}

async function salvarPublicacao(event) {
    event.preventDefault();
    var id = document.getElementById('publicacaoId').value;
    var dados = {
        titulo: document.getElementById('publicacaoTitulo').value.trim(),
        categoria: document.getElementById('publicacaoCategoria').value,
        resumo: document.getElementById('publicacaoResumo').value.trim(),
        conteudo: document.getElementById('publicacaoConteudo').value.trim(),
        imagem: document.getElementById('publicacaoImagem').value.trim(),
        autor: document.getElementById('publicacaoAutor').value.trim() || 'Saúde Nampula'
    };

    if (!dados.titulo || !dados.resumo || !dados.conteudo) return alert('Preencha todos os campos obrigatórios (*)');

    try {
        if (id) {
            await apiRequest('/publicacoes/' + id, 'PUT', dados, token);
            alert('Publicação atualizada com sucesso!');
        } else {
            await apiRequest('/publicacoes', 'POST', dados, token);
            alert('Publicação criada com sucesso!');
        }
        fecharModalPublicacao();
        await carregarPublicacoesAdmin();
    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
}

async function togglePublicacao(id) {
    try {
        var pub = await apiRequest('/publicacoes/' + id);
        await apiRequest('/publicacoes/' + id, 'PUT', { ativo: pub.ativo === false ? true : false }, token);
        await carregarPublicacoesAdmin();
    } catch (error) {
        alert('Erro ao alterar status: ' + error.message);
    }
}

// ==================== DELETAR PUBLICAÇÃO (CORRIGIDO) ====================
async function deletarPublicacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta publicação permanentemente?')) return;
    try {
        const tokenAtual = getAuthToken();
        await apiRequest('/publicacoes/' + id, 'DELETE', null, tokenAtual);
        alert('Publicação excluída com sucesso!');
        await carregarPublicacoesAdmin();
    } catch (error) {
        alert('Erro ao excluir: ' + error.message);
    }
}

// ==================== CRUD GERAL (HOSPITAIS, ETC) ====================
let tipoAtual = '';
let idAtual = null;

function abrirModalAdicionar(tipo) {
    tipoAtual = tipo;
    idAtual = null;
    var titulos = { 'hospital': 'Adicionar Hospital', 'centro': 'Adicionar Centro de Saúde', 'farmacia': 'Adicionar Farmácia', 'emergencia': 'Adicionar Contato de Emergência' };
    document.getElementById('tituloModal').textContent = titulos[tipo];
    mostrarCamposFormulario(tipo);
    document.getElementById('modal').classList.add('active');
}

function buscarCoordenadasPorEndereco() {
    var endereco = document.getElementById('endereco').value;
    if (!endereco) return alert('Digite um endereço primeiro para buscar as coordenadas!');
    var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(endereco + ', Nampula, Moçambique') + '&format=json&limit=1';
    document.getElementById('latitude').value = 'Buscando...';
    document.getElementById('longitude').value = 'Buscando...';
    fetch(url).then(r => r.json()).then(data => {
        if (data && data.length > 0) {
            document.getElementById('latitude').value = data[0].lat;
            document.getElementById('longitude').value = data[0].lon;
            alert('Coordenadas encontradas!');
        } else {
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
            alert('Endereço não encontrado.');
        }
    }).catch(() => alert('Erro ao buscar coordenadas.'));
}

function abrirMapaParaSelecionar() {
    var endereco = document.getElementById('endereco').value;
    if (!endereco) return alert('Digite um endereço primeiro para selecionar no mapa!');
    window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(endereco + ', Nampula, Moçambique'), '_blank');
}

function mostrarCamposFormulario(tipo) {
    var campos = document.getElementById('camposFormulario');
    if (tipo === 'hospital' || tipo === 'centro') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Endereço</label><input type="text" id="endereco"></div>
            <div class="form-group"><label>Telefone</label><input type="tel" id="telefone"></div>
            <div class="form-group"><label>Horário</label><input type="text" id="horario"></div>
            <div class="form-group"><label>Serviços</label><textarea id="servicos"></textarea></div>
            <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
                <h4>Localização Exata</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label>Latitude</label><input type="text" id="latitude"></div>
                    <div class="form-group"><label>Longitude</label><input type="text" id="longitude"></div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="button" onclick="buscarCoordenadasPorEndereco()" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Buscar Coordenadas</button>
                </div>
            </div>
        `;
    } else if (tipo === 'farmacia') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Endereço</label><input type="text" id="endereco"></div>
            <div class="form-group"><label>Telefone</label><input type="tel" id="telefone"></div>
            <div class="form-group"><label>Horário Geral</label><input type="text" id="horario"></div>
            <div class="form-group"><label>Plantão 24h?</label><select id="plantao"><option value="false">Não</option><option value="true">Sim</option></select></div>
            <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
                <h4>Localização Exata</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label>Latitude</label><input type="text" id="latitude"></div>
                    <div class="form-group"><label>Longitude</label><input type="text" id="longitude"></div>
                </div>
            </div>
        `;
    } else if (tipo === 'emergencia') {
        campos.innerHTML = `
            <div class="form-group"><label>Nome *</label><input type="text" id="nome" required></div>
            <div class="form-group"><label>Tipo *</label><select id="tipo" required><option value="">Selecione...</option><option value="Ambulância">Ambulância</option><option value="Bombeiros">Bombeiros</option><option value="Polícia">Polícia</option></select></div>
            <div class="form-group"><label>Telefone *</label><input type="tel" id="telefone" required></div>
            <div class="form-group"><label>Disponibilidade</label><input type="text" id="disponibilidade" value="24/7"></div>
        `;
    }
}

async function editarItem(tipo, id) {
    tipoAtual = tipo;
    idAtual = id;
    var endpoint = tipo === 'hospital' ? '/hospitais' : tipo === 'centro' ? '/centros' : tipo === 'farmacia' ? '/farmacias' : '/emergencias';
    try {
        var item = await apiRequest(endpoint + '/' + id);
        var titulos = { 'hospital': 'Editar Hospital', 'centro': 'Editar Centro de Saúde', 'farmacia': 'Editar Farmácia', 'emergencia': 'Editar Contato de Emergência' };
        document.getElementById('tituloModal').textContent = titulos[tipo];
        mostrarCamposFormulario(tipo);
        document.getElementById('nome').value = item.nome;
        
        if (tipo !== 'emergencia') {
            if (document.getElementById('endereco')) document.getElementById('endereco').value = item.endereco || '';
            if (document.getElementById('telefone')) document.getElementById('telefone').value = item.telefone || '';
            if (document.getElementById('horario')) document.getElementById('horario').value = item.horario || '';
            if (document.getElementById('latitude')) { document.getElementById('latitude').value = item.latitude || ''; document.getElementById('longitude').value = item.longitude || ''; }
            if ((tipo === 'hospital' || tipo === 'centro') && document.getElementById('servicos')) document.getElementById('servicos').value = item.servicos || '';
            if (tipo === 'farmacia' && document.getElementById('plantao')) document.getElementById('plantao').value = item.plantao ? 'true' : 'false';
        } else {
            document.getElementById('telefone').value = item.telefone;
            if (document.getElementById('tipo')) document.getElementById('tipo').value = item.tipo;
            if (document.getElementById('disponibilidade')) document.getElementById('disponibilidade').value = item.disponibilidade;
        }
        document.getElementById('modal').classList.add('active');
    } catch (error) {
        alert('Erro ao carregar item');
    }
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('formularioItem').reset();
    tipoAtual = ''; idAtual = null;
}

document.getElementById('formularioItem').addEventListener('submit', async function (e) {
    e.preventDefault();
    var endpoint = tipoAtual === 'hospital' ? '/hospitais' : tipoAtual === 'centro' ? '/centros' : tipoAtual === 'farmacia' ? '/farmacias' : '/emergencias';
    var dadosFormulario = { nome: document.getElementById('nome').value };

    if (tipoAtual === 'hospital' || tipoAtual === 'centro') {
        dadosFormulario.endereco = document.getElementById('endereco').value || '';
        dadosFormulario.telefone = document.getElementById('telefone').value || '';
        dadosFormulario.horario = document.getElementById('horario').value || '';
        dadosFormulario.servicos = document.getElementById('servicos') ? document.getElementById('servicos').value : '';
        var lat = document.getElementById('latitude'), lng = document.getElementById('longitude');
        if (lat && lat.value) { dadosFormulario.latitude = parseFloat(lat.value); dadosFormulario.longitude = parseFloat(lng.value); }
    } else if (tipoAtual === 'farmacia') {
        dadosFormulario.endereco = document.getElementById('endereco').value || '';
        dadosFormulario.telefone = document.getElementById('telefone').value || '';
        dadosFormulario.horario = document.getElementById('horario').value || '';
        dadosFormulario.plantao = document.getElementById('plantao').value === 'true';
        var lat = document.getElementById('latitude'), lng = document.getElementById('longitude');
        if (lat && lat.value) { dadosFormulario.latitude = parseFloat(lat.value); dadosFormulario.longitude = parseFloat(lng.value); }
    } else if (tipoAtual === 'emergencia') {
        dadosFormulario.tipo = document.getElementById('tipo').value;
        dadosFormulario.telefone = document.getElementById('telefone').value;
        dadosFormulario.disponibilidade = document.getElementById('disponibilidade').value;
    }

    try {
        if (idAtual) {
            await apiRequest(endpoint + '/' + idAtual, 'PUT', dadosFormulario, token);
            alert('Item atualizado com sucesso!');
        } else {
            await apiRequest(endpoint, 'POST', dadosFormulario, token);
            alert('Item adicionado com sucesso!');
        }
        fecharModal();
        await carregarTabelas();
        await atualizarContadores();
    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
});

// ==================== DELETAR ITEM (CORRIGIDO) ====================
async function deletarItem(tipo, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    var endpoint = tipo === 'hospital' ? '/hospitais' : tipo === 'centro' ? '/centros' : tipo === 'farmacia' ? '/farmacias' : '/emergencias';
    try {
        const tokenAtual = getAuthToken();
        await apiRequest(endpoint + '/' + id, 'DELETE', null, tokenAtual);
        alert('Item excluído com sucesso!');
        await carregarTabelas();
        await atualizarContadores();
    } catch (error) {
        alert('Erro ao excluir item: ' + error.message);
    }
}

// ==================== EVENTOS E INICIALIZAÇÃO ====================
document.getElementById('modal').addEventListener('click', function (e) { if (e.target === this) fecharModal(); });
document.addEventListener('click', function(e) { var modal = document.getElementById('modalPublicacao'); if (modal && e.target === modal) fecharModalPublicacao(); });

document.addEventListener('DOMContentLoaded', function() {
    var formPublicacao = document.getElementById('formularioPublicacao');
    if (formPublicacao) formPublicacao.addEventListener('submit', salvarPublicacao);
});

// Tornar funções globais para os botões HTML
window.buscarCoordenadasPorEndereco = buscarCoordenadasPorEndereco;
window.abrirMapaParaSelecionar = abrirMapaParaSelecionar;
window.abrirModalResposta = abrirModalResposta;
window.fecharModalResposta = fecharModalResposta;
window.enviarResposta = enviarResposta;
window.deletarAvaliacao = deletarAvaliacao;
window.abrirModalPublicacao = abrirModalPublicacao;
window.fecharModalPublicacao = fecharModalPublicacao;
window.carregarPublicacoesAdmin = carregarPublicacoesAdmin;
window.editarPublicacao = editarPublicacao;
window.salvarPublicacao = salvarPublicacao;
window.togglePublicacao = togglePublicacao;
window.deletarPublicacao = deletarPublicacao;
window.mudarAba = mudarAba;

// Iniciar painel
if (checkAuth()) {
    carregarInfoUsuario();
    atualizarContadores();
    carregarTabelas();
    setTimeout(() => carregarAvaliacoesAdmin(), 500);
}
