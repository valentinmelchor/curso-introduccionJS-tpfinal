// Cuando termine de cargarse la pagina
$(document).ready(function () {
    // Si se encuentra usuario registrado
    if (localStorage.getItem('name') != null) {
        $('.login').hide(); // Ocultar boton de Inicio de sesion
        $('.signup').hide(); // Ocultar boton de Registro
        // Crear boton que permita cerrar sesion al usuario
        $('.formB').append($('<label for="logout" style="margin: auto; margin-right:1ch">').text('Bienvenido, ' + localStorage.getItem('name') + '.'))
            .append($('<button type="button" name="logout" id="logout">').text('Cerrar sesión'));
        // Asignar funcion al boton de 'Cerrar sesion' que borre los datos en localStorage
        $('#logout').click(function () {
            localStorage.clear();
            window.location.href = './index.html';
        });
    } else { // Si no se encuentra usuario registrado
        $('.sessionRequired').remove(); // Borrar elementos que requieran sesion para utilizarse
    }

    // Al hacer click en el icono de Trivia, llevar a la pagina asignada.
    $('#triviaRef').click(function () {
        window.location.href = './trivia.html';
    });

    // Al hacer click en el icono de Acertijos, llevar a la pagina asignada.
    $('#riddlesRef').click(function () {
        window.location.href = './riddles.html';
    });
});