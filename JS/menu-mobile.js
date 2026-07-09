// menu-mobile.js - Controle do menu hambúrguer

document.addEventListener('DOMContentLoaded', function() {
    var menuHamburguer = document.getElementById('menuHamburguer');
    var navLinks = document.getElementById('navLinks');

    if (menuHamburguer && navLinks) {
        // Abrir/fechar menu ao clicar no botão
        menuHamburguer.addEventListener('click', function() {
            this.classList.toggle('ativo');
            navLinks.classList.toggle('aberto');
        });

        // Fechar menu ao clicar em um link
        var links = navLinks.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                menuHamburguer.classList.remove('ativo');
                navLinks.classList.remove('aberto');
            });
        }

        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            var isClickInsideNav = navLinks.contains(event.target);
            var isClickOnHamburger = menuHamburguer.contains(event.target);

            if (!isClickInsideNav && !isClickOnHamburger && navLinks.classList.contains('aberto')) {
                menuHamburguer.classList.remove('ativo');
                navLinks.classList.remove('aberto');
            }
        });

        // Fechar menu ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                menuHamburguer.classList.remove('ativo');
                navLinks.classList.remove('aberto');
            }
        });
    }
});
