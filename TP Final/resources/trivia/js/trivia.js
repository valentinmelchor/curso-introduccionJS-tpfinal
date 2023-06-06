// Encerrar el codigo en una funcion para que no sea accesible desde consola
(function () {
    var maxIterations = 100; // Limitar la cantidad de iteraciones al buscar preguntas para prevenir bucles infinitos y tiempos de espera largos
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
    // let correctAnswer = 'X';
    function startTrivia(amount, difficulty) {
        questions = getQuestions(amount, difficulty);
        questionsAnswered = 0;
        nextQuestion();
    }

    function verifyAnswer(answerSelected) {
        if (possibleAnswers.correctAnswer == answerSelected) {
            $('#questionForm>button').prop('disabled', true);
            $('#' + answerSelected).addClass('correctAnswer');
            setTimeout(nextQuestion, timeBetweenQuestionsMS);
        } else {
            $('#questionForm>button').prop('disabled', true);
            $('#' + answerSelected).addClass('incorrectAnswer');
            setTimeout(nextQuestion, timeBetweenQuestionsMS);
        }
    }

    function nextQuestion() {
        $('#questionForm').slideUp('slow', function () {
            $('#questionForm>button').removeClass();
            $('#questionForm>button').prop('disabled', false);
            questionsAnswered++;
            possibleAnswers = shuffleAnswers(questions[questionsAnswered]);
            // correctAnswer = possibleAnswers.correctAnswer;
            $('#question').html(questions[questionsAnswered].question);
            for (let i = 0; i < possibleAnswers.options.length; i++) {
                $('#' + choicesId[i]).text(possibleAnswers.options[i]);
            }
            $(this).slideDown('slow')
        });
    }

    $('#settings').submit(function (e) {
        e.preventDefault();
        $(this).hide('slow');
        $('#questionForm').show('slow', startTrivia(this.elements.amount.value, this.elements.difficulty.value));
    });

    $('#questionForm>button').click(function (e) {
        //verifyAnswer($(this).attr('id'));
        let answerSelected = $(this).attr('id');
        verifyAnswer(answerSelected);
        // $('#questionForm').slideUp('slow', function () {
        //     verifyAnswer(answerSelected);
        //     $(this).slideDown('slow')
        // });
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
})();