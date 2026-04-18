// avaliacoes.js - Versão corrigida (usa API_BASE_URL)

class SistemaAvaliacoes {
    constructor() {
        this.container = null;
        this.notaSelecionada = 0;
        this.tipo = 'site';
        this.tipoId = null;
        // 👇 CORRIGIDO: usa a URL do api-config.js
        this.apiUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';
    }
    
    async init(containerId, tipo = 'site', tipoId = null) {
        this.container = document.getElementById(containerId);
        this.tipo = tipo;
        this.tipoId = tipoId;
        
        if (!this.container) {
            console.error('Container não encontrado:', containerId);
            return;
        }
        
        // console.log('🌐 API URL:', this.apiUrl);
        
        await this.renderizar();
        await this.carregarAvaliacoes();
        await this.carregarEstatisticas();
    }
    
    async renderizar() {
        this.container.innerHTML = `
            <div class="avaliacoes-container">
                <div class="avaliacoes-header">
                    <h3>⭐ Avaliações dos Utilizadores</h3>
                    <div class="avaliacoes-stats" id="avaliacoes-stats">
                        <div class="stats-card">
                            <div class="stats-nota" id="media-nota">0.0</div>
                            <div class="stars-display" id="media-estrelas"></div>
                            <div class="stats-total" id="total-avaliacoes">0 avaliações</div>
                        </div>
                    </div>
                </div>
                
                <div class="avaliacoes-form">
                    <h4>💬 Deixe sua Avaliação</h4>
                    <div class="form-group">
                        <label>Seu Nome *</label>
                        <input type="text" id="avaliacao-nome" placeholder="Digite seu nome" required>
                    </div>
                    <div class="form-group">
                        <label>Seu Email (opcional)</label>
                        <input type="email" id="avaliacao-email" placeholder="email@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label>Sua Nota *</label>
                        <div class="estrelas-input" id="estrelas-input"></div>
                    </div>
                    <div class="form-group">
                        <label>Seu Comentário *</label>
                        <textarea id="avaliacao-comentario" rows="4" placeholder="Compartilhe sua experiência..."></textarea>
                    </div>
                    <button class="btn-enviar-avaliacao" onclick="sistemaAvaliacoes.enviarAvaliacao()">
                        📝 Enviar Avaliação
                    </button>
                </div>
                
                <div class="avaliacoes-lista" id="avaliacoes-lista">
                    <div class="loading">🔄 Carregando avaliações...</div>
                </div>
            </div>
        `;
        
        this.adicionarEstrelas();
    }
    
    adicionarEstrelas() {
        const container = document.getElementById('estrelas-input');
        if (!container) return;
        
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="estrela-input" data-nota="${i}" style="font-size: 32px; cursor: pointer; color: #d1d5db;">☆</span>`;
        }
        container.innerHTML = html;
        
        const estrelas = document.querySelectorAll('.estrela-input');
        estrelas.forEach(estrela => {
            estrela.addEventListener('click', () => {
                this.notaSelecionada = parseInt(estrela.dataset.nota);
                this.atualizarEstrelas();
            });
        });
    }
    
    atualizarEstrelas() {
        const estrelas = document.querySelectorAll('.estrela-input');
        estrelas.forEach((estrela, index) => {
            if (index < this.notaSelecionada) {
                estrela.textContent = '★';
                estrela.style.color = '#fbbf24';
            } else {
                estrela.textContent = '☆';
                estrela.style.color = '#d1d5db';
            }
        });
    }
    
    async carregarAvaliacoes() {
        const listaDiv = document.getElementById('avaliacoes-lista');
        if (!listaDiv) return;
        
        try {
            let url = `${this.apiUrl}/avaliacoes?tipo=${this.tipo}`;
            if (this.tipoId) {
                url += `&tipo_id=${this.tipoId}`;
            }
            
            // console.log('📡 Buscando avaliações:', url);
            const response = await fetch(url);
            const avaliacoes = await response.json();
            
            if (!response.ok) throw new Error(avaliacoes.error);
            
            this.renderizarLista(avaliacoes);
        } catch (error) {
            console.error('Erro:', error);
            listaDiv.innerHTML = `<div class="error">❌ Erro ao carregar avaliações</div>`;
        }
    }
    
    async carregarEstatisticas() {
        try {
            let url = `${this.apiUrl}/avaliacoes/estatisticas?tipo=${this.tipo}`;
            if (this.tipoId) {
                url += `&tipo_id=${this.tipoId}`;
            }
            
            const response = await fetch(url);
            const stats = await response.json();
            
            document.getElementById('media-nota').textContent = stats.media.toFixed(1);
            document.getElementById('total-avaliacoes').textContent = `${stats.total} avaliações`;
            document.getElementById('media-estrelas').innerHTML = this.gerarEstrelasMedia(stats.media);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
    
    gerarEstrelasMedia(nota) {
        let estrelas = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= nota) {
                estrelas += '<span style="color: #fbbf24;">★</span>';
            } else {
                estrelas += '<span style="color: #d1d5db;">☆</span>';
            }
        }
        return estrelas;
    }
    
    renderizarLista(avaliacoes) {
        const container = document.getElementById('avaliacoes-lista');
        
        if (!avaliacoes || avaliacoes.length === 0) {
            container.innerHTML = `<div class="nenhuma-avaliacao">✨ Seja o primeiro a avaliar!</div>`;
            return;
        }
        
        let html = '<h4>📝 Avaliações Recentes</h4>';
        for (const av of avaliacoes) {
            html += `
                <div class="avaliacao-item">
                    <div class="avaliacao-header">
                        <div>
                            <strong>${this.escapeHtml(av.nome)}</strong>
                            <span class="avaliacao-data">${av.data}</span>
                        </div>
                        <div>${this.gerarEstrelasMedia(av.nota)}</div>
                    </div>
                    <div class="avaliacao-comentario">${this.escapeHtml(av.comentario)}</div>
                    ${av.resposta ? `
                        <div class="avaliacao-resposta">
                            <div class="resposta-header">
                                <strong>👨‍💼 Administrador respondeu:</strong>
                                <span class="resposta-data">${av.data_resposta || ''}</span>
                            </div>
                            <div class="resposta-texto">${this.escapeHtml(av.resposta)}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    escapeHtml(texto) {
        if (!texto) return '';
        return texto
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>');
    }
    
    async enviarAvaliacao() {
        const nome = document.getElementById('avaliacao-nome')?.value.trim();
        const email = document.getElementById('avaliacao-email')?.value.trim();
        const comentario = document.getElementById('avaliacao-comentario')?.value.trim();
        
        if (!nome) {
            alert('Por favor, digite seu nome');
            return;
        }
        
        if (this.notaSelecionada === 0) {
            alert('Por favor, selecione uma nota');
            return;
        }
        
        if (!comentario) {
            alert('Por favor, escreva um comentário');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    nota: this.notaSelecionada,
                    comentario: comentario,
                    tipo: this.tipo,
                    tipo_id: this.tipoId
                })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            
            alert('✅ Avaliação enviada com sucesso!');
            
            document.getElementById('avaliacao-nome').value = '';
            document.getElementById('avaliacao-email').value = '';
            document.getElementById('avaliacao-comentario').value = '';
            this.notaSelecionada = 0;
            this.atualizarEstrelas();
            
            await this.carregarAvaliacoes();
            await this.carregarEstatisticas();
        } catch (error) {
            alert('Erro ao enviar: ' + error.message);
        }
    }
}

let sistemaAvaliacoes = null;

function inicializarAvaliacoes(containerId, tipo = 'site', tipoId = null) {
    if (sistemaAvaliacoes) return;
    sistemaAvaliacoes = new SistemaAvaliacoes();
    sistemaAvaliacoes.init(containerId, tipo, tipoId);
}
