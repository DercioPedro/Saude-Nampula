// notificacoes.js - Sistema de notificações automáticas para todo o site

(function() {
    'use strict';

    // ========================================
    // CONFIGURAÇÃO
    // ========================================

    var CONFIG = {
        intervaloVerificacao: 300000, // 5 minutos
        ultimaPublicacaoKey: 'sn_ultima_publicacao',
        ultimaFarmaciaKey: 'sn_ultima_farmacia',
        ultimoHospitalKey: 'sn_ultimo_hospital',
        ultimoCentroKey: 'sn_ultimo_centro'
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
            console.log('Notificações já permitidas');
            return true;
        }

        if (Notification.permission === 'denied') {
            console.log('Notificações negadas pelo usuário');
            return false;
        }

        Notification.requestPermission().then(function(permissao) {
            if (permissao === 'granted') {
                console.log('Notificações permitidas!');
                enviarNotificacao(
                    '🔔 Notificações ativadas',
                    'Você receberá atualizações do Saúde Nampula em tempo real.'
                );
            } else {
                console.log('Notificações negadas');
            }
        });

        return false;
    }

    // ========================================
    // ENVIAR NOTIFICAÇÃO
    // ========================================

    function enviarNotificacao(titulo, mensagem, url) {
        if (Notification.permission !== 'granted') return;

        try {
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
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVAS PUBLICAÇÕES
    // ========================================

    async function verificarNovasPublicacoes() {
        try {
            var response = await fetch(API_URL + '/publicacoes');
            
            if (!response.ok) {
                console.warn('Erro ao buscar publicações:', response.status);
                return;
            }
            
            var publicacoes = await response.json();

            if (!publicacoes || publicacoes.length === 0) return;

            var ultimaPublicacao = localStorage.getItem(CONFIG.ultimaPublicacaoKey);
            var ultima = publicacoes[0];

            if (!ultimaPublicacao || ultima.id > parseInt(ultimaPublicacao)) {
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

                localStorage.setItem(CONFIG.ultimaPublicacaoKey, ultima.id);
            }

        } catch (error) {
            console.error('Erro ao verificar publicações:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVAS FARMÁCIAS
    // ========================================

    async function verificarNovasFarmacias() {
        try {
            var response = await fetch(API_URL + '/farmacias');
            
            if (!response.ok) {
                console.warn('Erro ao buscar farmácias:', response.status);
                return;
            }
            
            var farmacias = await response.json();
            var ultimaFarmacia = localStorage.getItem(CONFIG.ultimaFarmaciaKey);
            
            if (farmacias.length === 0) return;

            var ultima = farmacias[farmacias.length - 1]; // Última adicionada

            if (!ultimaFarmacia || ultima.id > parseInt(ultimaFarmacia)) {
                enviarNotificacao(
                    '🏥 Nova Farmácia',
                    ultima.nome + ' foi adicionada à plataforma!',
                    '/detalhes-farmacia?farmacia=' + encodeURIComponent(ultima.nome) + '&id=' + ultima.id
                );

                localStorage.setItem(CONFIG.ultimaFarmaciaKey, ultima.id);
            }

        } catch (error) {
            console.error('Erro ao verificar novas farmácias:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVOS HOSPITAIS
    // ========================================

    async function verificarNovosHospitais() {
        try {
            var response = await fetch(API_URL + '/hospitais');
            
            if (!response.ok) {
                console.warn('Erro ao buscar hospitais:', response.status);
                return;
            }
            
            var hospitais = await response.json();
            var ultimoHospital = localStorage.getItem(CONFIG.ultimoHospitalKey);
            
            if (hospitais.length === 0) return;

            var ultimo = hospitais[hospitais.length - 1];

            if (!ultimoHospital || ultimo.id > parseInt(ultimoHospital)) {
                enviarNotificacao(
                    '🏨 Novo Hospital',
                    ultimo.nome + ' foi adicionado à plataforma!',
                    '/hospital-detalhes?id=' + ultimo.id
                );

                localStorage.setItem(CONFIG.ultimoHospitalKey, ultimo.id);
            }

        } catch (error) {
            console.error('Erro ao verificar novos hospitais:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVOS CENTROS
    // ========================================

    async function verificarNovosCentros() {
        try {
            var response = await fetch(API_URL + '/centros');
            
            if (!response.ok) {
                console.warn('Erro ao buscar centros:', response.status);
                return;
            }
            
            var centros = await response.json();
            var ultimoCentro = localStorage.getItem(CONFIG.ultimoCentroKey);
            
            if (centros.length === 0) return;

            var ultimo = centros[centros.length - 1];

            if (!ultimoCentro || ultimo.id > parseInt(ultimoCentro)) {
                enviarNotificacao(
                    '🏥 Novo Centro de Saúde',
                    ultimo.nome + ' foi adicionado à plataforma!',
                    '/centros-detalhes?id=' + ultimo.id
                );

                localStorage.setItem(CONFIG.ultimoCentroKey, ultimo.id);
            }

        } catch (error) {
            console.error('Erro ao verificar novos centros:', error);
        }
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    function iniciar() {
        // Pedir permissão
        pedirPermissao();

        // Verificar imediatamente após 3 segundos
        setTimeout(function() {
            verificarNovasPublicacoes();
            verificarNovasFarmacias();
            verificarNovosHospitais();
            verificarNovosCentros();
        }, 3000);

        // Verificar periodicamente
        setInterval(function() {
            verificarNovasPublicacoes();
            verificarNovasFarmacias();
            verificarNovosHospitais();
            verificarNovosCentros();
        }, CONFIG.intervaloVerificacao);
    }

    // ========================================
    // INICIAR
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(iniciar, 1000);
        });
    } else {
        setTimeout(iniciar, 1000);
    }

    // ========================================
    // EXPORTAR
    // ========================================

    window.notificacoes = {
        enviar: enviarNotificacao,
        pedirPermissao: pedirPermissao
    };

})();
