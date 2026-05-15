// loading.js - Sistema de loading com tempo ajustável e responsivo

class LoadingManager {
    constructor() {
        this.loadingOverlay = null;
        this.minLoadingTime = 1500; // 1.5 segundos (mais agradável)
        this.maxLoadingTime = 2500; // 2.5 segundos máximo
        this.startTime = null;
        this.isLoading = false;
    }
    
    createLoadingOverlay() {
        if (document.querySelector('.loading-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        // HTML responsivo
        overlay.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner-wrapper">
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                        <div class="spinner-ring"></div>
                    </div>
                </div>
                
                <div class="loading-logo-wrapper">
                    <div class="loading-logo">
                        <img src="/img/monitor.png" alt="Saúde Nampula" class="logo-img">
                    </div>
                </div>
                
                <div class="loading-text-wrapper">
                    <h2 class="loading-title">Saúde Nampula</h2>
                    <p class="loading-subtitle">Plataforma de Saúde Comunitária</p>
                </div>
                
                <div class="loading-progress-wrapper">
                    <div class="loading-progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
                
                <div class="loading-tip-wrapper">
                    <div class="loading-tip">
                        <span class="tip-emoji">💡</span>
                        <span class="tip-message">Sempre leve a prescrição médica</span>
                    </div>
                </div>
            </div>
        `;
        
        // Estilos CSS responsivos
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.5s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .loading-container {
                text-align: center;
                padding: 20px;
                max-width: 90%;
                width: 400px;
                animation: fadeInScale 0.4s ease;
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Spinner */
            .loading-spinner-wrapper {
                margin-bottom: 30px;
            }
            
            .loading-spinner {
                position: relative;
                width: 70px;
                height: 70px;
                margin: 0 auto;
            }
            
            @media (max-width: 768px) {
                .loading-spinner {
                    width: 55px;
                    height: 55px;
                }
            }
            
            @media (max-width: 480px) {
                .loading-spinner {
                    width: 45px;
                    height: 45px;
                }
            }
            
            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid transparent;
                border-radius: 50%;
                animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }
            
            .spinner-ring:nth-child(1) {
                border-top-color: rgba(255, 255, 255, 0.9);
                animation-delay: -0.45s;
            }
            
            .spinner-ring:nth-child(2) {
                border-right-color: rgba(255, 255, 255, 0.6);
                animation-delay: -0.3s;
            }
            
            .spinner-ring:nth-child(3) {
                border-bottom-color: rgba(255, 255, 255, 0.3);
                animation-delay: -0.15s;
            }
            
            @keyframes spinRing {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Logo */
            .loading-logo-wrapper {
                margin-bottom: 20px;
            }
            
            .loading-logo {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                animation: pulseLogo 1.5s ease infinite;
            }
            
            @keyframes pulseLogo {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @media (max-width: 768px) {
                .loading-logo {
                    width: 65px;
                    height: 65px;
                    border-radius: 16px;
                }
            }
            
            @media (max-width: 480px) {
                .loading-logo {
                    width: 55px;
                    height: 55px;
                    border-radius: 14px;
                }
            }
            
            .logo-img {
                width: 50px;
                height: 50px;
            }
            
            @media (max-width: 768px) {
                .logo-img {
                    width: 40px;
                    height: 40px;
                }
            }
            
            @media (max-width: 480px) {
                .logo-img {
                    width: 32px;
                    height: 32px;
                }
            }
            
            /* Textos */
            .loading-text-wrapper {
                margin-bottom: 30px;
            }
            
            .loading-title {
                color: white;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }
            
            .loading-subtitle {
                color: rgba(255, 255, 255, 0.85);
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .loading-title {
                    font-size: 24px;
                }
                .loading-subtitle {
                    font-size: 12px;
                }
            }
            
            @media (max-width: 480px) {
                .loading-title {
                    font-size: 20px;
                }
                .loading-subtitle {
                    font-size: 11px;
                }
            }
            
            /* Barra de progresso */
            .loading-progress-wrapper {
                margin-bottom: 30px;
                padding: 0 20px;
            }
            
            .loading-progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                width: 0%;
                height: 100%;
                background: white;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            /* Dica */
            .loading-tip-wrapper {
                padding: 0 10px;
            }
            
            .loading-tip {
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(8px);
                padding: 12px 20px;
                border-radius: 40px;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: white;
                max-width: 100%;
            }
            
            .tip-emoji {
                font-size: 18px;
            }
            
            .tip-message {
                white-space: nowrap;
            }
            
            @media (max-width: 600px) {
                .loading-tip {
                    padding: 10px 16px;
                    gap: 8px;
                }
                .tip-emoji {
                    font-size: 14px;
                }
                .tip-message {
                    font-size: 11px;
                    white-space: normal;
                    line-height: 1.4;
                }
            }
            
            @media (max-width: 480px) {
                .loading-tip {
                    padding: 8px 12px;
                }
                .tip-message {
                    font-size: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        this.loadingOverlay = overlay;
        this.animateProgressBar();
        
        return overlay;
    }
    
    animateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (!progressFill) return;
        
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 85) {
                clearInterval(interval);
            } else {
                width += Math.random() * 8;
                if (width > 85) width = 85;
                progressFill.style.width = width + '%';
            }
        }, 120);
    }
    
    completeProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    }
    
    hideLoading() {
        return new Promise((resolve) => {
            if (!this.loadingOverlay) {
                resolve();
                return;
            }
            
            this.completeProgressBar();
            
            setTimeout(() => {
                this.loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (this.loadingOverlay && this.loadingOverlay.parentNode) {
                        this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
                    }
                    resolve();
                }, 500);
            }, 200);
        });
    }
    
    async showLoading(minTime = null, maxTime = null) {
        this.startTime = Date.now();
        this.isLoading = true;
        
        const min = minTime || this.minLoadingTime;
        const max = maxTime || this.maxLoadingTime;
        
        this.createLoadingOverlay();
        
        // Tempo mínimo de loading
        const minPromise = new Promise(resolve => setTimeout(resolve, min));
        
        // Tempo máximo (nunca mais que isso)
        const maxPromise = new Promise(resolve => setTimeout(resolve, max));
        
        await Promise.race([minPromise, maxPromise]);
        
        this.isLoading = false;
        return this.hideLoading();
    }
    
    updateTips() {
        const tips = [
            { emoji: '💊', text: 'Sempre leve a prescrição médica' },
            { emoji: '💉', text: 'Mantenha suas vacinas em dia' },
            { emoji: '🚑', text: 'Emergência? Ligue 119' },
            { emoji: '💧', text: 'Beba água regularmente' },
            { emoji: '🏃', text: 'Pratique exercícios físicos' },
            { emoji: '😴', text: 'Durma pelo menos 8 horas' },
            { emoji: '⚠️', text: 'Evite a automedicação' },
            { emoji: '🩺', text: 'Faça check-ups regulares' },
            { emoji: '🧼', text: 'Lave as mãos frequentemente' },
            { emoji: '🍎', text: 'Mantenha alimentação saudável' }
        ];
        
        const tipEmoji = document.querySelector('.tip-emoji');
        const tipMessage = document.querySelector('.tip-message');
        
        if (tipEmoji && tipMessage) {
            let currentTip = 0;
            setInterval(() => {
                currentTip = (currentTip + 1) % tips.length;
                tipEmoji.textContent = tips[currentTip].emoji;
                tipMessage.textContent = tips[currentTip].text;
            }, 3500);
        }
    }
}

// Instância global
const loadingManager = new LoadingManager();

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadingManager.showLoading(1200, 2500);
    loadingManager.updateTips();
});

// Exportar funções
window.loadingManager = loadingManager;
