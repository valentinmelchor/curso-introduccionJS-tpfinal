// Limitar la cantidad de iteraciones al buscar preguntas para prevenir bucles infinitos, tiempos de espera largos y consumo innecesario de recursos
var maxIterations = 100;

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

$('#settings').submit(function (e) {
    e.preventDefault();
    console.log(getQuestions($('#amount').val(), $('#difficulty').val()));
});

// Funciones auxiliares
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}