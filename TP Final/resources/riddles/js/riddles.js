function riddleTemplate(id, title, riddle) {
    $('#riddles').append(
        $('<form action="#">')
            .append($('<div class="riddleHeader">')
                .append($('<h2 class="riddleTitle">').text(title))
                .append($('<button type="button" class="clue">').text('Pista').append($('<span class="material-symbols-rounded">').text('mystery'))))
            .append($('<div class="riddleContent">')
                .append($('<p>').html(riddle)))
            .append($('<div class="riddleFooter">')
                .append($('<input type="text" name "answer" id=' + id + '>'))
                .append($('<button type="submit">').text('Verificar')))
    );
}

function instanceElements() {
    for (let i = 0; i < riddles.length; i++) {
        riddleTemplate(i, riddles[i].title, riddles[i].riddle);
    }
}

$(document).ready(function () {
    instanceElements();
});