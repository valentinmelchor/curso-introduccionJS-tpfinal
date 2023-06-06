$(document).ready(function () {
    if (localStorage.getItem('name') != null) {
        $('.login').hide();
        $('.signup').hide();
        $('.formB').append($('<label for="logout" style="margin: auto; margin-right:1ch">').text('Bienvenido, ' + localStorage.getItem('name') + '.'))
            .append($('<button type="button" name="logout" id="logout">').text('Cerrar sesión'));
        $('#logout').click(function () {
            localStorage.clear();
            window.location.href = './index.html';
        });
    } else {
        $('.sessionRequired').remove();
    }
});