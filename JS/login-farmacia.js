// login-farmacia.js - Versão com API

let farmacias = [];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function () {
    carregarFarmacias();
});

async function carregarFarmacias() {
    try {
        farmacias = await apiRequest('/farmacias');
        atualizarSelectFarmacias('farmaciaSelect');
        atualizarSelectFarmacias('novaFarmaciaSelect');
    } catch (error) {
        console.error('Erro ao carregar farmácias:', error);
        mostrarErro('Erro ao carregar farmácias. Verifique se o servidor está rodando.');
    }
}

function atualizarSelectFarmacias(selectId) {
    let select = document.getElementById(selectId);
    if (!select) return;
    
    if (farmacias.length === 0) {
        select.innerHTML = '<option value="">Nenhuma farmácia disponível</option>';
        return;
    }
    
    let options = '<option value="">Selecione uma farmácia</option>';
    for (let i = 0; i < farmacias.length; i++) {
        let temCredencial = farmacias[i].senha_hash ? true : false;
        
        if (selectId === 'novaFarmaciaSelect') {
            if (!temCredencial) {
                options += `<option value="${farmacias[i].id}">${farmacias[i].nome}</option>`;
            }
        } else {
            options += `<option value="${farmacias[i].id}">${farmacias[i].nome}</option>`;
        }
    }
    select.innerHTML = options;
}

// ==================== FUNÇÕES DE ABA ====================
function mudarAba(aba) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('ativo'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('ativo'));
    
    if (aba === 'login') {
        document.querySelector('.tab').classList.add('ativo');
        document.getElementById('abaLogin').classList.add('ativo');
    } else {
        document.querySelectorAll('.tab')[1].classList.add('ativo');
        document.getElementById('abaPrimeiroAcesso').classList.add('ativo');
    }
}

// ==================== FUNÇÕES DE LOGIN ====================
async function fazerLogin() {
    let farmaciaId = document.getElementById('farmaciaSelect').value;
    let senha = document.getElementById('senha').value;
    
    if (!farmaciaId) {
        mostrarErro('Selecione sua farmácia');
        return;
    }
    
    if (!senha) {
        mostrarErro('Digite sua senha');
        return;
    }
    
    try {
        const result = await apiRequest('/farmacias/login', 'POST', {
            farmaciaId: parseInt(farmaciaId),
            senha: senha
        });
        
        if (result.success) {
            setAuthToken(result.token);
            setFarmaciaSession(result.farmacia);
            
            mostrarSucesso('Login realizado com sucesso! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = `admin-produtos.html?farmacia=${encodeURIComponent(result.farmacia.nome)}&id=${result.farmacia.id}`;
            }, 1500);
        }
    } catch (error) {
        mostrarErro(error.message);
    }
}

// ==================== FUNÇÕES DE PRIMEIRO ACESSO ====================
let farmaciaSelecionadaPrimeiroAcesso = null;

function mostrarModalPrimeiroAcesso() {
    let farmaciaId = document.getElementById('novaFarmaciaSelect').value;
    
    if (!farmaciaId) {
        mostrarErro('Selecione sua farmácia');
        return;
    }
    
    let farmacia = farmacias.find(f => f.id == farmaciaId);
    if (!farmacia) return;
    
    farmaciaSelecionadaPrimeiroAcesso = farmaciaId;
    
    document.getElementById('infoFarmaciaEscolhida').innerHTML = `
        <strong>${farmacia.nome}</strong><br>
        <small style="font-weight: normal;">${farmacia.endereco || ''}</small>
    `;
    
    document.getElementById('modalPrimeiroAcesso').style.display = 'block';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
}

function fecharModalPrimeiroAcesso() {
    document.getElementById('modalPrimeiroAcesso').style.display = 'none';
}

function verificarForcaSenha() {
    let senha = document.getElementById('novaSenha').value;
    let spans = document.querySelectorAll('#forcaSenha span');
    
    spans.forEach(span => span.style.background = '#e5e7eb');
    if (senha.length === 0) return;
    
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/\d/.test(senha)) forca++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/[!@#$%^&*]/.test(senha)) forca++;
    
    if (forca >= 3) {
        spans[0].style.background = '#059669';
        spans[1].style.background = '#059669';
        spans[2].style.background = '#059669';
    } else if (forca >= 2) {
        spans[0].style.background = '#f59e0b';
        spans[1].style.background = '#f59e0b';
    } else if (forca >= 1) {
        spans[0].style.background = '#ef4444';
    }
}

async function criarSenhaPrimeiroAcesso() {
    let senha = document.getElementById('novaSenha').value;
    let confirmarSenha = document.getElementById('confirmarSenha').value;
    
    if (!senha || senha.length < 4) {
        mostrarErroModal('A senha deve ter no mínimo 4 caracteres');
        return;
    }
    
    if (senha !== confirmarSenha) {
        mostrarErroModal('As senhas não coincidem');
        return;
    }
    
    if (!farmaciaSelecionadaPrimeiroAcesso) {
        mostrarErroModal('Erro: Farmácia não selecionada');
        return;
    }
    
    try {
        const result = await apiRequest(`/farmacias/${farmaciaSelecionadaPrimeiroAcesso}/senha`, 'POST', {
            senha: senha
        });
        
        if (result.success) {
            setAuthToken(result.token);
            setFarmaciaSession(result.farmacia);
            
            fecharModalPrimeiroAcesso();
            mostrarSucesso('Senha criada com sucesso! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = `admin-produtos.html?farmacia=${encodeURIComponent(result.farmacia.nome)}&id=${result.farmacia.id}`;
            }, 1500);
        }
    } catch (error) {
        mostrarErroModal(error.message);
    }
}

// ==================== FUNÇÕES AUXILIARES ====================
function mostrarErro(mensagem) {
    let erroDiv = document.getElementById('erroMensagem');
    erroDiv.textContent = mensagem;
    erroDiv.classList.add('mostrar');
    setTimeout(() => erroDiv.classList.remove('mostrar'), 3000);
}

function mostrarErroModal(mensagem) {
    let erroDiv = document.getElementById('modalErro');
    erroDiv.textContent = mensagem;
    erroDiv.classList.add('mostrar');
    setTimeout(() => erroDiv.classList.remove('mostrar'), 3000);
}

function mostrarSucesso(mensagem) {
    let sucessoDiv = document.getElementById('sucessoMensagem');
    sucessoDiv.textContent = mensagem;
    sucessoDiv.classList.add('mostrar');
    setTimeout(() => sucessoDiv.classList.remove('mostrar'), 3000);
}

window.onclick = function (event) {
    let modal = document.getElementById('modalPrimeiroAcesso');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Exportar funções
window.mudarAba = mudarAba;
window.fazerLogin = fazerLogin;
window.mostrarModalPrimeiroAcesso = mostrarModalPrimeiroAcesso;
window.fecharModalPrimeiroAcesso = fecharModalPrimeiroAcesso;
window.verificarForcaSenha = verificarForcaSenha;
window.criarSenhaPrimeiroAcesso = criarSenhaPrimeiroAcesso;