// Parametros
var rect;
var x = 0; var y = 0; var xPos = 0; var yPos = 0;
var speed = 0.05;
var panel = $('.panel')[0];
var minimumAge = 5, maximumAge = 120;

// Capturar posicion del mouse relativa al panel y pasarla a porcentaje
$(document).mousemove(function (e) {
    xPos = parseInt((((e.clientX - rect.left) / rect.width) * 100));
    yPos = parseInt((((e.clientY - rect.top) / rect.height) * 100));
});

// Funcion que se ejecuta constantemente a la velocidad en la que se refresca el monitor (Normalmente 60Hz / 60 veces por segundo)
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
// Asegurar que Update se ejecute al menos una vez
Update();

// Destacar inputs en rojo al primer submit invalido
$('input[required]').on('invalid', function () {
    $(this).addClass('failedSubmit');
});

// Minimizar label si se esta escribiendo en el input vinculado
$('input').focus(function () {
    $(".animatedLabel[for='" + this.id + "']").css({ 'top': "5%", 'font-size': '0.8em', 'color': 'hsl(0deg, 0%, 75%)', 'font-style': 'italic' });
});

// Volver a maximizar label si el input enfocado no contiene ningun caracter
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

// Funcion para minimizar codigo en los ajax request ya que usan los mismos parametros
function requestSettingsAPI(urlParameter, data) {
    return { "url": urlParameter, "method": "GET", "data": data, "dataType": "json", error: errorAPI };
}

// Mostrar pop-up con el codigo de error recibido
function errorAPI(xhr) {
    $('#errorModal')[0].showModal();
    $('#errorStatus').html('Error: ' + xhr.status + '<br>' + xhr.statusText);
}

// Recargar pagina al hacer click en el boton reintentar del pop-up
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

// Cargar y mostrar lista de provincias de Argentina si esta es seleccionada
$('#country').change(function () {
    clearSelect('#state', 'Cargando lista de provincias');
    clearCityList('#cityList');
    $('#cityList').val('');
    if ($(this).val() == 'Argentina') {
        $('#state').closest('fieldset').show('fast');
        loadStates_Argentina();
    } else {
        $('#state').closest('fieldset').hide('fast');
        $('#city').closest('fieldset').hide('fast');
    }
});

// Mostrar y limpiar barra de busqueda de ciudades al seleccionar/cambiar provincia
$('#state').change(function () {
    if ($(this).val() > 0) {
        $('#city').closest('fieldset').show('fast');
    } else {
        $('#city').closest('fieldset').hide('fast');
    }
    clearCityList('#cityList');
    $('#city').val('');
});

var inputValue = '';
// Buscar ciudades al escribir 4 o mas caracteres en la barra de busqueda
$('#city').on('input', function () {
    inputValue = $(this).val().trim();
    if (inputValue.length >= 4 && !$('#cityList').find('li').length > 0) {
        searchCities_Argentina(inputValue);
    } else if (inputValue.length > 4 && citySearchResult.length > 0) {
        $('#cityList').empty();
        createClickableList('#cityList', citySearchResult.filter(searchInCities), sortArgentina, argentinaData);
    } else if (!inputValue.length > 0) {
        clearCityList('#cityList');
    }
});

// Al hacer click en una ciudad, escribirla en el input de ciudad y limpiar la lista
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

/* Funciones auxiliares | No tan importantes */

// Para utilizar con funcion de array FILTER... Devuelve las ciudades que incluyen X valor
function searchInCities(value) {
    return value.nombre.includes(inputValue.toLocaleUpperCase());
}

// Para utilizar con funcion de array COMPARE... Ordena los elementos del objeto en orden alfabetico
function sortCountries(a, b) {
    const nameA = a.name.common.toUpperCase();
    const nameB = b.name.common.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

// Para utilizar con funcion de array COMPARE... Ordena los elementos del objeto en orden alfabetico
function sortArgentina(a, b) {
    const nameA = a.nombre.toUpperCase();
    const nameB = b.nombre.toUpperCase();
    return (nameA > nameB) ? 1 : -1;
}

// Devolver string con primera letra mayuscula en cada palabra
function capitalizeString(string) {
    let words = string.split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toLocaleUpperCase() + words[i].slice(1, words[i].length).toLocaleLowerCase();
    }
    return words.join(' ');
}

// Crea una lista con elementos seleccionables (Para el selector de ciudad)
function createClickableList(selector, array, sortFunction, filterFunction) {
    array.sort(sortFunction);
    for (let i = 0; i < Math.min(array.length, 5); i++) {
        $(selector).append($('<li>').text(capitalizeString(filterFunction(i, array).text)));
    }
}

// Crea opciones para un select
function createOptions(selector, array, sortFunction, filterFunction) {
    array.sort(sortFunction);
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(filterFunction(i, array).text).val(filterFunction(i, array).value));
    }
}

// Limpia un select y crea una opcion predeterminada que no es seleccionable
function clearSelect(selector, innerText) {
    $(selector).empty();
    $(selector).append($('<option value disabled selected>').text(innerText));
}

// Limpia la lista de ciudades
function clearCityList() {
    $('#cityList').empty();
    citySearchResult = [];
}

// Si un numero es menor a 10 devolver un string que siempre tenga 2 caracteres (EJEMPLO: Entrada = '4' | Salida = '04')
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// Retorna una variable Date a partir de la informacion devuelta por la API 'WorldTimeAPI'
function dateFormatAPI(data) {
    return new Date(data.year, data.month, data.day);
}

// Retorna un string con el formato correcto a partir de una variable Date
function dateFormatString(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
}

// Time API
const TIME_BASE_URL = 'http://worldtimeapi.org/api/';
var currentDate; // Almacenar la fecha en la que se abrio el formulario

// Obtener tiempo actual por direccion IP para evitar manipulacion en el formulario (Timezone adecuada)
$.ajax(requestSettingsAPI(TIME_BASE_URL + 'ip', '')).done(function (response) {
    currentDate = new Date(response.unixtime * 1000);
    let maxDate = new Date(currentDate.getFullYear() - minimumAge, currentDate.getMonth(), currentDate.getDate());
    let minDate = new Date(currentDate.getFullYear() - maximumAge, currentDate.getMonth(), currentDate.getDate());
    $('#birthdate').attr('max', dateFormatString(maxDate));
    $('#birthdate').attr('min', dateFormatString(minDate));
});

// Validacion formulario
$('form').submit(function (e) {
    e.preventDefault();
    if (validateName() && validateUsername() && validateBirthdate() && validateEmail() && validatePassword()) {
        storeLocalRequiredInfo();
        $('#errorModal')[0].showModal();
        $('#errorStatus').text('Registro exitoso');
        $('#closeErrorModal').text('Volver a Inicio').on('click', function () {
            window.location.href = './index.html';
        });
    } else {
        alert('Datos inválidos, compruebe la información introducida y vuelva a intentar nuevamente.');
    }
});

// Almacenar informacion basica del usuario en LocalStorage
function storeLocalRequiredInfo() {
    localStorage.setItem('name', $('form')[0].elements['name'].value.trim());
    localStorage.setItem('lastName', $('form')[0].elements['lastName'].value.trim());
    localStorage.setItem('username', $('form')[0].elements['username'].value.trim());
}

// Verificar que el campo de 'Confirmar contraseña' sea el mismo que el de contraseña
$('#confirmPassword').on('input focus', function () {
    this.setCustomValidity($(this).val() != $('#password').val() ? 'Ambos campos deben coincidir' : '');
});

// Funcion auxiliar, comprueba el largo del nombre. Retorna TRUE o FALSE.
function validateNameLength(name) {
    return (name.length > 0 && name.length <= 32);
}

// Validar campo de nombre. Retorna TRUE o FALSE.
function validateName() {
    let name = $('#name').val();
    let lastName = $('#lastName').val();
    return (validateNameLength(name) && validateNameLength(lastName) && !/\d/.test(name) && !/\d/.test(lastName));
}

// Validar campo de usuario. Retorna TRUE o FALSE.
function validateUsername() {
    let username = $('#username').val();
    return (username.length >= 4 && username.length <= 16);
}

// Validar campo de fecha de nacimiento. Retorna TRUE o FALSE.
function validateBirthdate() {
    let inputDate = new Date($('#birthdate').val());
    let age = currentDate.getFullYear() - inputDate.getFullYear();
    return !(age < minimumAge || age > maximumAge);
}

// Validar campo de correo electronico. Retorna TRUE o FALSE.
function validateEmail() {
    return (/^\S+\.\S+$/.test($('#email').val()));
}

// Validar campos de contraseña y confirmar contraseña. Retorna TRUE o FALSE.
function validatePassword() {
    let password = $('#password').val();
    let confirmPassword = $('#confirmPassword').val();
    return ((confirmPassword == password) && /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password));
}

// Fix labels con posicion incorrecta
$(document).ready(function () {
    $('input').each(function () {
        if (this.value.length > 0) {
            $(".animatedLabel[for='" + this.id + "']").css({ 'top': "5%", 'font-size': '0.8em', 'color': 'hsl(0deg, 0%, 75%)', 'font-style': 'italic' });
        }
    });
});