// admin-produtos.js - Versão com API

// ==================== VERIFICAÇÃO DE AUTENTICAÇÃO ====================
(function verificarAutenticacao() {
    let sessao = getFarmaciaSession();
    
    if (!sessao) {
        window.location.href = 'login-farmacia.html';
        return;
    }
    
    let agora = Date.now();
    let tempoSessao = agora - sessao.timestamp;
    let tempoLimite = 8 * 60 * 60 * 1000;
    
    if (tempoSessao > tempoLimite) {
        clearFarmaciaSession();
        window.location.href = 'login-farmacia.html';
        return;
    }
    
    window.sessaoAtual = sessao;
})();

// ==================== VARIÁVEIS GLOBAIS ====================
let produtos = [];
let farmaciaAtual = null;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function () {
    carregarDadosIniciais();
});

async function carregarDadosIniciais() {
    try {
        const farmacias = await apiRequest('/farmacias');
        farmaciaAtual = farmacias.find(f => f.id == window.sessaoAtual.farmaciaId);
        
        if (!farmaciaAtual) {
            mostrarToast('Erro: Farmácia não encontrada', 'erro');
            return;
        }
        
        mostrarInfoFarmacia();
        await carregarProdutosDaFarmacia();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarToast('Erro ao carregar dados do servidor', 'erro');
    }
}

function mostrarInfoFarmacia() {
    let header = document.getElementById('farmaciaInfoHeader');
    let plantaoTexto = farmaciaAtual.plantao ? '🟢 Plantão 24h' : ' Horário Comercial';
    let plantaoCor = farmaciaAtual.plantao ? '#dbeafe' : '#d1fae5';
    let plantaoCorTexto = farmaciaAtual.plantao ? '#1e40af' : '#047857';
    
    header.innerHTML = `
        <div>
            <h3> ${farmaciaAtual.nome}</h3>
            <p> ${farmaciaAtual.endereco || 'Endereço não informado'} | 📞 ${farmaciaAtual.telefone || 'Telefone não informado'}</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <span style="background: ${plantaoCor}; color: ${plantaoCorTexto}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                ${plantaoTexto}
            </span>
            <button class="btn-logout" onclick="fazerLogout()"> Sair</button>
        </div>
    `;
}

async function carregarProdutosDaFarmacia() {
    try {
        produtos = await apiRequest(`/produtos?farmaciaId=${window.sessaoAtual.farmaciaId}`);
        renderizarTabelaProdutos(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('produtosContainer').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar produtos</p>
            </div>
        `;
    }
}

function renderizarTabelaProdutos(produtosLista) {
    let container = document.getElementById('produtosContainer');
    let filtroCategoria = document.getElementById('filtroCategoria').value;
    
    if (filtroCategoria) {
        produtosLista = produtosLista.filter(p => p.categoria === filtroCategoria);
    }
    
    if (produtosLista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span style="font-size: 48px;"></span>
                <p>Nenhum produto cadastrado</p>
                <small>Clique em "Adicionar Novo Produto" para começar</small>
            </div>
        `;
        return;
    }
    
    let tabela = `
        <table class="tabela-produtos">
            <thead>
                <tr><th>Produto</th><th>Categoria</th><th>Preço (MZN)</th><th>Stock</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
    `;
    
    for (let p of produtosLista) {
        let statusClass = 'status-disponivel';
        let statusText = 'Disponível';
        
        if (p.quantidade <= 0) {
            statusClass = 'status-indisponivel';
            statusText = 'Indisponível';
        } else if (p.quantidade < 10) {
            statusClass = 'status-baixo';
            statusText = 'Stock Baixo';
        }
        
        tabela += `
            <tr>
                <td><strong>${p.nome}</strong><br><small>${p.fabricante || ''}</small></td>
                <td>${p.categoria}</td>
                <td><strong>${p.preco} MZN</strong></td>
                <td>${p.quantidade} unid.</td>
                <td><span class="status-stock ${statusClass}">${statusText}</span></td>
                <td class="acoes-produto">
                    <button class="btn-editar" onclick="editarProduto(${p.id})"> Editar</button>
                    <button class="btn-excluir" onclick="excluirProduto(${p.id})"> Excluir</button>
                </td>
            </tr>
        `;
    }
    
    tabela += `</tbody></table>`;
    container.innerHTML = tabela;
}

function filtrarProdutos() {
    renderizarTabelaProdutos(produtos);
}

// ==================== FUNÇÕES DE FORMULÁRIO ====================
function mostrarFormularioProduto() {
    document.getElementById('formTitulo').innerHTML = '➕ Adicionar Novo Produto';
    document.getElementById('produtoId').value = '';
    document.getElementById('farmaciaId').value = window.sessaoAtual.farmaciaId;
    document.getElementById('produtoNome').value = '';
    document.getElementById('produtoCategoria').value = '';
    document.getElementById('produtoPreco').value = '';
    document.getElementById('produtoQuantidade').value = '';
    document.getElementById('produtoFabricante').value = '';
    document.getElementById('produtoValidade').value = '';
    document.getElementById('produtoDescricao').value = '';
    
    document.getElementById('formProduto').classList.add('ativo');
    document.getElementById('formProduto').scrollIntoView({ behavior: 'smooth' });
}

function fecharFormularioProduto() {
    document.getElementById('formProduto').classList.remove('ativo');
}

function editarProduto(id) {
    let produto = produtos.find(p => p.id == id);
    if (!produto) return;
    
    document.getElementById('formTitulo').innerHTML = ' Editar Produto';
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('farmaciaId').value = produto.farmaciaId;
    document.getElementById('produtoNome').value = produto.nome || '';
    document.getElementById('produtoCategoria').value = produto.categoria || '';
    document.getElementById('produtoPreco').value = produto.preco || '';
    document.getElementById('produtoQuantidade').value = produto.quantidade || '';
    document.getElementById('produtoFabricante').value = produto.fabricante || '';
    document.getElementById('produtoValidade').value = produto.validade || '';
    document.getElementById('produtoDescricao').value = produto.descricao || '';
    
    document.getElementById('formProduto').classList.add('ativo');
    document.getElementById('formProduto').scrollIntoView({ behavior: 'smooth' });
}

// ==================== FUNÇÕES CRUD ====================
async function salvarProduto() {
    let nome = document.getElementById('produtoNome').value.trim();
    let categoria = document.getElementById('produtoCategoria').value;
    let preco = document.getElementById('produtoPreco').value;
    let quantidade = document.getElementById('produtoQuantidade').value;
    let farmaciaId = document.getElementById('farmaciaId').value;
    
    if (!nome) {
        mostrarToast('Por favor, insira o nome do produto', 'erro');
        return;
    }
    
    if (!categoria) {
        mostrarToast('Por favor, selecione uma categoria', 'erro');
        return;
    }
    
    if (!preco || preco <= 0) {
        mostrarToast('Por favor, insira um preço válido', 'erro');
        return;
    }
    
    if (!quantidade || quantidade < 0) {
        mostrarToast('Por favor, insira uma quantidade válida', 'erro');
        return;
    }
    
    let produtoId = document.getElementById('produtoId').value;
    
    let produto = {
        farmaciaId: parseInt(farmaciaId),
        nome: nome,
        categoria: categoria,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade),
        fabricante: document.getElementById('produtoFabricante').value.trim(),
        validade: document.getElementById('produtoValidade').value,
        descricao: document.getElementById('produtoDescricao').value.trim()
    };
    
    try {
        if (produtoId) {
            await apiRequest(`/produtos/${produtoId}`, 'PUT', produto, getAuthToken());
            mostrarToast('Produto atualizado com sucesso!');
        } else {
            await apiRequest('/produtos', 'POST', produto, getAuthToken());
            mostrarToast('Produto adicionado com sucesso!');
        }
        
        fecharFormularioProduto();
        await carregarProdutosDaFarmacia();
    } catch (error) {
        mostrarToast('Erro ao salvar produto: ' + error.message, 'erro');
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        await apiRequest(`/produtos/${id}`, 'DELETE', null, getAuthToken());
        mostrarToast('Produto excluído com sucesso!');
        await carregarProdutosDaFarmacia();
    } catch (error) {
        mostrarToast('Erro ao excluir produto', 'erro');
    }
}

// ==================== FUNÇÕES AUXILIARES ====================
function fazerLogout() {
    clearFarmaciaSession();
    window.location.href = 'login-farmacia.html';
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    let toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = 'toast mostrar';
    if (tipo === 'erro') toast.classList.add('erro');
    
    setTimeout(() => toast.classList.remove('mostrar'), 3000);
}

// Exportar funções
window.mostrarFormularioProduto = mostrarFormularioProduto;
window.fecharFormularioProduto = fecharFormularioProduto;
window.salvarProduto = salvarProduto;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.filtrarProdutos = filtrarProdutos;
window.fazerLogout = fazerLogout;