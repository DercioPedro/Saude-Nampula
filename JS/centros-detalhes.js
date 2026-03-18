// pegar id do centro da URL
function getCentroId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// carregar detalhes
function carregarDetalhes() {
    let id = getCentroId();

    if (!id) {
        alert('Centro de saúde não encontrado!');
        window.location.href = 'centros.html';
        return;
    }

    let dados = localStorage.getItem('centros');
    let centros = dados ? JSON.parse(dados) : [];

    let centro = null;
    for (let i = 0; i < centros.length; i++) {
        if (centros[i].id == id) {
            centro = centros[i];
            break;
        }
    }

    if (!centro) {
        alert('Centro de saúde não encontrado!');
        window.location.href = 'centros.html';
        return;
    }

    // preencher dados basicos
    document.getElementById('breadcrumb-nome').textContent = centro.nome;
    document.getElementById('centro-nome').textContent = centro.nome;
    document.getElementById('centro-bairro').textContent = pegarNomeBairro(centro.endereco);
    document.getElementById('centro-horario').textContent = centro.horario;
    document.getElementById('centro-endereco').textContent = centro.endereco;
    document.getElementById('centro-telefone').textContent = centro.telefone;
    document.getElementById('endereco-completo').textContent = centro.endereco + ', Nampula';

    // preencher servicos
    let servicosGrid = document.getElementById('servicos-grid');
    servicosGrid.innerHTML = '';

    if (centro.servicos) {
        let servicos = centro.servicos.split(',');

        // icones para cada servico
        let iconesServicos = {
            'consultas gerais': '<img src="img/stete.png" alt="">',
            'vacinação': '<img src="img/vacina.png" alt="">',
            'pré-natal': '<img src="img/gravida.png" alt="">',
            'planeamento familiar': '<img src="img/family.png" alt="">',
            'pediatria': '👶',
            'maternidade': '🤱',
            'teste de hiv': '🧪',
            'saúde materno-infantil': '👶',
            'tratamento de malária': '🦟',
            'primeiros socorros': '🚑',
            'consultas especializadas': '👨‍⚕️',
            'laboratório': '🔬',
            'farmácia': '<img src="img/comprimidos.png" alt="">',
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
                item.innerHTML = `
                    <div class="servico-item-icon">${icone}</div>
                    <strong>${servico}</strong>
                `;
                servicosGrid.appendChild(item);
            }
        }
    } else {
        servicosGrid.innerHTML = '<p class="loading-text">Nenhum serviço cadastrado</p>';
    }

    // guardar dados globalmente
    window.centroTelefone = centro.telefone;
    window.centroNome = centro.nome;
    window.centroEndereco = centro.endereco;
}

function pegarNomeBairro(endereco) {
    let bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine'];
    let enderecoLower = endereco.toLowerCase();

    for (let i = 0; i < bairros.length; i++) {
        if (enderecoLower.includes(bairros[i])) {
            return 'Bairro ' + bairros[i].charAt(0).toUpperCase() + bairros[i].slice(1);
        }
    }

    return endereco.split(',')[0] || 'Nampula';
}

// ligar
function ligar() {
    if (window.centroTelefone) {
        if (confirm('Deseja ligar para ' + window.centroTelefone + '?')) {
            window.location.href = 'tel:' + window.centroTelefone;
        }
    }
}

// ver no mapa
function verNoMapa() {
    if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/search/?api=1&query=' + endereco, '_blank');
    }
}

// obter direcoes
function obterDirecoes() {
    if (window.centroEndereco) {
        let endereco = encodeURIComponent(window.centroEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/dir/?api=1&destination=' + endereco, '_blank');
    }
}

// compartilhar localizacao
function compartilharLocalizacao() {
    let texto = window.centroNome + '\n' + window.centroEndereco + ', Nampula';

    if (navigator.share) {
        navigator.share({
            title: window.centroNome,
            text: texto
        }).catch(function (err) {
            copiarEndereco();
        });
    } else {
        copiarEndereco();
    }
}

function copiarEndereco() {
    let texto = window.centroNome + '\n' + window.centroEndereco + ', Nampula';

    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function () {
            alert('Endereço copiado!');
        });
    } else {
        alert(texto);
    }
}

// carregar quando pagina carregar
window.addEventListener('DOMContentLoaded', function () {
    carregarDetalhes();
});
