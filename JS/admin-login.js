// admin-login.js - Versão com API

// admin-login.js
const loginForm = document.getElementById('loginForm');
const alertDiv = document.getElementById('alert');

function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    setTimeout(() => alertDiv.style.display = 'none', 3000);
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await apiRequest('/admin/login', 'POST', { username, password });
        
        if (result.success) {
            setAuthToken(result.token);
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', result.username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            showAlert('Login realizado com sucesso! Redirecionando...', 'success');
            setTimeout(() => window.location.href = 'admin-panel.html', 1000);
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Usuário ou senha incorretos!', 'error');
        document.getElementById('password').value = '';
    }
});

if (localStorage.getItem('adminLoggedIn') === 'true' && getAuthToken()) {
    window.location.href = 'admin-panel.html';
}