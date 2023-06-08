// Encerrar la logica del juego en una funcion anonima para que no sea accesible desde consola
(function () {
    var maxIterations = 100; // Limitar la cantidad de iteraciones al buscar preguntas para prevenir bucles infinitos y tiempos de espera largos
    var timerDurationSec = 20; // Cantidad de tiempo en segundos disponible para responder
    var timeBetweenQuestionsMS = 3000; // Tiempo a esperar entre preguntas (milisegundos)
    var questionsAnswered = 0;

    function getQuestions(amount, difficulty) {
        let difficultyFilter = (difficulty != 'any') ? results.filter(question => question.difficulty == difficulty) : results;
        if (amount >= difficultyFilter.length) {
            console.warn('La cantidad de preguntas a devolver está fuera de rango, devolviendo la cantidad máxima');
            return difficultyFilter;
        }
        let questions = [];
        let iterations = 0;
        let randomIndex;
        for (let i = 0; (i < amount && iterations < maxIterations); [i++, iterations++]) {
            randomIndex = randomRange(0, difficultyFilter.length);
            if (questions.indexOf(difficultyFilter[randomIndex]) < 0) {
                questions.push(difficultyFilter[randomIndex]);
            } else {
                i--;
            }
        }
        return questions;
    }

    let choicesId = ['A', 'B', 'C', 'D'];
    let questions = [];
    let possibleAnswers = [];

    function startTrivia(amount, difficulty) {
        questions = getQuestions(amount, difficulty);
        questionsAnswered = 0;
        nextQuestion();
    }

    function nextQuestion() {
        if (questionsAnswered > 0) { $('#timer').hide('slow'); }
        if (questionsAnswered < questions.length) {
            $('#questionForm').slideUp('slow', function () {
                $('#questionForm>button').removeClass();
                $('#questionForm>button').prop('disabled', false);
                possibleAnswers = shuffleAnswers(questions[questionsAnswered]);
                $('#question').html(questions[questionsAnswered].question);
                $('#questionLabel').text('Pregunta ' + (questionsAnswered + 1) + '/' + questions.length);
                for (let i = 0; i < possibleAnswers.options.length; i++) {
                    $('#' + choicesId[i]).text(possibleAnswers.options[i]);
                }
                $(this).slideDown('slow');
                startTimer();
            });
        } else {
            console.log('end');
            // setTimeout(finishTrivia, timeBetweenQuestionsMS);
        }
    }

    function verifyAnswer(answerSelected) {
        stopTimer();
        questionsAnswered++;
        $('#questionForm>button').prop('disabled', true);
        if (answerSelected != possibleAnswers.correctAnswer) {
            $('#' + answerSelected).addClass('incorrectAnswer');
        }
        $('#' + possibleAnswers.correctAnswer).addClass('correctAnswer');
        setTimeout(nextQuestion, timeBetweenQuestionsMS);
    }

    function timeoutAnswer() {
        if (possibleAnswers.correctAnswer != null) {
            questionsAnswered++;
            $('#' + possibleAnswers.correctAnswer).addClass('timeoutAnswer');
            $('#questionForm>button').prop('disabled', true);
            setTimeout(nextQuestion, timeBetweenQuestionsMS);
        }
    }

    $('#settings').submit(function (e) {
        e.preventDefault();
        $(this).hide('slow');
        $('#questionForm').show('slow', startTrivia(this.elements.amount.value, this.elements.difficulty.value));
        $('header>nav, header>.formB').hide('slow', function () {
            $('.middleFlex, .timerFlex').show('slow');
        });
    });

    $('#questionForm>button').click(function (e) {
        verifyAnswer($(this).attr('id'));
    });

    // Funciones auxiliares
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function shuffleAnswers(question) {
        let array = [];
        let randomIndex = randomRange(0, 4);
        let correctID = choicesId[randomIndex];
        array[randomIndex] = question.correct_answer;
        for (let i = 0; i < question.incorrect_answers.length; i++) {
            randomIndex = randomRange(0, 4);
            if (array[randomIndex] == undefined) {
                array[randomIndex] = question.incorrect_answers[i];
            } else {
                i--;
            }
        }
        return { options: array, correctAnswer: correctID };
    }

    var timerFunc;
    var timer = timerDurationSec;
    function Timer() {
        $('#timer').text(timer + '"');
        if (timer < 6) {
            $('#timer').addClass('riskZone');
        }
        if (--timer < 0) {
            stopTimer();
            timeoutAnswer();
        }
    }

    function startTimer() {
        timer = timerDurationSec;
        timerFunc = setInterval(Timer, 1000);
        $('#timer').text(timerDurationSec + '"');
        $('#timer').show('slow');
    }

    function stopTimer() {
        $('#timer').removeClass();
        clearInterval(timerFunc);
    }
})();