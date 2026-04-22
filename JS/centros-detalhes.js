// centros-detalhes.js - Versão com priorização correta de coordenadas

function getCentroId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Função para obter URL do Google Maps (prioriza coordenadas)
function obterUrlGoogleMaps(centro) {
    // PRIORIDADE: Se tem coordenadas, usa apenas elas
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${centro.latitude},${centro.longitude}`;
    }
    // SÓ USA ENDEREÇO SE NÃO TIVER COORDENADAS
    if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

// Função para obter URL do Waze (prioriza coordenadas)
function obterUrlWaze(centro) {
    // PRIORIDADE: Se tem coordenadas, usa apenas elas
    if (centro.latitude && centro.longitude) {
        return `https://www.waze.com/ul?ll=${centro.latitude},${centro.longitude}&navigate=yes`;
    }
    // SÓ USA ENDEREÇO SE NÃO TIVER COORDENADAS
    if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

// Função para obter URL de direções (prioriza coordenadas)
function obterUrlDirecoes(centro) {
    // PRIORIDADE: Se tem coordenadas, usa apenas elas
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${centro.latitude},${centro.longitude}`;
    }
    // SÓ USA ENDEREÇO SE NÃO TIVER COORDENADAS
    if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
}

// Função para verificar se tem coordenadas válidas
function temCoordenadas(centro) {
    return centro.latitude && centro.longitude && 
           !isNaN(centro.latitude) && !isNaN(centro.longitude) &&
           centro.latitude !== 0 && centro.longitude !== 0;
}

async function carregarDetalhes() {
    let id = getCentroId();
    
    if (!id) {
        alert('Centro de saúde não encontrado!');
        window.location.href = 'centros.html';
        return;
    }
    
    try {
        const centro = await apiRequest(`/centros/${id}`);
        
        console.log('Centro carregado:', centro);
        console.log('Tem coordenadas?', temCoordenadas(centro));
        if (temCoordenadas(centro)) {
            console.log('Coordenadas:', centro.latitude, centro.longitude);
        }
        
        document.getElementById('breadcrumb-nome').textContent = centro.nome;
        document.getElementById('centro-nome').textContent = centro.nome;
        document.getElementById('centro-bairro').textContent = pegarNomeBairro(centro.endereco);
        document.getElementById('centro-horario').textContent = centro.horario || 'Horário não informado';
        document.getElementById('centro-endereco').textContent = centro.endereco || 'Endereço não informado';
        document.getElementById('centro-telefone').textContent = centro.telefone || 'Telefone não informado';
        document.getElementById('endereco-completo').textContent = (centro.endereco || 'Endereço não informado') + ', Nampula';
        
        // Atualizar botões de mapa com coordenadas priorizadas
        const urlGoogleMaps = obterUrlGoogleMaps(centro);
        const urlWaze = obterUrlWaze(centro);
        const urlDirecoes = obterUrlDirecoes(centro);
        
        // Atualizar ou criar botões de navegação
        atualizarBotoesNavegacao(urlGoogleMaps, urlWaze, urlDirecoes, temCoordenadas(centro));
        
        // Atualizar o placeholder do mapa
        atualizarMapaPlaceholder(centro);
        
        let servicosGrid = document.getElementById('servicos-grid');
        servicosGrid.innerHTML = '';
        
        if (centro.servicos) {
            let servicos = centro.servicos.split(',');
            
            let iconesServicos = {
                'consultas gerais': '<img src="/img/stete.png" alt="">',
                'vacinação': '<img src="/img/vacina.png" alt="">',
                'pré-natal': '<img src="/img/gravida.png" alt="">',
                'planeamento familiar': '<img src="/img/family.png" alt="">',
                'pediatria': '👶',
                'maternidade': '🤱',
                'teste de hiv': '🧪',
                'saúde materno-infantil': '👶',
                'tratamento de malária': '🦟',
                'primeiros socorros': '🚑',
                'consultas especializadas': '👨‍⚕️',
                'laboratório': '🔬',
                'farmácia': '<img src="/img/comprimidos.png" alt="">',
                'saúde reprodutiva': '❤️',
                'nutrição infantil': '🍎',
                'testes rápidos': '⚡'
            };
            
            for (let i = 0; i < servicos.length; i++) {
                let servico = servicos[i].trim();
                if (servico) {
                    let servicoLower = servico.toLowerCase();
                    let icone = iconesServicos[servicoLower] || '✓';
                    
                    let item = document.createElement('div');
                    item.className = 'servico-item';
                    item.innerHTML = `<div class="servico-item-icon">${icone}</div><strong>${servico}</strong>`;
                    servicosGrid.appendChild(item);
                }
            }
        } else {
            servicosGrid.innerHTML = '<p class="loading-text">Nenhum serviço cadastrado</p>';
        }
        
        window.centroTelefone = centro.telefone;
        window.centroNome = centro.nome;
        window.centroEndereco = centro.endereco;
        window.centroLatitude = centro.latitude;
        window.centroLongitude = centro.longitude;
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do centro de saúde');
        window.location.href = 'centros.html';
    }
}

function atualizarBotoesNavegacao(urlGoogleMaps, urlWaze, urlDirecoes, temCoordenadas) {
    // Botão "Ver no Mapa"
    const btnVerMapa = document.querySelector('.btn-mapa');
    if (btnVerMapa) {
        btnVerMapa.onclick = () => {
            if (urlGoogleMaps !== '#') {
                window.open(urlGoogleMaps, '_blank');
            } else {
                alert('Localização não disponível para este centro.');
            }
        };
    }
    
    // Botão "Como Chegar" / "Obter Direções"
    const btnDirecoes = document.querySelector('.btn-directions');
    if (btnDirecoes) {
        btnDirecoes.onclick = () => {
            if (urlDirecoes !== '#') {
                window.open(urlDirecoes, '_blank');
            } else {
                alert('Localização não disponível para este centro.');
            }
        };
    }
    
    // Botão Waze
    const btnWaze = document.querySelector('.btn-waze');
    if (btnWaze) {
        btnWaze.onclick = () => {
            if (urlWaze !== '#') {
                window.open(urlWaze, '_blank');
            } else {
                alert('Localização não disponível para este centro.');
            }
        };
    }
    
    // Adicionar indicador visual se está usando coordenadas
    if (temCoordenadas) {
        const mapaContainer = document.querySelector('.map-card');
        if (mapaContainer && !document.querySelector('.coordenadas-badge')) {
            const badge = document.createElement('div');
            badge.className = 'coordenadas-badge';
            badge.style.cssText = 'background: #059669; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px; display: inline-block; margin-left: 10px;';
            badge.innerHTML = '📍 Localização exata (GPS)';
            const title = mapaContainer.querySelector('h2');
            if (title) title.appendChild(badge);
        }
    }
}

function atualizarMapaPlaceholder(centro) {
    const mapaPlaceholder = document.querySelector('.map-placeholder');
    if (!mapaPlaceholder) return;
    
    const temCoord = temCoordenadas(centro);
    const urlMapa = obterUrlGoogleMaps(centro);
    
    if (temCoord) {
        // Mostrar mapa estático do Google Maps com as coordenadas
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centro.latitude},${centro.longitude}&zoom=15&size=400x200&markers=color:red|${centro.latitude},${centro.longitude}&key=AIzaSyDummyKey`; // Nota: Para usar mapa estático precisa de API key
        // Como fallback, mostra apenas o link
        mapaPlaceholder.innerHTML = `
            <div class="map-icon"><img src="/img/ponto.png" alt=""></div>
            <p><strong>📍 Localização exata (GPS)</strong></p>
            <p class="coordenadas-text">Latitude: ${centro.latitude}, Longitude: ${centro.longitude}</p>
            <div class="map-actions" style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                <button class="btn-directions" onclick="window.open('${obterUrlDirecoes(centro)}', '_blank')" style="flex: 1; background: #4285F4; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🧭 Obter Direções GPS
                </button>
                <button class="btn-waze" onclick="window.open('${obterUrlWaze(centro)}', '_blank')" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🚗 Abrir no Waze
                </button>
                <button class="btn-mapa" onclick="window.open('${urlMapa}', '_blank')" style="flex: 1; background: #ea4335; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🗺️ Ver no Google Maps
                </button>
            </div>
        `;
    } else if (centro.endereco) {
        mapaPlaceholder.innerHTML = `
            <div class="map-icon"><img src="/img/ponto.png" alt=""></div>
            <p>📍 ${centro.endereco}, Nampula</p>
            <div class="map-actions" style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                <button class="btn-directions" onclick="obterDirecoesPorEndereco()" style="flex: 1; background: #4285F4; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🧭 Obter Direções
                </button>
                <button class="btn-waze" onclick="abrirWazePorEndereco()" style="flex: 1; background: #33CCFF; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🚗 Abrir no Waze
                </button>
                <button class="btn-mapa" onclick="verNoMapaPorEndereco()" style="flex: 1; background: #ea4335; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                    🗺️ Ver no Google Maps
                </button>
            </div>
        `;
    }
}

function pegarNomeBairro(endereco) {
    if (!endereco) return 'Nampula';
    let bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine'];
    let enderecoLower = endereco.toLowerCase();
    
    for (let i = 0; i < bairros.length; i++) {
        if (enderecoLower.includes(bairros[i])) {
            return 'Bairro ' + bairros[i].charAt(0).toUpperCase() + bairros[i].slice(1);
        }
    }
    return endereco.split(',')[0] || 'Nampula';
}

// Funções para quando não tem coordenadas (usa endereço)
function verNoMapaPorEndereco() {
    if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/search/?api=1&query=' + endereco, '_blank');
    } else {
        alert('Endereço não disponível para este centro.');
    }
}

function obterDirecoesPorEndereco() {
    if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/dir/?api=1&destination=' + endereco, '_blank');
    } else {
        alert('Endereço não disponível para este centro.');
    }
}

function abrirWazePorEndereco() {
    if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.waze.com/ul?q=' + endereco + '&navigate=yes', '_blank');
    } else {
        alert('Endereço não disponível para este centro.');
    }
}

// Funções principais usando coordenadas (prioridade)
function ligar() {
    if (window.centroTelefone && window.centroTelefone !== 'Telefone não informado') {
        if (confirm('Deseja ligar para ' + window.centroTelefone + '?')) {
            window.location.href = 'tel:' + window.centroTelefone;
        }
    } else {
        alert('Telefone não disponível para este centro.');
    }
}

function verNoMapa() {
    if (window.centroLatitude && window.centroLongitude) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${window.centroLatitude},${window.centroLongitude}`, '_blank');
    } else if (window.centroEndereco) {
        verNoMapaPorEndereco();
    } else {
        alert('Localização não disponível para este centro.');
    }
}

function obterDirecoes() {
    if (window.centroLatitude && window.centroLongitude) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${window.centroLatitude},${window.centroLongitude}`, '_blank');
    } else if (window.centroEndereco) {
        obterDirecoesPorEndereco();
    } else {
        alert('Localização não disponível para este centro.');
    }
}

function abrirWaze() {
    if (window.centroLatitude && window.centroLongitude) {
        window.open(`https://www.waze.com/ul?ll=${window.centroLatitude},${window.centroLongitude}&navigate=yes`, '_blank');
    } else if (window.centroEndereco) {
        abrirWazePorEndereco();
    } else {
        alert('Localização não disponível para este centro.');
    }
}

function compartilharLocalizacao() {
    let texto = window.centroNome + '\n' + (window.centroEndereco || 'Endereço não informado') + ', Nampula';
    if (navigator.share) {
        navigator.share({ title: window.centroNome, text: texto }).catch(() => copiarEndereco());
    } else {
        copiarEndereco();
    }
}

function copiarEndereco() {
    let texto = window.centroNome + '\n' + (window.centroEndereco || 'Endereço não informado') + ', Nampula';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => alert('Endereço copiado!'));
    } else {
        alert(texto);
    }
}

window.addEventListener('DOMContentLoaded', function () {
    carregarDetalhes();
});
