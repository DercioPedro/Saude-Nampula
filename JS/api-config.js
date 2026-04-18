// api-config.js - Configuração para desenvolvimento e produção

// Detectar automaticamente se está em produção ou desenvolvimento
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// URL da API - muda automaticamente conforme o ambiente
const API_BASE_URL = isProduction 
    ? 'https://saude-nampula-api.onrender.com/api'  // 👈 SUBSTITUA PELA URL DO RENDER
    : 'http://localhost:5000/api';

console.log(`🌐 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`📡 API URL: ${API_BASE_URL}`);

// Função para fazer requisições à API
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        method: method,
        headers: headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }
    
    console.log(`📡 ${method} ${API_BASE_URL}${endpoint}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        console.log(`✅ Resposta recebida:`, result);
        return result;
    } catch (error) {
        console.error('❌ API Error:', error);
        
        // Mostrar mensagem amigável para o usuário
        if (error.message === 'Failed to fetch') {
            showConnectionError();
        }
        
        throw error;
    }
}

// Salvar token de autenticação
function setAuthToken(token) {
    if (token) {
        localStorage.setItem('api_token', token);
    } else {
        localStorage.removeItem('api_token');
    }
}

function getAuthToken() {
    return localStorage.getItem('api_token');
}

// Salvar sessão da farmácia
function setFarmaciaSession(farmacia) {
    localStorage.setItem('sessaoFarmacia', JSON.stringify({
        farmaciaId: farmacia.id,
        farmaciaNome: farmacia.nome,
        timestamp: Date.now()
    }));
}

function getFarmaciaSession() {
    let sessao = localStorage.getItem('sessaoFarmacia');
    return sessao ? JSON.parse(sessao) : null;
}

function clearFarmaciaSession() {
    localStorage.removeItem('sessaoFarmacia');
    localStorage.removeItem('api_token');
}

// Verificar se o servidor está online
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/estatisticas`);
        return response.ok;
    } catch (error) {
        console.warn('Servidor offline:', error);
        return false;
    }
}

// Mostrar mensagem de erro de conexão
function showConnectionError() {
    // Verificar se já existe uma mensagem
    if (document.querySelector('.connection-error')) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'connection-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        cursor: pointer;
        font-size: 14px;
        max-width: 90%;
        text-align: center;
    `;
    
    const isProduction = window.location.hostname !== 'localhost';
    const message = isProduction 
        ? '⚠️ Erro de conexão com o servidor. Tente novamente mais tarde.'
        : '⚠️ Servidor offline. Execute "python app.py" no terminal.';
    
    errorDiv.innerHTML = `${message}<br><small style="opacity:0.8;">Clique para fechar</small>`;
    errorDiv.onclick = () => errorDiv.remove();
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) errorDiv.remove();
    }, 10000);
}
