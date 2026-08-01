// notificacoes.js - Sistema de notificações automáticas

(function() {
    'use strict';

    // ========================================
    // CONFIGURAÇÃO
    // ========================================

    var CONFIG = {
        intervaloVerificacao: 300000, // 5 minutos
        ultimoStatusKey: 'sn_ultimo_status',
        ultimaPublicacaoKey: 'sn_ultima_publicacao',
        ultimoPlantaoKey: 'sn_ultimo_plantao'
    };

    var API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://saude-nampula-backend.onrender.com/api';

    // ========================================
    // PERMISSÃO
    // ========================================

    function pedirPermissao() {
        if (!('Notification' in window)) {
            console.log('Notificações não suportadas neste navegador');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permissao) {
                if (permissao === 'granted') {
                    console.log('Notificações permitidas!');
                    enviarNotificacao('🔔 Ativado!', 'Você receberá notificações de atualizações do Saúde Nampula.');
                }
            });
        }

        return false;
    }

    // ========================================
    // ENVIAR NOTIFICAÇÃO
    // ========================================

    function enviarNotificacao(titulo, mensagem, url) {
        if (Notification.permission !== 'granted') return;

        var notificacao = new Notification(titulo, {
            body: mensagem,
            icon: '/img/monitor.png',
            tag: Date.now().toString(),
            requireInteraction: true,
            silent: false
        });

        if (url) {
            notificacao.onclick = function() {
                window.open(url, '_blank');
            };
        }

        setTimeout(function() {
            notificacao.close();
        }, 15000);
    }

    // ========================================
    // VERIFICAR MUDANÇAS DE STATUS
    // ========================================

    async function verificarMudancasStatus() {
        try {
            var farmacias = await apiRequest('/farmacias');
            var statusAnterior = obterStorage(CONFIG.ultimoStatusKey) || {};
            var mudancas = [];

            for (var i = 0; i < farmacias.length; i++) {
                var farmacia = farmacias[i];
                var statusAtual = verificarStatusFarmacia(farmacia);
                var statusAntigo = statusAnterior[farmacia.id];

                // Ignorar plantão 24h (já são notificados separadamente)
                if (farmacia.plantao === true) continue;

                if (statusAntigo && statusAntigo.aberto !== statusAtual.aberto) {
                    // Houve mudança
                    var msg = statusAtual.aberto 
                        ? farmacia.nome + ' está ABERTA agora! 🟢'
                        : farmacia.nome + ' está FECHADA. 🔴';
                    
                    mudancas.push({
                        titulo: 'Status atualizado',
                        mensagem: msg,
                        url: '/detalhes-farmacia?farmacia=' + encodeURIComponent(farmacia.nome) + '&id=' + farmacia.id
                    });
                }
            }

            // Salvar status atual
            var novoStatus = {};
            for (var j = 0; j < farmacias.length; j++) {
                novoStatus[farmacias[j].id] = verificarStatusFarmacia(farmacias[j]);
            }
            salvarStorage(CONFIG.ultimoStatusKey, novoStatus);

            // Enviar notificações
            for (var k = 0; k < mudancas.length; k++) {
                enviarNotificacao(mudancas[k].titulo, mudancas[k].mensagem, mudancas[k].url);
            }

        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVAS PUBLICAÇÕES
    // ========================================

    async function verificarNovasPublicacoes() {
        try {
            var response = await fetch(API_URL + '/publicacoes');
            var publicacoes = await response.json();

            if (!publicacoes || publicacoes.length === 0) return;

            var ultimaPublicacao = obterStorage(CONFIG.ultimaPublicacaoKey);
            var ultima = publicacoes[0]; // Mais recente

            if (!ultimaPublicacao || ultima.id > ultimaPublicacao) {
                var categoriaIcon = {
                    'Noticia': '📰',
                    'Dica': '💡',
                    'Alerta': '⚠️',
                    'Evento': '📅',
                    'Campanha': '🏥',
                    'Informacao': 'ℹ️'
                };

                var icone = categoriaIcon[ultima.categoria] || '📌';
                var titulo = icone + ' ' + ultima.categoria;

                enviarNotificacao(
                    titulo,
                    ultima.titulo,
                    '/dicas?abrir=' + ultima.id
                );

                salvarStorage(CONFIG.ultimaPublicacaoKey, ultima.id);
            }

        } catch (error) {
            console.error('Erro ao verificar publicações:', error);
        }
    }

    // ========================================
    // VERIFICAR FARMÁCIAS EM PLANTÃO
    // ========================================

    async function verificarPlantao() {
        try {
            var farmacias = await apiRequest('/farmacias');
            var plantaoAnterior = obterStorage(CONFIG.ultimoPlantaoKey) || [];

            var plantaoAtual = farmacias.filter(function(f) {
                return f.plantao === true;
            });

            for (var i = 0; i < plantaoAtual.length; i++) {
                var farmacia = plantaoAtual[i];
                var jaNotificado = plantaoAnterior.some(function(f) {
                    return f.id === farmacia.id;
                });

                if (!jaNotificado) {
                    enviarNotificacao(
                        '🟢 Farmácia em Plantão',
                        farmacia.nome + ' está aberta 24h!',
                        '/detalhes-farmacia?farmacia=' + encodeURIComponent(farmacia.nome) + '&id=' + farmacia.id
                    );
                }
            }

            salvarStorage(CONFIG.ultimoPlantaoKey, plantaoAtual);

        } catch (error) {
            console.error('Erro ao verificar plantão:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVOS ESTABELECIMENTOS
    // ========================================

    async function verificarNovosEstabelecimentos() {
        try {
            var farmacias = await apiRequest('/farmacias');
            var anteriores = obterStorage('sn_farmacias_anteriores') || [];

            if (anteriores.length > 0 && farmacias.length > anteriores.length) {
                var novas = farmacias.filter(function(f) {
                    return !anteriores.some(function(a) { return a.id === f.id; });
                });

                for (var i = 0; i < novas.length; i++) {
                    enviarNotificacao(
                        '🏥 Nova Farmácia',
                        'Conheça ' + novas[i].nome + ' - ' + (novas[i].endereco || 'Nampula'),
                        '/detalhes-farmacia?farmacia=' + encodeURIComponent(novas[i].nome) + '&id=' + novas[i].id
                    );
                }
            }

            salvarStorage('sn_farmacias_anteriores', farmacias);

        } catch (error) {
            console.error('Erro ao verificar novos estabelecimentos:', error);
        }
    }

    // ========================================
    // STORAGE HELPERS
    // ========================================

    function obterStorage(chave) {
        try {
            var dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch {
            return null;
        }
    }

    function salvarStorage(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (e) {
            console.warn('Erro ao salvar storage:', e);
        }
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    function init() {
        // Pedir permissão
        pedirPermissao();

        // Verificar imediatamente
        setTimeout(function() {
            verificarMudancasStatus();
            verificarNovasPublicacoes();
            verificarPlantao();
            verificarNovosEstabelecimentos();
        }, 3000);

        // Verificar periodicamente
        setInterval(function() {
            verificarMudancasStatus();
            verificarNovasPublicacoes();
            verificarPlantao();
            verificarNovosEstabelecimentos();
        }, CONFIG.intervaloVerificacao);
    }

    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // EXPORTAR
    // ========================================

    window.notificacoes = {
        enviar: enviarNotificacao,
        pedirPermissao: pedirPermissao
    };

})();
