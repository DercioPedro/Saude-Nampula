// darkmode.js - Sistema de Modo Escuro

// Verificar preferência salva ou do sistema
function getDarkModePreference() {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
        return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Aplicar modo escuro
function aplicarDarkMode(ativar) {
    if (ativar) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        document.querySelector('.dark-mode-toggle').innerHTML = '☀️ Modo Claro';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        document.querySelector('.dark-mode-toggle').innerHTML = '🌙 Modo Escuro';
    }
}

// Criar botão de toggle
function criarBotaoDarkMode() {
    const btn = document.createElement('button');
    btn.className = 'dark-mode-toggle';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #7c3aed;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 30px;
        cursor: pointer;
        z-index: 999;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s;
    `;
    
    const isDark = getDarkModePreference();
    btn.innerHTML = isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    
    btn.onclick = () => {
        const isActive = document.body.classList.contains('dark-mode');
        aplicarDarkMode(!isActive);
    };
    
    document.body.appendChild(btn);
    
    // Aplicar modo salvo
    aplicarDarkMode(isDark);
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    criarBotaoDarkMode();
});
