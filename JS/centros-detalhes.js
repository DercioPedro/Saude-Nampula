// centros-detalhes.js - Versão com priorização de coordenadas

function getCentroId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function obterUrlGoogleMaps(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${centro.latitude},${centro.longitude}`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

function obterUrlWaze(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.waze.com/ul?ll=${centro.latitude},${centro.longitude}&navigate=yes`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

function obterUrlDirecoes(centro) {
    if (centro.latitude && centro.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${centro.latitude},${centro.longitude}`;
    } else if (centro.endereco) {
        const enderecoCompleto = encodeURIComponent(centro.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
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
        
        // Atualizar os botões se existirem
        const btnVerMapa = document.querySelector('.btn-mapa');
        const btnObterDirecoes = document.querySelector('.btn-directions');
        const btnWaze = document.querySelector('.btn-waze');
        
        if (btnVerMapa) btnVerMapa.onclick = () => window.open(urlGoogleMaps, '_blank');
        if (btnObterDirecoes) btnObterDirecoes.onclick = () => window.open(urlDirecoes, '_blank');
        if (btnWaze) btnWaze.onclick = () => window.open(urlWaze, '_blank');
        
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
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/search/?api=1&query=' + endereco, '_blank');
    } else {
        alert('Localização não disponível para este centro.');
    }
}

function obterDirecoes() {
    if (window.centroLatitude && window.centroLongitude) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${window.centroLatitude},${window.centroLongitude}`, '_blank');
    } else if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/dir/?api=1&destination=' + endereco, '_blank');
    } else {
        alert('Localização não disponível para este centro.');
    }
}

function abrirWaze() {
    if (window.centroLatitude && window.centroLongitude) {
        window.open(`https://www.waze.com/ul?ll=${window.centroLatitude},${window.centroLongitude}&navigate=yes`, '_blank');
    } else if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.waze.com/ul?q=' + endereco + '&navigate=yes', '_blank');
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
