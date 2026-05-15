// loading.js - Sistema de delay e loading

class LoadingManager {
    constructor() {
        this.loadingOverlay = null;
        this.minLoadingTime = 800; // Tempo mínimo de loading em ms (0.8 segundos)
        this.maxLoadingTime = 3000; // Tempo máximo de loading em ms (3 segundos)
        this.startTime = null;
        this.isLoading = false;
    }
    
    // Criar o overlay de loading
    createLoadingOverlay() {
        // Verificar se já existe
        if (document.querySelector('.loading-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-logo">
                    <img src="/img/monitor.png" alt="Saúde Nampula">
                </div>
                <div class="loading-text">
                    <h3>Saúde Nampula</h3>
                    <p>Carregando informações de saúde...</p>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="loading-tip">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text">Sempre leve a prescrição médica ao comprar medicamentos</span>
                </div>
            </div>
        `;
        
        // Estilos do overlay
        overlay.style.cssText = `
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
            opacity: 1;
        `;
        
        // Estilos do conteúdo
        const style = document.createElement('style');
        style.textContent = `
            .loading-content {
                text-align: center;
                animation: fadeInUp 0.5s ease;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 30px;
            }
            
            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 4px solid transparent;
                border-radius: 50%;
                animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
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
            
            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            
            .loading-logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: white;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                animation: pulse 1.5s ease infinite;
            }
            
            .loading-logo img {
                width: 50px;
                height: 50px;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            .loading-text h3 {
                color: white;
                font-size: 24px;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .loading-text p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }
            
            .loading-progress {
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                margin: 30px auto 0;
                overflow: hidden;
            }
            
            .progress-bar {
                width: 0%;
                height: 100%;
                background: white;
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .loading-tip {
                margin-top: 40px;
                padding: 12px 20px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 30px;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: white;
                backdrop-filter: blur(5px);
            }
            
            .tip-icon {
                font-size: 18px;
            }
            
            @media (max-width: 768px) {
                .loading-spinner {
                    width: 60px;
                    height: 60px;
                }
                
                .loading-logo {
                    width: 60px;
                    height: 60px;
                }
                
                .loading-logo img {
                    width: 35px;
                    height: 35px;
                }
                
                .loading-text h3 {
                    font-size: 20px;
                }
                
                .loading-progress {
                    width: 150px;
                }
                
                .loading-tip {
                    font-size: 11px;
                    max-width: 280px;
                    text-align: center;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        this.loadingOverlay = overlay;
        
        // Animar a barra de progresso
        this.animateProgressBar();
        
        return overlay;
    }
    
    // Animar a barra de progresso
    animateProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;
        
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            } else {
                width += Math.random() * 10;
                if (width > 90) width = 90;
                progressBar.style.width = width + '%';
            }
        }, 100);
    }
    
    // Completar a barra de progresso
    completeProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }
    
    // Esconder o loading
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
            }, 300);
        });
    }
    
    // Mostrar loading e esperar um tempo mínimo
    async showLoading(minTime = null, maxTime = null) {
        this.startTime = Date.now();
        this.isLoading = true;
        
        const min = minTime || this.minLoadingTime;
        const max = maxTime || this.maxLoadingTime;
        
        this.createLoadingOverlay();
        
        // Garantir tempo mínimo de loading
        const minPromise = new Promise(resolve => setTimeout(resolve, min));
        
        // Timeout máximo
        const maxPromise = new Promise(resolve => setTimeout(resolve, max));
        
        await Promise.race([minPromise, maxPromise]);
        
        this.isLoading = false;
        return this.hideLoading();
    }
    
    // Atualizar as dicas (tips) aleatoriamente
    updateTips() {
        const tips = [
            'Sempre leve a prescrição médica ao comprar medicamentos',
            'Mantenha suas vacinas em dia',
            'Em caso de emergência, ligue 119',
            'Beba bastante água diariamente',
            'Faça exercícios físicos regularmente',
            'Durma pelo menos 8 horas por noite',
            'Evite a automedicação',
            'Visite o médico regularmente para check-up',
            'Lave as mãos frequentemente',
            'Mantenha uma alimentação saudável'
        ];
        
        const tipElement = document.querySelector('.tip-text');
        if (tipElement) {
            let currentTip = 0;
            setInterval(() => {
                currentTip = (currentTip + 1) % tips.length;
                tipElement.textContent = tips[currentTip];
                tipElement.style.animation = 'fadeInUp 0.3s ease';
                setTimeout(() => {
                    tipElement.style.animation = '';
                }, 300);
            }, 3000);
        }
    }
}

// Criar instância global
const loadingManager = new LoadingManager();

// Função para inicializar o loading na página
async function initPageWithLoading() {
    // Mostrar loading
    await loadingManager.showLoading(800, 3000);
    
    // Atualizar dicas
    loadingManager.updateTips();
    
    // Disparar evento que a página carregou
    document.dispatchEvent(new Event('pageLoaded'));
}

// Detectar quando a página está carregando
let hasLoaded = false;

window.addEventListener('load', function() {
    if (!hasLoaded) {
        hasLoaded = true;
        // Pequeno delay para garantir que tudo carregou
        setTimeout(() => {
            if (loadingManager.isLoading) {
                loadingManager.hideLoading();
            }
        }, 500);
    }
});

// Se a página já estiver carregada
if (document.readyState === 'complete') {
    if (!hasLoaded) {
        hasLoaded = true;
        setTimeout(() => {
            if (loadingManager.isLoading) {
                loadingManager.hideLoading();
            }
        }, 500);
    }
}

// Expor funções globalmente
window.loadingManager = loadingManager;
window.initPageWithLoading = initPageWithLoading;
