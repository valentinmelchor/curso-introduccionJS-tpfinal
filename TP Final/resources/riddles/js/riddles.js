// Si el usuario no esta registrado, volver al inicio
if (localStorage.getItem('name') == null) {
    window.location.href = './index.html';
}

// Plantilla de como se compone cada elemento de acertijo, se instancia automaticamente al llamar la funcion.
function riddleTemplate(id, title, riddle) {
    $('#riddles').append(
        $('<form action="#" id=' + id + '>')
            .append($('<div class="riddleHeader">')
                .append($('<h2 class="riddleTitle">').text(title))
                .append($('<button type="button" class="clue">').text('Pista').append($('<span class="material-symbols-rounded">').text('mystery')))
                .append($(`<div class="clueDialog" id="${id}d" style="display: none;">`).html(`${riddles[id].clue}<span class="closeClue">X</span>`)))
            .append($('<div class="riddleContent">')
                .append($('<p>').html(riddle)))
            .append($('<div class="riddleFooter">')
                .append($('<input type="text" name="answer" placeholder="Escriba aquí...">'))
                .append($('<button type="submit">').text('Adivinar')))
    );
}

// Instanciar cada acertijo que se encuentre dentro del objeto asignado
function instanceElements() {
    for (let i = 0; i < riddles.length; i++) {
        riddleTemplate(i, riddles[i].title, riddles[i].riddle);
    }
}

// Verificar respuesta correcta
function verifyAnswer(answerValue, id) {
    let answer = answerValue.trim().toLocaleUpperCase();
    for (let i = 0; i < riddles[id].solutions.length; i++) {
        if (answer.includes(riddles[id].solutions[i].toLocaleUpperCase())) {
            return true;
        }
    }
    if (riddles[id].strictSolution != undefined && riddles[id].strictSolution.toLocaleUpperCase() == answer) {
        return true;
    }
    return false;
}

// Cuando el documento termine de cargarse y el objeto con los acertijos sea cargado:
$(document).ready(function () {
    instanceElements(); // Instanciar elementos con los acertijos

    // Al hacer click en un boton de pista, mostrar u ocultar la misma.
    $('.clue, .closeClue').click(function () {
        let id = $(this).closest('form').attr('id');
        $(`#${id}d`).toggle('slow');
    });

    // Al hacer click o apretar Enter dentro de un elemento de acertijo, verificar la respuesta.
    $('form').submit(function (e) {
        e.preventDefault();

        let input = $(this.elements.answer);
        let id = $(this).attr('id');
        let answer = input.val();

        if (verifyAnswer(answer, id)) { // Si la respuesta es correcta
            let riddlesSolved = '';
            // Si existe un objeto almacenado en LocalStorage con cierta cantidad de acertijos ya resueltos, asignarlo a la variable creada.
            if (localStorage.getItem('riddlesSolved') != null && localStorage.getItem('riddlesSolved').length > 1) {
                riddlesSolved = localStorage.getItem('riddlesSolved');
            }
            // Guardar el ID del acertijo resuelto para conservar el progreso en el usuario y poder retomarlo luego.
            riddlesSolved += (id + ';');
            localStorage.setItem('riddlesSolved', riddlesSolved);
            // Deshabilitar acertijo ya que se resolvio y mostrar la solucion correcta
            input.prop('disabled', true).val(riddles[id].displaySolution);
            if ($(this).next().length > 0) {
                $(this).next()[0].elements.answer.focus();
            }
        } else { // Si la respuesta es incorrecta
            input.addClass('failedAnswer'); // Mostrarle al usuario mediante animaciones que no es la correcta
            setTimeout(function () { // Eliminar el estilo asignado despues de 800ms para terminar la animacion
                input.removeClass('failedAnswer');
            }, 800);
        }
    });

    // Al escribir en un input, cancelar animacion de 'Respuesta fallida' en caso de existir
    $(':input').on('input', function () {
        $(this).removeClass('failedAnswer');
    });

    // Si existen acertijos resueltos previamente, mostrarlos como resueltos
    if (localStorage.getItem('riddlesSolved') && localStorage.getItem('riddlesSolved').length > 1) {
        let ids = localStorage.getItem('riddlesSolved').split(';');
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].length > 0) {
                $('#' + ids[i]).find(':input').prop('disabled', true).val(riddles[ids[i]].displaySolution);
            }
        }
    }
});