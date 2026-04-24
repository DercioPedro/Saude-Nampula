// darkmode.js - Sistema de Modo Escuro

function getDarkModePreference() {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
        return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function aplicarDarkMode(ativar) {
    if (ativar) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        const btn = document.querySelector('.dark-mode-toggle');
        if (btn) btn.innerHTML = '☀️ Modo Claro';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        const btn = document.querySelector('.dark-mode-toggle');
        if (btn) btn.innerHTML = '🌙 Modo Escuro';
    }
}

function criarBotaoDarkMode() {
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const btn = document.createElement('button');
    btn.className = 'dark-mode-toggle';
    
    const isDark = getDarkModePreference();
    btn.innerHTML = isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    
    btn.onclick = () => {
        const isActive = document.body.classList.contains('dark-mode');
        aplicarDarkMode(!isActive);
    };
    
    document.body.appendChild(btn);
    aplicarDarkMode(isDark);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarBotaoDarkMode);
} else {
    criarBotaoDarkMode();
}
