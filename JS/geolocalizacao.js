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
                resolve(localizacao);
            },
            (error) => {
                let mensagem = 'Erro ao obter localizacao: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagem += 'Permissao negada. Permita o acesso a localizacao.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagem += 'Localizacao indisponivel.';
                        break;
                    case error.TIMEOUT:
                        mensagem += 'Tempo esgotado.';
                        break;
                    default:
                        mensagem += error.message;
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
            await obterLocalizacao();
        }
        
        distanciaAtiva = true;
        
        // Buscar todos os cards de farmácias, hospitais e centros
        const cards = document.querySelectorAll('.farmacia-card, .hospital-card, .centro-card');
        
        for (const card of cards) {
            const id = card.dataset.id;
            const tipo = card.classList.contains('farmacia-card') ? 'farmacia' :
                        card.classList.contains('hospital-card') ? 'hospital' : 'centro';
            
            // Tentar obter coordenadas do card (se disponíveis)
            let lat = null, lng = null;
            
            // Buscar dados da API para obter coordenadas
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
                    lat = item.latitude;
                    lng = item.longitude;
                    const distancia = calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, lat, lng);
                    
                    // Adicionar ou atualizar o elemento de distância
                    let distanciaElement = card.querySelector('.distancia-badge');
                    if (!distanciaElement) {
                        distanciaElement = document.createElement('div');
                        distanciaElement.className = 'distancia-badge';
                        const detailsDiv = card.querySelector('.farmacia-details, .hospital-details, .centro-details');
                        if (detailsDiv) {
                            detailsDiv.insertBefore(distanciaElement, detailsDiv.firstChild);
                        }
                    }
                    distanciaElement.innerHTML = `<img src="/img/ponto.png" alt="Distancia" style="width: 12px; height: 12px;"> a ${formatarDistancia(distancia)}`;
                    distanciaElement.style.cssText = 'background: #7c3aed; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 8px; width: fit-content;';
                }
            } catch (error) {
                console.error(`Erro ao buscar coordenadas para ${tipo} ${id}:`, error);
            }
        }
        
        // Mostrar mensagem de sucesso
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;';
        msgDiv.innerHTML = ' Localizacao ativada! Distancias calculadas.';
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
        
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
}

// Botão para ativar localização
function criarBotaoLocalizacao() {
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'margin-bottom: 20px; display: flex; gap: 10px; justify-content: flex-end;';
    
    const btnLocalizar = document.createElement('button');
    btnLocalizar.innerHTML = '<img src="/img/ponto.png" alt="Localizar" style="width: 16px; height: 16px;"> Encontrar mais proximos';
    btnLocalizar.style.cssText = 'background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;';
    
    const btnOrdenar = document.createElement('button');
    btnOrdenar.innerHTML = '📊 Ordenar por distancia';
    btnOrdenar.style.cssText = 'background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; display: none;';
    btnOrdenar.id = 'btn-ordenar-distancia';
    
    btnLocalizar.onclick = async () => {
        btnLocalizar.disabled = true;
        btnLocalizar.innerHTML = ' Obtendo localizacao...';
        await adicionarDistanciasAosCards();
        btnOrdenar.style.display = 'flex';
        btnLocalizar.innerHTML = ' Localizacao ativa';
        btnLocalizar.style.background = '#059669';
    };
    
    btnOrdenar.onclick = () => {
        ordenarCardsPorDistancia();
        btnOrdenar.innerHTML = ' Ordenado por distancia';
        setTimeout(() => {
            btnOrdenar.innerHTML = ' Ordenar por distancia';
        }, 2000);
    };
    
    btnContainer.appendChild(btnLocalizar);
    btnContainer.appendChild(btnOrdenar);
    
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        filterSection.parentNode.insertBefore(btnContainer, filterSection.nextSibling);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('farm.html') || path.includes('hospital.html') || path.includes('centros.html')) {
        criarBotaoLocalizacao();
    }
});
