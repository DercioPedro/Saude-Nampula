function realizarBusca() {
    const inputBusca = document.getElementById('input-busca');
    const termoBusca = inputBusca ? inputBusca.value.toLowerCase().trim() : '';

    if (!termoBusca) {
        alert('Por favor, digite algo para buscar');
        return;
    }

    if (termoBusca.includes('hospital')) {
        window.location.href = '/hospital';
    } else if (termoBusca.includes('centro') || termoBusca.includes('saúde') || termoBusca.includes('saude')) {
        window.location.href = '/centros';
    } else if (termoBusca.includes('farmácia') || termoBusca.includes('farmacia')) {
        window.location.href = '/farm';
    } else if (termoBusca.includes('emergência') || termoBusca.includes('emergencia')) {
        window.location.href = '/emer';
    } else {
        const bairros = ['mucatine', 'muhala', 'namicopo', 'centro', 'marrere', 'napipine', 'muatala', 'moma', 'natikiri'];
        const bairroEncontrado = bairros.find(function (b) {
            return termoBusca.includes(b);
        });

        if (bairroEncontrado) {
            window.location.href = '/centros?bairro=' + encodeURIComponent(bairroEncontrado);
        } else {
            alert('Não encontramos resultados para: ' + termoBusca);
        }
    }
}

function buscarComEnter(event) {
    if (event.key === 'Enter') {
        realizarBusca();
    }
}

function ligarEmergencia() {
    const confirmar = confirm('Deseja ligar para o número de emergência 119?');
    if (confirmar) {
        window.location.href = '/emer';
    }
}

function navegarPara(pagina) {
    window.location.href = pagina;
}

try {
    const anoEl = document.getElementById('ano');
    if (anoEl) {
        anoEl.textContent = new Date().getFullYear();
    }
} catch (error) {
    console.error('Erro ao definir o ano no footer:', error);
}

document.addEventListener('DOMContentLoaded', function () {
    const inputBusca = document.getElementById('input-busca');
    if (inputBusca) {
        inputBusca.addEventListener('keypress', buscarComEnter);
    }
});
