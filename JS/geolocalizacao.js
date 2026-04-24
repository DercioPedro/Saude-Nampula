// geolocalizacao.js - Funcionalidade de localização e distância

let localizacaoAtual = null;
let distanciaAtiva = false;

// Obter localização do usuário
function obterLocalizacao() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalizacao nao suportada pelo navegador'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const localizacao = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                localizacaoAtual = localizacao;
                console.log(' Localização obtida:', localizacao);
                resolve(localizacao);
            },
            (error) => {
                let mensagem = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagem = 'Permissao negada. Permita o acesso a localizacao.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagem = 'Localizacao indisponivel.';
                        break;
                    case error.TIMEOUT:
                        mensagem = 'Tempo esgotado.';
                        break;
                    default:
                        mensagem = error.message;
                }
                reject(new Error(mensagem));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Calcular distância entre dois pontos (Fórmula de Haversine)
function calcularDistancia(lat1, lng1, lat2, lng2) {
    const raioTerra = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return raioTerra * c;
}

// Formatar distância para exibição
function formatarDistancia(distancia) {
    if (distancia < 1) {
        return `${Math.round(distancia * 1000)} m`;
    }
    return `${distancia.toFixed(1)} km`;
}

// Adicionar distância aos cards
async function adicionarDistanciasAosCards() {
    try {
        if (!localizacaoAtual) {
            const msg = document.createElement('div');
            msg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;';
            msg.innerHTML = ' Obtendo sua localizacao...';
            document.body.appendChild(msg);
            
            await obterLocalizacao();
            
            msg.remove();
        }
        
        distanciaAtiva = true;
        
        // Buscar todos os cards de farmácias, hospitais e centros
        const cards = document.querySelectorAll('.farmacia-card, .hospital-card, .centro-card');
        
        console.log(`Encontrados ${cards.length} cards para processar`);
        
        let cardsComDistancia = 0;
        
        for (const card of cards) {
            const id = card.dataset.id;
            const tipo = card.classList.contains('farmacia-card') ? 'farmacia' :
                        card.classList.contains('hospital-card') ? 'hospital' : 'centro';
            
            if (!id) continue;
            
            try {
                let item = null;
                if (tipo === 'farmacia') {
                    const items = await apiRequest('/farmacias');
                    item = items.find(i => i.id == id);
                } else if (tipo === 'hospital') {
                    const items = await apiRequest('/hospitais');
                    item = items.find(i => i.id == id);
                } else {
                    const items = await apiRequest('/centros');
                    item = items.find(i => i.id == id);
                }
                
                if (item && item.latitude && item.longitude) {
                    const distancia = calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, item.latitude, item.longitude);
                    
                    // Procurar ou criar elemento de distância
                    let distanciaElement = card.querySelector('.distancia-badge');
                    if (!distanciaElement) {
                        distanciaElement = document.createElement('div');
                        distanciaElement.className = 'distancia-badge';
                        const detailsDiv = card.querySelector('.farmacia-details, .hospital-details, .centro-details');
                        if (detailsDiv) {
                            detailsDiv.insertBefore(distanciaElement, detailsDiv.firstChild);
                        } else {
                            card.insertBefore(distanciaElement, card.firstChild);
                        }
                    }
                    distanciaElement.innerHTML = ` a ${formatarDistancia(distancia)}`;
                    distanciaElement.style.cssText = 'background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 8px; width: fit-content;';
                    cardsComDistancia++;
                }
            } catch (error) {
                console.error(`Erro ao buscar ${tipo} ${id}:`, error);
            }
        }
        
        // Mostrar mensagem de sucesso
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;';
        msgDiv.innerHTML = ` Localizacao ativada! ${cardsComDistancia} unidades com distancia calculada.`;
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
        
        // Mostrar botão de ordenar se tiver distâncias
        if (cardsComDistancia > 0) {
            const btnOrdenar = document.getElementById('btn-ordenar-distancia');
            if (btnOrdenar) btnOrdenar.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Erro ao calcular distancias:', error);
        alert(error.message);
    }
}

// Ordenar cards por distância
function ordenarCardsPorDistancia() {
    const container = document.querySelector('.farmacias-grid, .centros-grid, main');
    if (!container) return;
    
    const cards = Array.from(container.querySelectorAll('.farmacia-card, .hospital-card, .centro-card'));
    
    // Extrair distância de cada card
    const cardsComDistancia = cards.map(card => {
        const distanciaElement = card.querySelector('.distancia-badge');
        let distancia = Infinity;
        if (distanciaElement) {
            const texto = distanciaElement.textContent;
            const match = texto.match(/(\d+(?:\.\d+)?)\s*(?:m|km)/);
            if (match) {
                let valor = parseFloat(match[1]);
                if (texto.includes('km')) {
                    distancia = valor;
                } else if (texto.includes('m')) {
                    distancia = valor / 1000;
                }
            }
        }
        return { card, distancia };
    });
    
    // Ordenar por distância
    cardsComDistancia.sort((a, b) => a.distancia - b.distancia);
    
    // Reordenar no DOM
    cardsComDistancia.forEach(item => {
        container.appendChild(item.card);
    });
    
    const btnOrdenar = document.getElementById('btn-ordenar-distancia');
    if (btnOrdenar) {
        btnOrdenar.innerHTML = ' Ordenado por distancia';
        setTimeout(() => {
            btnOrdenar.innerHTML = ' Ordenar por distancia';
        }, 2000);
    }
}

// Criar botões de localização
function criarBotaoLocalizacao() {
    // Verificar se já existe
    if (document.querySelector('.btn-localizacao-container')) return;
    
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-localizacao-container';
    btnContainer.style.cssText = 'margin-bottom: 20px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;';
    
    const btnLocalizar = document.createElement('button');
    btnLocalizar.id = 'btn-localizar';
    btnLocalizar.innerHTML = ' Encontrar mais proximos';
    btnLocalizar.style.cssText = 'background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s;';
    
    const btnOrdenar = document.createElement('button');
    btnOrdenar.id = 'btn-ordenar-distancia';
    btnOrdenar.innerHTML = ' Ordenar por distancia';
    btnOrdenar.style.cssText = 'background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s; display: none;';
    
    btnLocalizar.onclick = async () => {
        btnLocalizar.disabled = true;
        btnLocalizar.innerHTML = ' Obtendo localizacao...';
        btnLocalizar.style.opacity = '0.7';
        await adicionarDistanciasAosCards();
        btnLocalizar.disabled = false;
        btnLocalizar.innerHTML = ' Localizacao ativa';
        btnLocalizar.style.background = '#059669';
        btnLocalizar.style.opacity = '1';
    };
    
    btnOrdenar.onclick = () => {
        ordenarCardsPorDistancia();
    };
    
    btnContainer.appendChild(btnLocalizar);
    btnContainer.appendChild(btnOrdenar);
    
    // Inserir após o filter-section
    filterSection.parentNode.insertBefore(btnContainer, filterSection.nextSibling);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('farm.html') || path.includes('hospital.html') || path.includes('centros.html')) {
        // Aguardar os cards carregarem
        setTimeout(() => {
            criarBotaoLocalizacao();
        }, 500);
    }
});
