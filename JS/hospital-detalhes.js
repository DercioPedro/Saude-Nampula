// hospital-detalhes.js - Versão com API

function getHospitalId() {
    let params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function carregarDetalhes() {
    let id = getHospitalId();
    
    if (!id) {
        alert('Hospital não encontrado!');
        window.location.href = 'hospital.html';
        return;
    }
    
    try {
        const hospital = await apiRequest(`/hospitais/${id}`);
        
        document.getElementById('breadcrumb-nome').textContent = hospital.nome;
        document.getElementById('hospital-nome').textContent = hospital.nome;
        document.getElementById('hospital-horario').textContent = hospital.horario;
        document.getElementById('hospital-endereco').textContent = hospital.endereco;
        document.getElementById('hospital-telefone').textContent = hospital.telefone;
        
        let servicosDiv = document.getElementById('servicos-list');
        servicosDiv.innerHTML = '';
        
        if (hospital.servicos) {
            let servicos = hospital.servicos.split(',');
            for (let i = 0; i < servicos.length; i++) {
                let servico = servicos[i].trim();
                if (servico) {
                    let tag = document.createElement('div');
                    tag.className = 'servico-tag';
                    tag.textContent = servico;
                    servicosDiv.appendChild(tag);
                }
            }
        } else {
            servicosDiv.innerHTML = '<p class="loading-text">Nenhum serviço cadastrado</p>';
        }
        
        window.hospitalTelefone = hospital.telefone;
        window.hospitalNome = hospital.nome;
        window.hospitalEndereco = hospital.endereco;
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do hospital');
        window.location.href = 'hospital.html';
    }
}

function ligar() {
    if (window.hospitalTelefone) {
        if (confirm('Deseja ligar para ' + window.hospitalTelefone + '?')) {
            window.location.href = 'tel:' + window.hospitalTelefone;
        }
    }
}

function verNoMapa() {
    if (window.hospitalEndereco) {
        let endereco = encodeURIComponent(window.hospitalEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/search/?api=1&query=' + endereco, '_blank');
    }
}

function obterDirecoes() {
    if (window.hospitalEndereco) {
        let endereco = encodeURIComponent(window.hospitalEndereco + ', Nampula, Mozambique');
        window.open('https://www.google.com/maps/dir/?api=1&destination=' + endereco, '_blank');
    }
}

function compartilhar() {
    let url = window.location.href;
    let texto = 'Confira este hospital: ' + window.hospitalNome;
    
    if (navigator.share) {
        navigator.share({ title: window.hospitalNome, text: texto, url: url }).catch(() => copiarLink());
    } else {
        copiarLink();
    }
}

function copiarLink() {
    let url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => alert('Link copiado!'));
    } else {
        let input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Link copiado!');
    }
}

window.addEventListener('DOMContentLoaded', function () {
    carregarDetalhes();
});