var rect;
var x = 0; var y = 0; var xPos = 0; var yPos = 0;
var speed = 0.05;
var panel = $('.panel')[0];

// Centrar panel de formulario
function centerPanel() {
    let temp = ($(window).height() / 2 - $(panel).height() / 2);
    document.documentElement.style.setProperty("--panelOffset", temp.toFixed(2) + 'px');
}

// Capturar posicion del mouse relativa al panel y pasarla a porcentaje
$(document).mousemove(function (e) {
    xPos = parseInt((((e.clientX - rect.left) / rect.width) * 100));
    yPos = parseInt((((e.clientY - rect.top) / rect.height) * 100));
});

// Funcion para actualizar propiedades en cada frame renderizado
function Update() {
    centerPanel();
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
const COUNTRIES_BASE_URL = 'https://restcountries.com/v3.1/all/';
const PROVINCES_BASE_URL = 'https://apis.datos.gob.ar/georef/api/provincias';
const countryData = (index, array) => array[index].name.common;
const provinceData = (index, array) => array[index].nombre;

function requestSettingsAPI(urlParameter, data) {
    return { "url": urlParameter, "method": "GET", "data": data, "dataType": "json" };
}

// Actualizar lista de paises
clearSelect('#country', 'Cargando lista de paises');
console.time('Tiempo de retraso al cargar lista de paises');
$.ajax(requestSettingsAPI(COUNTRIES_BASE_URL, { fields: 'name' })).done(function (response) {
    clearSelect('#country', 'Seleccione un pais');
    createOptions('#country', response, sortCountries, countryData);
    console.timeEnd('Tiempo de retraso al cargar lista de paises');
});

// Actualizar lista de provincias al recibir el pais seleccionado
$('#country').change(function () {
    clearSelect('#state', 'Cargando lista de provincias');
    console.time('Tiempo de retraso al cargar lista de provincias');
    if ($(this).val() == 'Argentina') {
        $('#state').closest('fieldset').show();
        centerPanel();
        $.ajax(requestSettingsAPI(PROVINCES_BASE_URL, '')).done(function (response) {
            clearSelect('#state', 'Seleccione una provincia');
            createOptions('#state', response.provincias, sortStates, provinceData);
            console.timeEnd('Tiempo de retraso al cargar lista de provincias');
        });
    } else {
        $('#state').closest('fieldset').hide();
        centerPanel();
    }
});

// Funciones auxiliares
function sortCountries(a, b) {
    const nameA = a.name.common.toUpperCase();
    const nameB = b.name.common.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

function sortStates(a, b) {
    const nameA = a.nombre.toUpperCase();
    const nameB = b.nombre.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

function createOptions(selector, array, sortFunction, filterFunction) {
    let temp = array.sort(sortFunction);
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(filterFunction(i, array)).val(filterFunction(i, array)));
    }
}

function clearSelect(selector, innerText) {
    $(selector).empty();
    $(selector).append($('<option value disabled selected>').text(innerText));
}