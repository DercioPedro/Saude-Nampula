// update-home-counters.js - Versão com API

async function atualizarContadores() {
    try {
        const stats = await apiRequest('/estatisticas');
        
        let numHospitais = document.querySelector('.card-blue .card-count');
        if (numHospitais) numHospitais.textContent = stats.hospitais;
        
        let numCentros = document.querySelector('.card-emerald .card-count');
        if (numCentros) numCentros.textContent = stats.centros;
        
        let numFarmacias = document.querySelector('.card-purple .card-count');
        if (numFarmacias) numFarmacias.textContent = stats.farmacias;
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    atualizarContadores();
});