// geolocalizacao.js - Versão com geocodificação por endereço

let localizacaoAtual = null;
let distanciaAtiva = false;
let cacheCoordenadas = {};

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
                // console.log('📍 Localização do usuário:', localizacao);
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

// Converter endereço para coordenadas via API
async function geocodeEndereco(endereco) {
    if (!endereco || endereco === 'Endereço não informado') {
        return null;
    }
    
    // Verificar cache local
    if (cacheCoordenadas[endereco]) {
        // console.log(`📍 Cache: ${endereco} ->`, cacheCoordenadas[endereco]);
        return cacheCoordenadas[endereco];
    }
    
    try {
        // console.log(`🔍 Buscando coordenadas para: ${endereco}`);
        const response = await fetch('http://localhost:5000/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endereco: endereco })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                cacheCoordenadas[endereco] = { lat: data.latitude, lng: data.longitude };
                return { lat: data.latitude, lng: data.longitude };
            }
        }
        return null;
    } catch (error) {
        console.error('Erro ao geocodificar:', error);
        return null;
    }
}

// Calcular distância entre dois pontos
function calcularDistancia(lat1, lng1, lat2, lng2) {
    const raioTerra = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return raioTerra * c;
}

function formatarDistancia(distancia) {
    if (distancia < 1) {
        return `${Math.round(distancia * 1000)} m`;
    }
    return `${distancia.toFixed(1)} km`;
}

// Buscar coordenadas do item (prioriza coordenadas salvas, depois endereço)
async function buscarCoordenadasItem(item, tipo) {
    // Prioridade 1: Coordenadas salvas no banco
    if (item.latitude && item.longitude) {
        // console.log(`✅ ${item.nome}: usando coordenadas do banco`);
        return { lat: item.latitude, lng: item.longitude, tipo: 'banco' };
    }
    
    // Prioridade 2: Usar endereço para geocodificar
    if (item.endereco && item.endereco !== 'Endereço não informado') {
        console.log(`🔍 ${item.nome}: buscando coordenadas pelo endereço`);
        const coords = await geocodeEndereco(item.endereco);
        if (coords) {
            console.log(` ${item.nome}: coordenadas obtidas pelo endereço`);
            return { lat: coords.lat, lng: coords.lng, tipo: 'endereco' };
        }
    }
    
    // console.log(`⚠️ ${item.nome}: não foi possível obter coordenadas`);
    return null;
}

async function adicionarDistanciasAosCards() {
    try {
        if (!localizacaoAtual) {
            const msg = document.createElement('div');
            msg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;';
            msg.innerHTML = '🔄 Obtendo sua localizacao...';
            document.body.appendChild(msg);
            
            await obterLocalizacao();
            msg.remove();
        }
        
        distanciaAtiva = true;
        
        // Buscar todos os itens da API
        const [farmacias, hospitais, centros] = await Promise.all([
            apiRequest('/farmacias'),
            apiRequest('/hospitais'),
            apiRequest('/centros')
        ]);
        
        const todosItens = [
            ...farmacias.map(f => ({ ...f, tipo: 'farmacia' })),
            ...hospitais.map(h => ({ ...h, tipo: 'hospital' })),
            ...centros.map(c => ({ ...c, tipo: 'centro' }))
        ];
        
        console.log(`📊 Total de itens: ${todosItens.length}`);
        
        // Calcular distância para cada item
        const itensComDistancia = [];
        
        for (const item of todosItens) {
            const coords = await buscarCoordenadasItem(item, item.tipo);
            
            if (coords) {
                const distancia = calcularDistancia(localizacaoAtual.lat, localizacaoAtual.lng, coords.lat, coords.lng);
                itensComDistancia.push({
                    ...item,
                    distancia: distancia,
                    distanciaFormatada: formatarDistancia(distancia),
                    coordenadasUsadas: coords.tipo
                });
            } else {
                itensComDistancia.push({
                    ...item,
                    distancia: null,
                    distanciaFormatada: null
                });
            }
        }
        
        // Ordenar por distância
        itensComDistancia.sort((a, b) => {
            if (a.distancia === null) return 1;
            if (b.distancia === null) return -1;
            return a.distancia - b.distancia;
        });
        
        // Atualizar os cards na página
        await atualizarCardsComDistancias(itensComDistancia);
        
        // Mostrar resumo
        const comDistancia = itensComDistancia.filter(i => i.distancia !== null).length;
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #059669; color: white; padding: 10px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;';
        msgDiv.innerHTML = ` ${comDistancia} estabelecimentos com distância calculada.`;
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
        
        const btnOrdenar = document.getElementById('btn-ordenar-distancia');
        if (btnOrdenar && comDistancia > 0) {
            btnOrdenar.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
    }
}

async function atualizarCardsComDistancias(itensOrdenados) {
    // Para cada tipo de card, atualizar a ordem no DOM
    const containers = {
        farmacia: document.querySelector('.farmacias-grid'),
        hospital: document.querySelector('main'),
        centro: document.querySelector('.centros-grid')
    };
    
    // Filtrar itens por tipo
    const farmaciasOrdenadas = itensOrdenados.filter(i => i.tipo === 'farmacia');
    const hospitaisOrdenados = itensOrdenados.filter(i => i.tipo === 'hospital');
    const centrosOrdenados = itensOrdenados.filter(i => i.tipo === 'centro');
    
    // Recriar cards na ordem correta
    if (containers.farmacia && farmaciasOrdenadas.length > 0) {
        const grid = containers.farmacia;
        grid.innerHTML = '';
        for (const farmacia of farmaciasOrdenadas) {
            const card = await recriarCardComDistancia(farmacia);
            if (card) grid.appendChild(card);
        }
    }
}

async function recriarCardComDistancia(item) {
    // Buscar o card original para recriar
    const cardOriginal = document.querySelector(`[data-id="${item.id}"]`);
    if (!cardOriginal) return null;
    
    // Clonar o card
    const novoCard = cardOriginal.cloneNode(true);
    
    // Remover badge de distância antigo se existir
    const badgeAntigo = novoCard.querySelector('.distancia-badge');
    if (badgeAntigo) badgeAntigo.remove();
    
    // Adicionar badge de distância
    if (item.distanciaFormatada) {
        const distanciaBadge = document.createElement('div');
        distanciaBadge.className = 'distancia-badge';
        distanciaBadge.innerHTML = ` ${item.distanciaFormatada} ${item.coordenadasUsadas === 'endereco' ? '(via endereço)' : ''}`;
        distanciaBadge.style.cssText = 'background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 8px; width: fit-content;';
        
        // Inserir no início do card
        const firstChild = novoCard.firstChild;
        novoCard.insertBefore(distanciaBadge, firstChild);
    } else {
        const semCoordBadge = document.createElement('div');
        semCoordBadge.className = 'sem-coordenada';
        semCoordBadge.innerHTML = ' Localizacao nao disponivel';
        semCoordBadge.style.cssText = 'background: #6b7280; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 8px; width: fit-content;';
        const firstChild = novoCard.firstChild;
        novoCard.insertBefore(semCoordBadge, firstChild);
    }
    
    return novoCard;
}

function ordenarCardsPorDistancia() {
    // A função de ordenação já é feita no adicionarDistanciasAosCards
    // Este botão apenas recarrega a ordenação
    adicionarDistanciasAosCards();
}

function criarBotaoLocalizacao() {
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
        btnLocalizar.innerHTML = '🔄 Calculando distancias...';
        btnLocalizar.style.opacity = '0.7';
        await adicionarDistanciasAosCards();
        btnLocalizar.disabled = false;
        btnLocalizar.innerHTML = ' Localizacao ativa';
        btnLocalizar.style.background = '#059669';
        btnLocalizar.style.opacity = '1';
    };
    
    btnOrdenar.onclick = ordenarCardsPorDistancia;
    
    btnContainer.appendChild(btnLocalizar);
    btnContainer.appendChild(btnOrdenar);
    
    filterSection.parentNode.insertBefore(btnContainer, filterSection.nextSibling);
}

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('farm.html') || path.includes('hospital.html') || path.includes('centros.html')) {
        setTimeout(criarBotaoLocalizacao, 1000);
    }
});
