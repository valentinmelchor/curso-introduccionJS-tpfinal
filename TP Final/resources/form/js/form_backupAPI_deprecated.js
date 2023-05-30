// Aplicacion API publica "CountriesNow"
// Utilizar en caso de que la API actual quede obsoleta, en mantenimiento o sin autorizacion

const COUNTRIES_BASE_URL = 'https://countriesnow.space/api/v0.1/countries/';

function createOptionsByName(selector, array) {
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(array[i].name).val(array[i].name));
    }
}

function createOptions(selector, array) {
    for (let i = 0; i < array.length; i++) {
        $(selector).append($('<option>').text(array[i]).val(array[i]));
    }
}

function clearSelect(selector, innerText) {
    $(selector).empty();
    $(selector).append($('<option value disabled selected>').text(innerText));
}

function sortObjectAlphabetically(array, property) {
    return array.sort(function (a, b) {
        var textA = a[property].toUpperCase();
        var textB = b[property].toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
}

// Actualizar lista de paises
$.get(COUNTRIES_BASE_URL + 'info', { returns: 'country' },
    function (data) {
        createOptionsByName('#country', sortObjectAlphabetically(data.data, 'name'));
    },
    "json"
);

// Actualizar estados al recibir pais
$('#country').change(function () {
    $.ajax({
        type: "POST",
        url: COUNTRIES_BASE_URL + 'states',
        data: { country: $(this).val() },
        dataType: "json",
        success: function (response) {
            clearSelect('#state', 'Seleccione un estado');
            clearSelect('#city', 'Seleccione una ciudad');
            createOptionsByName('#state', sortObjectAlphabetically(response.data['states'], 'name'));
        }
    });
});

// Actualizar ciudades al recibir estado
$('#state').change(function (e) {
    $.ajax({
        type: "POST",
        url: COUNTRIES_BASE_URL + 'state/cities',
        data: { country: $('#country').val(), state: $(this).val() },
        dataType: "json",
        success: function (response) {
            clearSelect('#city', 'Seleccione una ciudad');
            createOptions('#city', response.data);
        }
    });
});