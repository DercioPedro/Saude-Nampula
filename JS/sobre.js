// sobre.js - Versão corrigida (usa api-config.js)

async function carregarEstatisticas() {
    try {
        // Usar apiRequest em vez de fetch direto para localhost
        const stats = await apiRequest('/estatisticas');
        
        // Buscar farmácias para contar plantão
        const farmacias = await apiRequest('/farmacias');
        const farmaciasPlantao = farmacias.filter(f => f.plantao === true).length;
        
        // Atualizar os números
        const hospitaisElement = document.querySelector('.stat-box:nth-child(1) .stat-number');
        const centrosElement = document.querySelector('.stat-box:nth-child(2) .stat-number');
        const farmaciasElement = document.querySelector('.stat-box:nth-child(3) .stat-number');
        const infoBox = document.querySelector('.stat-box:nth-child(4) .stat-number');
        
        if (hospitaisElement) hospitaisElement.textContent = stats.hospitais || 0;
        if (centrosElement) centrosElement.textContent = stats.centros || 0;
        if (farmaciasElement) farmaciasElement.textContent = stats.farmacias || 0;
        
        // Adicionar tooltip com farmácias de plantão
        if (infoBox) {
            infoBox.textContent = '24/7';
            infoBox.title = `${farmaciasPlantao} farmácias com plantão 24h`;
        }
        
        // Mostrar detalhe das farmácias com plantão
        const farmaciaLabel = document.querySelector('.stat-box:nth-child(3) .stat-label');
        if (farmaciaLabel && farmaciasPlantao > 0) {
            farmaciaLabel.innerHTML = `Farmácias Registadas<br><small style="font-size: 10px; color: #059669;">${farmaciasPlantao} com plantão 24h</small>`;
        }
        
        // console.log('✅ Estatísticas atualizadas:', stats);
        
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
        
        // Mostrar mensagem amigável
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 10px 20px; border-radius: 8px; font-size: 12px; z-index: 9999;';
        errorMsg.innerHTML = '⚠️ Erro ao carregar estatísticas.';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 5000);
    }
}

// Carregar quando a página abrir
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o apiRequest está disponível
    if (typeof apiRequest === 'undefined') {
        // console.error('apiRequest não encontrado! Verifique se api-config.js foi carregado.');
        return;
    }
    
    setTimeout(carregarEstatisticas, 100);
});
