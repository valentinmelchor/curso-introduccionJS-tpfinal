var rect;
var x = 0; var y = 0; var xPos = 0; var yPos = 0;
var speed = 0.05;
var panel = $('.panel')[0];
var minimumAge = 5, maximumAge = 120;

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

// Funcion para actualizar propiedades CSS en cada frame renderizado
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
    $(".animatedLabel[for='" + this.id + "']").css({ 'top': "5%", 'font-size': '0.8em', 'color': 'hsl(0deg, 0%, 75%)', 'font-style': 'italic' });
});

$('input').blur(function () {
    if (this.value.length <= 0) {
        $(".animatedLabel[for='" + this.id + "']").css({ 'top': '20%', 'font-size': '1em', 'color': 'white', 'font-style': 'normal' });
    }
});

// Parametros API
const COUNTRIES_BASE_URL = 'https://restcountries.com/v3.1/all/';
const ARGENTINA_BASE_URL = 'https://apis.datos.gob.ar/georef/api/';
const countryData = (index, array) => object = { text: array[index].name.common, value: array[index].name.common };
const argentinaData = (index, array) => object = { text: array[index].nombre, value: array[index].id };
var citySearchResult = [];

function requestSettingsAPI(urlParameter, data) {
    return { "url": urlParameter, "method": "GET", "data": data, "dataType": "json", error: errorAPI };
}

function errorAPI(xhr) {
    $('#errorModal')[0].showModal();
    $('#errorStatus').html('Error: ' + xhr.status + '<br>' + xhr.statusText);
}

$('#closeErrorModal').on('click', function () {
    window.location.reload();
});

// Actualizar lista de paises
$.ajax(requestSettingsAPI(COUNTRIES_BASE_URL, { fields: 'name' })).done(function (response) {
    clearSelect('#country', 'Seleccione un pais');
    createOptions('#country', response, sortCountries, countryData);
});
// Actualizar lista de provincias
function loadStates_Argentina() {
    $.ajax(requestSettingsAPI(ARGENTINA_BASE_URL + 'provincias', '')).done(function (response) {
        clearSelect('#state', 'Seleccione una provincia');
        createOptions('#state', response.provincias, sortArgentina, argentinaData);
    });
}
// Actualizar lista de localidades
function searchCities_Argentina(search) {
    $.ajax(requestSettingsAPI(ARGENTINA_BASE_URL + 'localidades', { provincia: $('#state').val(), nombre: search, campos: 'nombre', max: 100 })).done(function (response) {
        clearCityList('#cityList');
        citySearchResult = response.localidades;
        createClickableList('#cityList', response.localidades, sortArgentina, argentinaData);
    });
}

$('#country').change(function () {
    clearSelect('#state', 'Cargando lista de provincias');
    clearCityList('#cityList');
    $('#cityList').val('');
    if ($(this).val() == 'Argentina') {
        $('#state').closest('fieldset').show();
        loadStates_Argentina();
    } else {
        $('#state').closest('fieldset').hide();
        $('#city').closest('fieldset').hide();
    }
});

$('#state').change(function () {
    if ($(this).val() > 0) {
        $('#city').closest('fieldset').show();
    } else {
        $('#city').closest('fieldset').hide();
    }
    clearCityList('#cityList');
    $('#city').val('');
});

var inputValue = '';
$('#city').on('input', function () {
    inputValue = $(this).val();
    if (inputValue.length >= 4 && !$('#cityList').find('li').length > 0) {
        searchCities_Argentina(inputValue);
    } else if (inputValue.length > 4 && citySearchResult.length > 0) {
        $('#cityList').empty();
        createClickableList('#cityList', citySearchResult.filter(searchInCities), sortArgentina, argentinaData);
    } else if (!inputValue.length > 0) {
        clearCityList('#cityList');
    }
});

$('fieldset>ul').on('click', function () {
    $('#city').val($('li:hover').text());
    $('#cityList').empty();
    $('#email').focus();
});

$('#city').on('blur', function () {
    if (!$('li:hover').length > 0) {
        $('#cityList').empty();
    }
});

// Funciones auxiliares
function searchInCities(value) {
    return value.nombre.includes(inputValue.toLocaleUpperCase());
}

function sortCountries(a, b) {
    const nameA = a.name.common.toUpperCase();
    const nameB = b.name.common.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

function sortArgentina(a, b) {
    const nameA = a.nombre.toUpperCase();
    const nameB = b.nombre.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

function capitalizeString(string) {
    let words = string.split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toLocaleUpperCase() + words[i].slice(1, words[i].length).toLocaleLowerCase();
    }
    return words.join(' ');
}

function createClickableList(selector, array, sortFunction, filterFunction) {
    array.sort(sortFunction);
    for (let i = 0; i < Math.min(array.length, 5); i++) {
        $(selector).append($('<li>').text(capitalizeString(filterFunction(i, array).text)));
    }
}

function createOptions(selector, array, sortFunction, filterFunction) {
    array.sort(sortFunction);
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(filterFunction(i, array).text).val(filterFunction(i, array).value));
    }
}

function clearSelect(selector, innerText) {
    $(selector).empty();
    $(selector).append($('<option value disabled selected>').text(innerText));
}

function clearCityList() {
    $('#cityList').empty();
    citySearchResult = [];
}

function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function dateFormatAPI(data) {
    return new Date(data.year, data.month, data.day);
}

function dateFormatString(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
}

// Time API
const TIME_BASE_URL = 'http://worldtimeapi.org/api/';
var currentDate;

// Obtener tiempo actual por direccion IP para evitar manipulacion en el formulario (Timezone adecuada)
$.ajax(requestSettingsAPI(TIME_BASE_URL + 'ip', '')).done(function (response) {
    currentDate = new Date(response.unixtime * 1000);
    $('#birthdate').attr('max', dateFormatString(currentDate));
});

// Validacion formulario
$('form').submit(function (e) {
    e.preventDefault();
    if (validateName() && validateUsername() && validateBirthdate() && validateEmail() && validatePassword()) {
        $('#errorModal')[0].showModal();
        $('#errorStatus').text('Registro exitoso');
        $('#closeErrorModal').text('Volver a Inicio').on('click', function () {
            window.location.href = '../index.html';
        });
    } else { alert('Datos inválidos, compruebe la información introducida y vuelva a intentar nuevamente.'); }
});

$('#confirmPassword').on('input focus', function () {
    this.setCustomValidity($(this).val() != $('#password').val() ? 'Ambos campos deben coincidir' : '');
});

function validateNameLength(name) {
    return (name.length > 0 && name.length <= 32);
}

function validateName() {
    let name = $('#name').val();
    let lastName = $('#lastName').val();
    return (validateNameLength(name) && validateNameLength(lastName) && !/\d/.test(name) && !/\d/.test(lastName));
}

function validateUsername() {
    let username = $('#username').val();
    return (username.length >= 4 && username.length <= 16);
}

function validateBirthdate() {
    let inputDate = new Date($('#birthdate').val());
    let age = currentDate.getFullYear() - inputDate.getFullYear();
    return !(age < minimumAge || age > maximumAge);
}

function validateEmail() {
    return (/^\S+\.\S+$/.test($('#email').val()));
}

function validatePassword() {
    let password = $('#password').val();
    let confirmPassword = $('#confirmPassword').val();
    return ((confirmPassword == password) && /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password));
}