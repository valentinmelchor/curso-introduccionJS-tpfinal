// Ante un scroll en la pagina, si se deja de visualizar el banner; que la barra de navegacion se vuelva negra en lugar de transparente.
$(document).scroll(function () {
    $('header').css('background-color', ($(document).scrollTop() > $('.banner').height()) ? 'black' : 'transparent');
    $('header').css('box-shadow', ($(document).scrollTop() > $('.banner').height()) ? '0em 0.3em 2em rgb(0, 0, 0, 75%)' : 'none');
});