var rect;
var x = 0; var y = 0; var xPos = 0; var yPos = 0;
var speed = 0.05;
var panel = $('.panel')[0];

// Capturar posicion del mouse relativa al panel y pasarla a porcentaje
$(document).mousemove(function (e) {
    xPos = parseInt((((e.clientX - rect.left) / rect.width) * 100));
    yPos = parseInt((((e.clientY - rect.top) / rect.height) * 100));
});

function Update() {
    rect = panel.getBoundingClientRect();
    glassHiglightMotion();
}

// Actualizar gradiente radial en clase 'glass'
function glassHiglightMotion() {
    x += (xPos - x) * speed;
    y += (yPos - y) * speed;
    document.documentElement.style.setProperty("--highlightPosition", `at ${x.toFixed(2)}% ${y.toFixed(2)}%`);
    requestAnimationFrame(Update);
}
Update();

// Destacar inputs en rojo al primer submit invalido y evitar el mensaje pop-up nativo del navegador
$('input[required]').on('invalid', function (e) {
    $(this).addClass('failedSubmit');
    // e.preventDefault();
});

// Animaciones formulario
$('input').focus(function () {
    $(".animatedLabel[for='" + this.id + "']").css({ 'top': "5%", 'font-size': '0.8em', 'color': 'whitesmoke', 'font-style': 'italic' });
});

$('input').blur(function () {
    if (this.value.length <= 0) {
        $(".animatedLabel[for='" + this.id + "']").css({ 'top': '20%', 'font-size': '1em', 'color': 'white', 'font-style': 'normal' });
    }
});

// Parametros API
const COUNTRIES_BASE_URL = 'https://api.countrystatecity.in/v1/countries/';
const API_KEY = 'd2VQdHBjQWRjWHRJRjhXRHFzMnczN3RYMmdrcE9KSWJMUmYwNVNscg==';
function requestSettingsAPI(urlParameter) {
    return { "url": urlParameter, "method": "GET", "headers": { "X-CSCAPI-KEY": API_KEY } };
}
const statesURL = () => COUNTRIES_BASE_URL + $('#country').val() + '/states/';
const citiesURL = () => statesURL() + $('#state').val() + '/cities/';

// Actualizar lista de paises
clearSelect('#country', 'Cargando lista de paises');
console.time('Tiempo de retraso al cargar lista de paises');
$.ajax(requestSettingsAPI(COUNTRIES_BASE_URL)).done(function (response) {
    clearSelect('#country', 'Seleccione un pais');
    createOptions('#country', response);
    console.timeEnd('Tiempo de retraso al cargar lista de paises');
});

// Actualizar lista de estados al recibir el pais seleccionado
$('#country').change(function () {
    clearSelect('#state', 'Cargando lista de estados/provincias');
    console.time('Tiempo de retraso al cargar lista de estados');
    $.ajax(requestSettingsAPI(statesURL())).done(function (response) {
        clearSelect('#state', 'Seleccione un estado');
        clearSelect('#city', 'Seleccione una ciudad');
        createOptions('#state', response);
        console.timeEnd('Tiempo de retraso al cargar lista de estados');
    });
});

// Actualizar lista de ciudades al recibir el estado seleccionado
$('#state').change(function () {
    clearSelect('#city', 'Cargando lista de ciudades');
    console.time('Tiempo de retraso al cargar lista de ciudades');
    $.ajax(requestSettingsAPI(citiesURL())).done(function (response) {
        clearSelect('#city', 'Seleccione una ciudad');
        createOptions('#city', response);
        console.timeEnd('Tiempo de retraso al cargar lista de ciudades');
    });
});

// Funciones auxiliares
function createOptions(selector, array) {
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(array[i].name).val(array[i].iso2));
    }
}

function clearSelect(selector, innerText) {
    $(selector).empty();
    $(selector).append($('<option value disabled selected>').text(innerText));
}