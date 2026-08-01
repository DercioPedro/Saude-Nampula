// notificacoes.js - Sistema de notificações com reset

(function() {
    'use strict';

    // ========================================
    // FORÇAR RESET DA PERMISSÃO
    // ========================================

    // Remover qualquer permissão gravada para este site
    function resetarPermissao() {
        // Limpar localStorage relacionado a notificações
        var chaves = [
            'sn_ultima_publicacao',
            'sn_ultima_farmacia',
            'sn_ultimo_hospital',
            'sn_ultimo_centro',
            'sn_ultimo_status'
        ];
        
        for (var i = 0; i < chaves.length; i++) {
            localStorage.removeItem(chaves[i]);
        }
        
        console.log('Permissões resetadas! Recarregue a página.');
    }

    // ========================================
    // VERIFICAR SE PODE PEDIR PERMISSÃO
    // ========================================

    function podePedirPermissao() {
        if (!('Notification' in window)) {
            console.log('Notificações não suportadas');
            return false;
        }

        // Se já foi negado, só pode pedir novamente se o usuário clicar
        if (Notification.permission === 'denied') {
            console.log('Permissão negada anteriormente. Clique no botão para pedir novamente.');
            return false;
        }

        return true;
    }

    // ========================================
    // PEDIR PERMISSÃO COM FALLBACK
    // ========================================

    function pedirPermissao() {
        return new Promise(function(resolve) {
            if (!('Notification' in window)) {
                resolve('nao-suportado');
                return;
            }

            // Se já está concedida
            if (Notification.permission === 'granted') {
                console.log('Notificações já permitidas ✅');
                resolve('granted');
                return;
            }

            // Se foi negada, mostrar mensagem e tentar com botão
            if (Notification.permission === 'denied') {
                console.log('⚠️ Permissão negada anteriormente.');
                console.log('💡 Para ativar:');
                console.log('   Chrome: Clique no cadeado 🔒 → Permissões → Notificações → Permitir');
                console.log('   Firefox: Clique no cadeado 🔒 → Limpar dados → Recarregue');
                resolve('denied');
                return;
            }

            // Pedir permissão
            console.log('📢 A pedir permissão para notificações...');
            Notification.requestPermission().then(function(resultado) {
                if (resultado === 'granted') {
                    console.log('✅ Notificações permitidas!');
                    resolve('granted');
                } else {
                    console.log('❌ Notificações negadas.');
                    resolve('denied');
                }
            });
        });
    }

    // ========================================
    // ENVIAR NOTIFICAÇÃO
    // ========================================

    function enviarNotificacao(titulo, mensagem, url) {
        if (Notification.permission !== 'granted') {
            console.log('⚠️ Não é possível enviar: permissão negada');
            return;
        }

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
    // CRIAR BOTÃO DE ATIVAÇÃO (SEMPRE VISÍVEL SE NEGADO)
    // ========================================

    function criarBotaoAtivacao() {
        // Remover botão antigo se existir
        var btnAntigo = document.getElementById('btnAtivarNotificacoes');
        if (btnAntigo) btnAntigo.remove();

        var botao = document.createElement('button');
        botao.id = 'btnAtivarNotificacoes';
        
        // Se já foi negado, mostrar mensagem diferente
        if (Notification.permission === 'denied') {
            botao.innerHTML = '🔔 Ativar Notificações (configurar no navegador)';
            botao.style.background = '#dc2626';
        } else {
            botao.textContent = '🔔 Ativar Notificações';
            botao.style.background = '#7c3aed';
        }

        botao.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 50px;
            cursor: pointer;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s;
            animation: pulse-notificacao 2s ease-in-out infinite;
            max-width: 90%;
        `;

        botao.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
        };
        botao.onmouseout = function() {
            this.style.transform = 'scale(1)';
        };

        botao.onclick = function() {
            // Se foi negado, mostrar instruções
            if (Notification.permission === 'denied') {
                alert(
                    'Para ativar as notificações:\n\n' +
                    '1. Clique no cadeado 🔒 ao lado da URL\n' +
                    '2. Clique em "Permissões do site"\n' +
                    '3. Encontre "Notificações" e mude para "Permitir"\n' +
                    '4. Recarregue a página e clique novamente neste botão'
                );
                return;
            }

            // Pedir permissão
            pedirPermissao().then(function(permissao) {
                if (permissao === 'granted') {
                    botao.textContent = '✅ Notificações ativadas!';
                    botao.style.background = '#059669';
                    botao.style.animation = 'none';
                    
                    // Enviar notificação de boas-vindas
                    enviarNotificacao(
                        '🔔 Bem-vindo!',
                        'Você receberá atualizações do Saúde Nampula em tempo real.'
                    );
                    
                    setTimeout(function() {
                        botao.style.display = 'none';
                    }, 3000);
                } else if (permissao === 'denied') {
                    botao.innerHTML = '❌ Permissão negada - clique para configurar';
                    botao.style.background = '#dc2626';
                }
            });
        };

        document.body.appendChild(botao);

        // Adicionar CSS da animação se não existir
        if (!document.getElementById('style-notificacoes')) {
            var style = document.createElement('style');
            style.id = 'style-notificacoes';
            style.textContent = `
                @keyframes pulse-notificacao {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========================================
    // VERIFICAR NOVAS PUBLICAÇÕES
    // ========================================

    async function verificarNovasPublicacoes() {
        if (Notification.permission !== 'granted') return;
        
        try {
            var response = await fetch(API_URL + '/publicacoes');
            if (!response.ok) return;
            
            var publicacoes = await response.json();
            if (!publicacoes || publicacoes.length === 0) return;

            var ultimaPublicacao = localStorage.getItem('sn_ultima_publicacao');
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
                enviarNotificacao(
                    icone + ' ' + ultima.categoria,
                    ultima.titulo,
                    '/dicas?abrir=' + ultima.id
                );
                localStorage.setItem('sn_ultima_publicacao', ultima.id);
            }

        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // ========================================
    // VERIFICAR NOVAS FARMÁCIAS
    // ========================================

    async function verificarNovasFarmacias() {
        if (Notification.permission !== 'granted') return;
        
        try {
            var response = await fetch(API_URL + '/farmacias');
            if (!response.ok) return;
            
            var farmacias = await response.json();
            if (farmacias.length === 0) return;

            var ultimaFarmacia = localStorage.getItem('sn_ultima_farmacia');
            var ultima = farmacias[farmacias.length - 1];

            if (!ultimaFarmacia || ultima.id > parseInt(ultimaFarmacia)) {
                enviarNotificacao(
                    '🏥 Nova Farmácia',
                    ultima.nome + ' foi adicionada!',
                    '/detalhes-farmacia?farmacia=' + encodeURIComponent(ultima.nome) + '&id=' + ultima.id
                );
                localStorage.setItem('sn_ultima_farmacia', ultima.id);
            }

        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // ========================================
    // INICIALIZAR
    // ========================================

    function iniciar() {
        var permissao = Notification.permission;

        if (permissao === 'granted') {
            console.log('✅ Notificações ativas!');
            // Iniciar verificações
            setTimeout(function() {
                verificarNovasPublicacoes();
                verificarNovasFarmacias();
            }, 3000);

            setInterval(function() {
                verificarNovasPublicacoes();
                verificarNovasFarmacias();
            }, 300000);

        } else if (permissao === 'denied') {
            console.log('❌ Notificações negadas pelo usuário.');
            console.log('💡 Clique no botão para instruções de como ativar.');
            setTimeout(criarBotaoAtivacao, 1000);

        } else {
            console.log('⏳ A aguardar permissão...');
            setTimeout(criarBotaoAtivacao, 1500);

            // Tentar pedir automaticamente após 3 segundos
            setTimeout(function() {
                pedirPermissao().then(function(resultado) {
                    if (resultado === 'granted') {
                        var btn = document.getElementById('btnAtivarNotificacoes');
                        if (btn) btn.style.display = 'none';
                    }
                });
            }, 3000);
        }
    }

    // ========================================
    // EXPORTAR
    // ========================================

    window.notificacoes = {
        enviar: enviarNotificacao,
        pedirPermissao: pedirPermissao,
        resetar: function() {
            // Limpar localStorage
            var chaves = [
                'sn_ultima_publicacao',
                'sn_ultima_farmacia',
                'sn_ultimo_hospital',
                'sn_ultimo_centro',
                'sn_ultimo_status'
            ];
            for (var i = 0; i < chaves.length; i++) {
                localStorage.removeItem(chaves[i]);
            }
            console.log('🔄 Dados resetados! Recarregue a página.');
            location.reload();
        }
    };

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

})();
