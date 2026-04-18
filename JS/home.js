

// Função de Busca
function realizarBusca() {
    const inputBusca = document.getElementById('input-busca');
    const termoBusca = inputBusca ? inputBusca.value.toLowerCase().trim() : '';
    
    if (!termoBusca) {
        alert('Por favor, digite algo para buscar');
        return;
    }
    
    // Buscar em diferentes categorias
    if (termoBusca.includes('hospital')) {
        window.location.href = 'hospital.html';
    } else if (termoBusca.includes('centro') || termoBusca.includes('saúde')) {
        window.location.href = 'centros.html';
    } else if (termoBusca.includes('farmácia') || termoBusca.includes('farmacia')) {
        window.location.href = 'farm.html';
    } else if (termoBusca.includes('emergência') || termoBusca.includes('emergencia')) {
        window.location.href = 'emer.html';
    } else {
        // Buscar por bairro
        const bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine'];
        const bairroEncontrado = bairros.find(b => termoBusca.includes(b));
        
        if (bairroEncontrado) {
            window.location.href = `centros.html?bairro=${bairroEncontrado}`;
        } else {
            alert('Não encontramos resultados para: ' + termoBusca);
        }
    }
}

// Permitir busca com Enter
function buscarComEnter(event) {
    if (event.key === 'Enter') {
        realizarBusca();
    }
}

// Botão de Emergência
function ligarEmergencia() {
    const confirmar = confirm('Deseja ligar para o número de emergência 119?');
    if (confirmar) {
        window.location.href = 'tel:119';
    }
}


try {
    // Obtém o ano atual
    const anoAtual = new Date().getFullYear();

    // Insere no elemento com id="ano"
    document.getElementById("ano").textContent = anoAtual;
} catch (error) {
    console.error("Erro ao definir o ano no footer:", error);
}

// Navegação para cards clicáveis
function navegarPara(pagina) {
    window.location.href = pagina;
}
















































































// // Animação de entrada para cards
// function animarCards() {
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.style.opacity = '0';
//                 entry.target.style.transform = 'translateY(20px)';
                
//                 setTimeout(() => {
//                     entry.target.style.transition = 'all 0.5s ease';
//                     entry.target.style.opacity = '1';
//                     entry.target.style.transform = 'translateY(0)';
//                 }, 100);
                
//                 observer.unobserve(entry.target);
//             }
//         });
//     });
    
//     document.querySelectorAll('.card, .info-card').forEach(card => {
//         observer.observe(card);
//     });
// }

// // Executar quando o DOM estiver pronto
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Página Inicial - Carregada');
    
//     // Animar cards
//     animarCards();
    
//     // Adicionar evento ao input de busca
//     const inputBusca = document.getElementById('input-busca');
//     if (inputBusca) {
//         inputBusca.addEventListener('keypress', buscarComEnter);
//     }
// });