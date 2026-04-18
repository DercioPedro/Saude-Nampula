// sobre.js - Versão simples (recomendada)

async function carregarEstatisticas() {
    try {
        // Buscar dados diretamente da API
        const response = await fetch('http://localhost:5000/api/estatisticas');
        const stats = await response.json();
        
        // Buscar farmácias para contar plantão
        const farmaciasResponse = await fetch('http://localhost:5000/api/farmacias');
        const farmacias = await farmaciasResponse.json();
        const farmaciasPlantao = farmacias.filter(f => f.plantao === true).length;
        
        // Atualizar os números
        document.querySelector('.stat-box:nth-child(1) .stat-number').textContent = stats.hospitais || 0;
        document.querySelector('.stat-box:nth-child(2) .stat-number').textContent = stats.centros || 0;
        document.querySelector('.stat-box:nth-child(3) .stat-number').textContent = stats.farmacias || 0;
        
        // Adicionar tooltip com farmácias de plantão
        const infoBox = document.querySelector('.stat-box:nth-child(4) .stat-number');
        infoBox.textContent = '24/7';
        infoBox.title = `${farmaciasPlantao} farmácias com plantão 24h`;
        
        // Opcional: mostrar detalhe das farmácias
        const farmaciaLabel = document.querySelector('.stat-box:nth-child(3) .stat-label');
        if (farmaciaLabel && farmaciasPlantao > 0) {
            farmaciaLabel.innerHTML = `Farmácias Registadas<br><small style="font-size: 10px; color: #059669;">${farmaciasPlantao} com plantão 24h</small>`;
        }
        
        console.log('✅ Estatísticas atualizadas:', stats);
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Mostrar erro visualmente
        const statsNumbers = document.querySelectorAll('.stat-number');
        statsNumbers.forEach(el => {
            if (el.textContent !== '24/7') {
                el.style.opacity = '0.5';
                el.title = 'Erro ao carregar dados do servidor';
            }
        });
    }
}

// Carregar quando a página abrir
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(carregarEstatisticas, 100);
});