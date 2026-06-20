// avaliacao-modal.js - Modal de avaliação para estabelecimentos

// Função global para abrir modal de avaliação
function abrirModalAvaliacao(tipo, id) {
    // Buscar o nome do estabelecimento
    const card = document.querySelector(`.${tipo}-card[data-id="${id}"]`);
    const nome = card ? card.querySelector('h3')?.textContent || 'Estabelecimento' : 'Estabelecimento';
    
    // Verificar se já existe um modal aberto
    if (document.querySelector('.avaliacao-modal')) {
        fecharModalAvaliacao();
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'avaliacao-modal';
    modal.innerHTML = `
        <div class="avaliacao-modal-content">
            <div class="avaliacao-modal-header">
                <h3>⭐ Avaliar ${nome}</h3>
                <button class="avaliacao-modal-close" onclick="fecharModalAvaliacao()">&times;</button>
            </div>
            <div class="avaliacao-modal-body">
                <div class="form-group">
                    <label>Seu Nome *</label>
                    <input type="text" id="avaliacao-modal-nome" placeholder="Digite seu nome">
                </div>
                <div class="form-group">
                    <label>Seu Email (opcional)</label>
                    <input type="email" id="avaliacao-modal-email" placeholder="email@exemplo.com">
                </div>
                <div class="form-group">
                    <label>Sua Nota *</label>
                    <div class="estrelas-modal" id="estrelas-modal">
                        <span class="estrela-modal" data-nota="1">☆</span>
                        <span class="estrela-modal" data-nota="2">☆</span>
                        <span class="estrela-modal" data-nota="3">☆</span>
                        <span class="estrela-modal" data-nota="4">☆</span>
                        <span class="estrela-modal" data-nota="5">☆</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Seu Comentário *</label>
                    <textarea id="avaliacao-modal-comentario" rows="4" placeholder="Compartilhe sua experiência..."></textarea>
                </div>
            </div>
            <div class="avaliacao-modal-footer">
                <button class="btn-cancelar" onclick="fecharModalAvaliacao()">Cancelar</button>
                <button class="btn-enviar" onclick="enviarAvaliacaoModal('${tipo}', ${id})">Enviar Avaliação</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos das estrelas
    const estrelas = modal.querySelectorAll('.estrela-modal');
    let notaSelecionada = 0;
    
    estrelas.forEach(estrela => {
        estrela.addEventListener('click', function() {
            notaSelecionada = parseInt(this.dataset.nota);
            estrelas.forEach((e, i) => {
                if (i < notaSelecionada) {
                    e.textContent = '★';
                    e.style.color = '#fbbf24';
                } else {
                    e.textContent = '☆';
                    e.style.color = '#d1d5db';
                }
            });
        });
    });
    
    // Salvar nota globalmente para o envio
    window.notaModalSelecionada = () => notaSelecionada;
}

// Fechar modal
function fecharModalAvaliacao() {
    const modal = document.querySelector('.avaliacao-modal');
    if (modal) modal.remove();
}

// Enviar avaliação do modal
async function enviarAvaliacaoModal(tipo, id) {
    const nome = document.getElementById('avaliacao-modal-nome').value.trim();
    const email = document.getElementById('avaliacao-modal-email').value.trim();
    const comentario = document.getElementById('avaliacao-modal-comentario').value.trim();
    const nota = window.notaModalSelecionada ? window.notaModalSelecionada() : 0;
    
    if (!nome) {
        alert('Por favor, digite seu nome');
        return;
    }
    
    if (nota === 0) {
        alert('Por favor, selecione uma nota');
        return;
    }
    
    if (!comentario) {
        alert('Por favor, escreva um comentário');
        return;
    }
    
    try {
        const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';
        
        const response = await fetch(`${API_URL}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome,
                email: email,
                nota: nota,
                comentario: comentario,
                tipo: tipo,
                tipo_id: id
            })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        alert('✅ Avaliação enviada com sucesso!');
        fecharModalAvaliacao();
        
        // Recarregar a página para mostrar a nova avaliação
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    } catch (error) {
        alert('Erro ao enviar: ' + error.message);
    }
}

// Adicionar estilos do modal dinamicamente
(function adicionarEstilosModal() {
    const style = document.createElement('style');
    style.textContent = `
        .avaliacao-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .avaliacao-modal-content {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .avaliacao-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .avaliacao-modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 20px;
        }
        
        .avaliacao-modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #6b7280;
            padding: 0 8px;
            transition: color 0.3s;
        }
        
        .avaliacao-modal-close:hover {
            color: #1f2937;
        }
        
        .avaliacao-modal-body {
            padding: 24px;
        }
        
        .avaliacao-modal-body .form-group {
            margin-bottom: 18px;
        }
        
        .avaliacao-modal-body label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
            font-size: 14px;
        }
        
        .avaliacao-modal-body input,
        .avaliacao-modal-body textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
            font-family: inherit;
        }
        
        .avaliacao-modal-body input:focus,
        .avaliacao-modal-body textarea:focus {
            outline: none;
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        
        .avaliacao-modal-body textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .estrelas-modal {
            display: flex;
            gap: 8px;
            font-size: 32px;
        }
        
        .estrela-modal {
            cursor: pointer;
            color: #d1d5db;
            transition: transform 0.2s, color 0.2s;
        }
        
        .estrela-modal:hover {
            transform: scale(1.15);
        }
        
        .avaliacao-modal-footer {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            padding: 16px 24px 24px;
            border-top: 1px solid #e5e7eb;
        }
        
        .avaliacao-modal-footer .btn-cancelar {
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        .avaliacao-modal-footer .btn-cancelar:hover {
            background: #e5e7eb;
        }
        
        .avaliacao-modal-footer .btn-enviar {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        .avaliacao-modal-footer .btn-enviar:hover {
            background: #6d28d9;
        }
        
        @media (max-width: 600px) {
            .estrelas-modal {
                font-size: 28px;
            }
            
            .avaliacao-modal-content {
                width: 95%;
                max-height: 95vh;
            }
            
            .avaliacao-modal-header h3 {
                font-size: 18px;
            }
            
            .avaliacao-modal-footer {
                flex-direction: column;
            }
            
            .avaliacao-modal-footer .btn-cancelar,
            .avaliacao-modal-footer .btn-enviar {
                width: 100%;
                padding: 12px;
            }
        }
    `;
    document.head.appendChild(style);
})();

// Adicionar ao escopo global
window.abrirModalAvaliacao = abrirModalAvaliacao;
window.fecharModalAvaliacao = fecharModalAvaliacao;
window.enviarAvaliacaoModal = enviarAvaliacaoModal;

console.log('✅ Módulo de avaliação modal carregado!');
