// visitantes.js - Controle de visitantes

class ControleVisitantes {
    constructor() {
        this.sessaoId = null;
        this.paginaAtual = null;
    }
    
    init() {
        this.gerarSessaoId();
        this.obterPaginaAtual();
        this.registrarVisita();
    }
    
    gerarSessaoId() {
        let sessao = localStorage.getItem('sessao_visitante');
        if (!sessao) {
            sessao = this.gerarIdUnico();
            localStorage.setItem('sessao_visitante', sessao);
        }
        this.sessaoId = sessao;
    }
    
    gerarIdUnico() {
        return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
            return Math.floor(Math.random() * 16).toString(16);
        });
    }
    
    obterPaginaAtual() {
        const path = window.location.pathname;
        this.paginaAtual = path.split('/').pop() || 'home.html';
    }
    
    async registrarVisita() {
        try {
            await apiRequest('/visitantes/registrar', 'POST', {
                sessao_id: this.sessaoId,
                pagina: this.paginaAtual
            });
            console.log('Visita registrada:', this.paginaAtual);
        } catch (error) {
            console.error('Erro ao registrar visita:', error);
        }
    }
}

// Inicializar quando a página carregar
const controleVisitantes = new ControleVisitantes();

document.addEventListener('DOMContentLoaded', () => {
    controleVisitantes.init();
});