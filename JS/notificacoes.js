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

    function obterStatusPermissao() {
        if (!('Notification' in window)) {
            return 'nao-suportado';
        }
        return Notification.permission;
    }

    function pedirPermissao() {
        if (!('Notification' in window)) {
            console.log('Notificações não suportadas neste navegador');
            return Promise.resolve('nao-suportado');
        }

        if (Notification.permission === 'granted') {
            console.log('Notificações já permitidas');
            return Promise.resolve('granted');
        }

        if (Notification.permission === 'denied') {
            console.log('Notificações negadas pelo usuário');
            return Promise.resolve('denied');
        }

        // Se não foi nem permitido nem negado, pedir permissão
        console.log('A pedir permissão para notificações...');
        return Notification.requestPermission();
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

            var ultima = farmacias[farmacias.length - 1];

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
    // CRIAR BOTÃO DE ATIVAÇÃO
    // ========================================

    function criarBotaoAtivacao() {
        // Verificar se o botão já existe
        if (document.getElementById('btnAtivarNotificacoes')) return;

        // Verificar se já tem permissão
        if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

        var botao = document.createElement('button');
        botao.id = 'btnAtivarNotificacoes';
        botao.textContent = '🔔 Ativar Notificações';
        botao.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #7c3aed;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 50px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s;
            animation: pulse-notificacao 2s ease-in-out infinite;
        `;

        // Estilo do hover
        botao.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 24px rgba(124, 58, 237, 0.6)';
        };
        botao.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.4)';
        };

        botao.onclick = function() {
            pedirPermissao().then(function(permissao) {
                if (permissao === 'granted') {
                    botao.textContent = '✅ Notificações ativadas';
                    botao.style.background = '#059669';
                    botao.style.animation = 'none';
                    setTimeout(function() {
                        botao.style.display = 'none';
                    }, 3000);
                } else {
                    botao.textContent = '❌ Permissão negada';
                    botao.style.background = '#dc2626';
                    setTimeout(function() {
                        botao.textContent = '🔔 Ativar Notificações';
                        botao.style.background = '#7c3aed';
                    }, 3000);
                }
            });
        };

        document.body.appendChild(botao);

        // Adicionar CSS da animação
        var style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-notificacao {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    function iniciar() {
        // Verificar status da permissão
        var status = obterStatusPermissao();

        if (status === 'granted') {
            console.log('Notificações já permitidas. A verificar atualizações...');
            // Começar a verificar imediatamente
            setTimeout(function() {
                verificarNovasPublicacoes();
                verificarNovasFarmacias();
                verificarNovosHospitais();
                verificarNovosCentros();
            }, 3000);

            setInterval(function() {
                verificarNovasPublicacoes();
                verificarNovasFarmacias();
                verificarNovosHospitais();
                verificarNovosCentros();
            }, CONFIG.intervaloVerificacao);
        } else if (status === 'denied') {
            console.log('Notificações negadas pelo usuário.');
        } else {
            // Permissão ainda não foi pedida
            console.log('A aguardar permissão do usuário...');
            
            // Criar botão para ativar
            setTimeout(criarBotaoAtivacao, 2000);

            // Tentar pedir permissão automaticamente após 5 segundos
            setTimeout(function() {
                pedirPermissao().then(function(permissao) {
                    if (permissao === 'granted') {
                        // Remover botão se existir
                        var btn = document.getElementById('btnAtivarNotificacoes');
                        if (btn) btn.style.display = 'none';
                        
                        // Iniciar verificações
                        setTimeout(function() {
                            verificarNovasPublicacoes();
                            verificarNovasFarmacias();
                            verificarNovosHospitais();
                            verificarNovosCentros();
                        }, 3000);

                        setInterval(function() {
                            verificarNovasPublicacoes();
                            verificarNovasFarmacias();
                            verificarNovosHospitais();
                            verificarNovosCentros();
                        }, CONFIG.intervaloVerificacao);
                    }
                });
            }, 5000);
        }
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
        pedirPermissao: pedirPermissao,
        ativar: function() {
            pedirPermissao().then(function(permissao) {
                if (permissao === 'granted') {
                    var btn = document.getElementById('btnAtivarNotificacoes');
                    if (btn) btn.style.display = 'none';
                }
            });
        }
    };

})();
