// Encerrar la logica del juego en una funcion anonima para que no sea accesible desde consola
(function () {
    var maxIterations = 100; // Limitar la cantidad de iteraciones al buscar preguntas para prevenir bucles infinitos y tiempos de espera largos
    var timerDurationSec = 20; // Cantidad de tiempo en segundos disponible para responder
    var timeBetweenQuestionsMS = 3000; // Tiempo a esperar entre preguntas (milisegundos)
    var amountCache, difficultyCache; // Almacenar parametros para volver a utilizar al reintentar trivia
    var questionsAnswered = 0; // Almacenar cantidad de preguntas contestadas para previa verificacion
    var wrongAnswers = 0; // Almacenar cantidad de respuestas incorrectas para calcular puntuacion

    // Funcion que retorna x cantidad de preguntas con la dificultad seleccionada
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
    let questions = []; // Almacenar preguntas obtenidas aleatoriamente para consultarlas en cada refresco de panel
    let possibleAnswers = []; // Array temporal para previa verificacion

    // Iniciar trivia
    function startTrivia(amount, difficulty) {
        questions = getQuestions(amount, difficulty);
        questionsAnswered = 0;
        wrongAnswers = 0;
        nextQuestion();
        $('body').css('background-color', 'darkslategray');
    }

    // Terminar trivia mostrando el panel de puntuacion
    function finishTrivia() {
        let score = Math.round(((questions.length - wrongAnswers) / questions.length) * 100);
        displayStarsScore(score);
        $('#score>h2').text(score + ' / 100');
        $('#scorePanel').slideDown('slow');
        $('body').css('background-color', 'hsl(240, 10%, 12%)');
    }

    // 'Siguiente pregunta' mezcla las respuestas en un orden aleatorio, muestra la pregunta en pantalla e inicia el contador.
    function nextQuestion() {
        if (questionsAnswered > 0) {
            $('#timer').hide('slow');
        }
        $('#questionForm').slideUp('slow', function () {
            if (questionsAnswered < questions.length) {
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
            } else {
                finishTrivia();
            }
        });
    }

    // 'Verificar respuesta' para el contador, inhabilita los botones y muestra la respuesta correcta/incorrecta
    function verifyAnswer(answerSelected) {
        stopTimer();
        questionsAnswered++;
        $('#questionForm>button').prop('disabled', true);
        if (answerSelected != possibleAnswers.correctAnswer) {
            $('#' + answerSelected).addClass('incorrectAnswer');
            wrongAnswers++;
        }
        $('#' + possibleAnswers.correctAnswer).addClass('correctAnswer');
        setTimeout(nextQuestion, timeBetweenQuestionsMS); // Mostrar la respuesta correcta durante X tiempo y luego seguir con el juego
    }

    // Esta funcion es llamada cuando se agota el contador y se muestra la respuesta correcta en naranja, ningun punto es sumado.
    function timeoutAnswer() {
        if (possibleAnswers.correctAnswer != null) {
            questionsAnswered++;
            wrongAnswers++;
            $('#' + possibleAnswers.correctAnswer).addClass('timeoutAnswer');
            $('#questionForm>button').prop('disabled', true);
            setTimeout(nextQuestion, timeBetweenQuestionsMS); // Mostrar la respuesta correcta durante X tiempo y luego seguir con el juego
        }
    }

    // Verificar respuesta al hacer click en una opcion
    $('#questionForm>button').click(function (e) {
        verifyAnswer($(this).attr('id'));
    });

    // Iniciar trivia al ajustar los parametros
    $('#settings').submit(function (e) {
        e.preventDefault();
        amountCache = this.elements.amount.value;
        difficultyCache = this.elements.difficulty.value;
        $(this).hide('slow');
        $('#questionForm').show('slow', startTrivia(amountCache, difficultyCache));
        $('header>nav, header>.formB').hide('slow', function () {
            $('.middleFlex, .timerFlex').show('slow');
        });
    });

    // Reiniciar trivia con el boton 'Reiniciar' que se muestra en el panel de puntuacion
    $('#scorePanel').submit(function (e) {
        e.preventDefault();
        $(this).hide('slow', startTrivia(amountCache, difficultyCache));
    })

    // Mostrar panel de parametros con el boton 'Volver' que se muestra en el panel de puntuacion
    $('#settingsButton').click(function () {
        $('#scorePanel').slideUp('slow', function () {
            $('#settings').slideDown('slow');
        })
    });

    // Volver al inicio (indice) con el boton 'Inicio' que se muestra en el panel de puntuacion
    $('#homeButton').click(function () {
        window.location.href = './index.html';
    });

    /* Funciones auxiliares | No tan importantes */
    // Retorna un valor aleatorio en el rango determinado
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Mezclar respuestas de un objeto pregunta en orden aleatorio para que la respuesta correcta no este siempre en la misma posicion
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

    var timerInstance; // Instancia de la funcion Timer almacenada en variable para frenarla en cualquier contexto
    var timer = timerDurationSec; // Establecer variable bandera
    // Funcion de temporizador, es ejecutada cada 1 segundo desde el momento en el que se inicia
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

    // Iniciar temporizador
    function startTimer() {
        timer = timerDurationSec;
        timerInstance = setInterval(Timer, 1000); // Ejecutar cada 1 segundo (1000 ms)
        $('#timer').text(timerDurationSec + '"');
        $('#timer').show('slow');
    }

    // Frenar temporizador
    function stopTimer() {
        $('#timer').removeClass();
        clearInterval(timerInstance);
    }

    // Mostrar puntuacion en forma de estrellas y limpiar la puntuacion anterior
    function displayStarsScore(score) {
        $('#stars').empty();
        let starsScore = score / 20;
        for (let i = 0; i < 5; i++) {
            if (starsScore - i > 0.5) {
                $('#stars').append($('<span class="material-symbols-rounded">').text('star'));
            } else if (starsScore - i > 0 && starsScore - i <= 0.5) {
                $('#stars').append($('<span class="material-symbols-rounded">').text('star_half'));
            } else {
                $('#stars').append($('<span class="material-symbols-rounded">').css('font-variation-settings', "'FILL' 0").text('star'));
            }
        }
    }
})();