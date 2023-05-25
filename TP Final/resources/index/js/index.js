if (window.matchMedia("(prefers-color-scheme: dark)")) {
    $(document).scroll(function () {
        $('header').css('background-color', ($(document).scrollTop() > $('.banner').height()) ? 'black' : 'transparent');
        $('header').css('box-shadow', ($(document).scrollTop() > $('.banner').height()) ? '0em 0.3em 2em rgb(0, 0, 0, 75%)' : 'none');
    });
}