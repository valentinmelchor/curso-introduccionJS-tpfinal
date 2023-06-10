if (localStorage.getItem('name') == null) {
    window.location.href = './index.html';
}

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

function instanceElements() {
    for (let i = 0; i < riddles.length; i++) {
        riddleTemplate(i, riddles[i].title, riddles[i].riddle);
    }
}

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

$(document).ready(function () {
    instanceElements();
    $('.clue, .closeClue').click(function () {
        let id = $(this).closest('form').attr('id');
        $(`#${id}d`).toggle('slow');
    });

    $('form').submit(function (e) {
        e.preventDefault();
        let input = $(this.elements.answer);
        let id = $(this).attr('id');
        let answer = input.val();
        if (verifyAnswer(answer, id)) {
            let riddlesSolved = '';
            if (localStorage.getItem('riddlesSolved') != null && localStorage.getItem('riddlesSolved').length > 1) {
                riddlesSolved = localStorage.getItem('riddlesSolved');
            }
            riddlesSolved += (id + ';');
            localStorage.setItem('riddlesSolved', riddlesSolved);
            input.prop('disabled', true).val(riddles[id].displaySolution);
            if ($(this).next().length > 0) {
                $(this).next()[0].elements.answer.focus();
            }
        } else {
            input.addClass('failedAnswer');
            setTimeout(function () {
                input.removeClass('failedAnswer');
            }, 800);
        }
    });

    $(':input').on('input', function () {
        $(this).removeClass('failedAnswer');
    });

    if (localStorage.getItem('riddlesSolved') && localStorage.getItem('riddlesSolved').length > 1) {
        let ids = localStorage.getItem('riddlesSolved').split(';');
        console.log(ids);
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].length > 0) {
                $('#' + ids[i]).find(':input').prop('disabled', true).val(riddles[ids[i]].displaySolution);
            }
        }
    }
});