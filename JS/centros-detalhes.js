// centros-detalhes.js - Versão corrigida (funciona apenas com coordenadas)

function getCentroId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Função para verificar se tem coordenadas válidas
function temCoordenadas(centro) {
    return centro.latitude && centro.longitude && 
           !isNaN(centro.latitude) && !isNaN(centro.longitude) &&
           centro.latitude !== 0 && centro.longitude !== 0;
}

// Função para obter URL do Google Maps (usa coordenadas ou endereço)
function obterUrlGoogleMaps(centro) {
    if (temCoordenadas(centro)) {
        return `https://www.google.com/maps/search/?api=1&query=${centro.latitude},${centro.longitude}`;
    }
    if (centro.endereco && centro.endereco !== 'Endereço não informado') {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return null;
}

// Função para obter URL do Waze
function obterUrlWaze(centro) {
    if (temCoordenadas(centro)) {
        return `https://www.waze.com/ul?ll=${centro.latitude},${centro.longitude}&navigate=yes`;
    }
    if (centro.endereco && centro.endereco !== 'Endereço não informado') {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return null;
}

// Função para obter URL de direções
function obterUrlDirecoes(centro) {
    if (temCoordenadas(centro)) {
        return `https://www.google.com/maps/dir/?api=1&destination=${centro.latitude},${centro.longitude}`;
    }
    if (centro.endereco && centro.endereco !== 'Endereço não informado') {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return null;
}

// Obter texto de localização para exibição
function obterTextoLocalizacao(centro) {
    if (temCoordenadas(centro)) {
        return ` Coordenadas: ${centro.latitude}, ${centro.longitude}`;
    }
    if (centro.endereco && centro.endereco !== 'Endereço não informado') {
        return ` ${centro.endereco}, Nampula`;
    }
    return ' Localização não informada';
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
        
        // Preencher informações básicas
        document.getElementById('breadcrumb-nome').textContent = centro.nome;
        document.getElementById('centro-nome').textContent = centro.nome;
        document.getElementById('centro-bairro').textContent = pegarNomeBairro(centro.endereco);
        document.getElementById('centro-horario').textContent = centro.horario || 'Horário não informado';
        document.getElementById('centro-telefone').textContent = centro.telefone || 'Telefone não informado';
        
        // Endereço (pode estar vazio se tiver coordenadas)
        const enderecoElement = document.getElementById('centro-endereco');
        if (enderecoElement) {
            if (temCoordenadas(centro)) {
                enderecoElement.textContent = `Coordenadas: ${centro.latitude}, ${centro.longitude}`;
            } else {
                enderecoElement.textContent = centro.endereco || 'Endereço não informado';
            }
        }
        
        // Texto completo da localização
        const enderecoCompletoElement = document.getElementById('endereco-completo');
        if (enderecoCompletoElement) {
            enderecoCompletoElement.textContent = obterTextoLocalizacao(centro);
        }
        
        // Atualizar seção de mapa com prioridade para coordenadas
        atualizarSecaoMapa(centro);
        
        // Carregar serviços
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
        
        // Salvar dados globalmente
        window.centroTelefone = centro.telefone;
        window.centroNome = centro.nome;
        window.centroEndereco = centro.endereco;
        window.centroLatitude = centro.latitude;
        window.centroLongitude = centro.longitude;
        window.centroTemCoordenadas = temCoordenadas(centro);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do centro de saúde');
        window.location.href = 'centros.html';
    }
}

function atualizarSecaoMapa(centro) {
    const mapaSection = document.querySelector('.map-card');
    if (!mapaSection) return;
    
    const temCoord = temCoordenadas(centro);
    const urlMapa = obterUrlGoogleMaps(centro);
    const urlWaze = obterUrlWaze(centro);
    const urlDirecoes = obterUrlDirecoes(centro);
    const textoLocalizacao = obterTextoLocalizacao(centro);
    
    let botoesHTML = '';
    
    // if (urlMapa) {
    //     botoesHTML += `<button class="btn-mapa" onclick="window.open('${urlMapa}', '_blank')" style="flex:1; background:#ea4335; text-align:center; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer;"> Ver no Mapa</button>`;
    // }
    // if (urlDirecoes) {
    //     botoesHTML += `<button class="btn-directions" onclick="window.open('${urlDirecoes}', '_blank')" style="flex:1; background:#4285F4; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer;"> Como Chegar</button>`;
    // }
    // // if (urlWaze) {
    //     botoesHTML += `<button class="btn-waze" onclick="window.open('${urlWaze}', '_blank')" style="flex:1; background:#33CCFF; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer;"> Waze</button>`;
    // }
    
    if (!botoesHTML) {
        botoesHTML = '<p style="color:#ef4444;">⚠️ Localização não disponível para este centro</p>';
    }
    
    // Atualizar o conteúdo da seção de mapa
    const mapPlaceholder = mapaSection.querySelector('.map-placeholder') || mapaSection;
    mapPlaceholder.innerHTML = `
        <div class="map-icon"><img src="/img/ponto.png" alt=""></div>
        <p><strong>${temCoord ? ' Localização exata (GPS)' : ' Endereço'}</strong></p>
        <p>${textoLocalizacao}</p>
        <div class="map-actions" style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
            ${botoesHTML}
        </div>
    `;
    
    // Adicionar badge se tiver coordenadas
    if (temCoord && !document.querySelector('.coordenadas-badge')) {
        const title = mapaSection.querySelector('h2');
        if (title) {
            const badge = document.createElement('span');
            badge.className = 'coordenadas-badge';
            badge.style.cssText = 'background: #059669; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;';
            badge.innerHTML = ' GPS';
            title.appendChild(badge);
        }
    }
}

function pegarNomeBairro(endereco) {
    if (!endereco || endereco === 'Endereço não informado') return 'Nampula';
    let bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine'];
    let enderecoLower = endereco.toLowerCase();
    
    for (let i = 0; i < bairros.length; i++) {
        if (enderecoLower.includes(bairros[i])) {
            return 'Bairro ' + bairros[i].charAt(0).toUpperCase() + bairros[i].slice(1);
        }
    }
    return endereco.split(',')[0] || 'Nampula';
}

// Funções principais
function ligar() {
    if (window.centroTelefone && window.centroTelefone !== 'Telefone não informado') {
        if (confirm('Deseja ligar para ' + window.centroTelefone + '?')) {
            window.location.href = 'tel:' + window.centroTelefone;
        }
    } else {
        alert('Telefone não disponível para este centro.');
    }
}

function compartilharLocalizacao() {
    let texto = window.centroNome + '\n';
    if (window.centroTemCoordenadas) {
        texto += `Coordenadas: ${window.centroLatitude}, ${window.centroLongitude}`;
    } else if (window.centroEndereco && window.centroEndereco !== 'Endereço não informado') {
        texto += window.centroEndereco + ', Nampula';
    } else {
        texto += 'Localização não disponível';
    }
    
    if (navigator.share) {
        navigator.share({ title: window.centroNome, text: texto }).catch(() => copiarTexto(texto));
    } else {
        copiarTexto(texto);
    }
}

function copiarTexto(texto) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => alert('Localização copiada!'));
    } else {
        alert(texto);
    }
}

window.addEventListener('DOMContentLoaded', function () {
    carregarDetalhes();
});
