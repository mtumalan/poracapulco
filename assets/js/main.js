// Hoisting vars.
var personas = [];
var dataList,
  filteredList,
  filtroCampo,
  filtroEntrada,
  filtrarButton,
  filtroZona;

var csvFileURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRo-QOJ6L0_YLK8A5ThIugf6c1AcZE-MGgd_hLuWgRhQKf1HauB3MOEkkfKa7xBMKQwbNGJ9KMWZoI/pub?output=csv"; // Reemplaza con la URL de tu archivo .csv

function abreNuevoReporte() {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSfqtoS1DvwwcNj56MevuQl002A8lKWvwGci-t7OceWkfydtMA/viewform",
    "_blank"
  );
}

function actualizarLista(filtro) {
  console.log({ result: personas });

  // Clear.
  if (filteredList) filteredList.innerHTML = "";

  personas &&
    personas.forEach(function (item) {
      var nombre = (item["Nombre persona desaparecida"] || "").trim();
      var edad = (item["Edad"] || "").trim();
      var sexo = (item["Sexo"] || "").trim();
      var rasgos = (item["Rasgos distintivos"] || "").trim();
      var zona = (item["Zona"] || "").trim();
      var ultima = (item["Última ubicación conocida"] || "").trim();
      var estado = (item["Estado de la persona"] || "").trim();
      var foto = (item["Fotografía"] || "").trim();
      var numero = (item["Número de teléfono de contacto"] || "").trim();

      // Remplaza caracteres especiales.
      var cleanName = nombre
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ñ", "n");

      if (
        (filtroCampo.value === "nombre" &&
          new RegExp(filtro, "i").test(cleanName)) ||
        (filtroCampo.value === "zona" && new RegExp(filtro, "i").test(zona))
      ) {
        var card = document.createElement("div");
        card.className = "card";

        // Transform the Google Drive URL if needed
        if (foto && foto.includes("drive.google.com/open?id=")) {
          foto = transformarURLGoogleDrive(foto);
        }

        if (foto) {
          var image = document.createElement("img");
          image.src = foto;
          card.appendChild(image);
        } else {
          var noImage = document.createElement("img");
          noImage.src = "avatar.png";
          card.appendChild(noImage);
        }

        var nombreElement = document.createElement("p");
        nombreElement.innerHTML = "<strong>Nombre:</strong> <br>" + nombre;
        card.appendChild(nombreElement);

        var edadElement = document.createElement("p");
        edadElement.innerHTML = "<strong>Edad:</strong> <br>" + edad;
        card.appendChild(edadElement);

        var sexoElement = document.createElement("p");
        sexoElement.innerHTML = "<strong>Sexo:</strong> <br>" + sexo;
        card.appendChild(sexoElement);

        if (rasgos) {
          var rasgosElement = document.createElement("p");
          rasgosElement.innerHTML =
            "<strong>Rasgos distintivos:</strong><br> " + rasgos;
          card.appendChild(rasgosElement);
        }

        var zonaElement = document.createElement("p");
        zonaElement.innerHTML = "<strong>Zona:</strong><br> " + zona;
        card.appendChild(zonaElement);

        if (ultima) {
          var ultimaElement = document.createElement("p");
          ultimaElement.innerHTML =
            "<strong>Última ubicación conocida:</strong><br> " + ultima;
          card.appendChild(ultimaElement);
        }

        var estadoElement = document.createElement("p");
        estadoElement.innerHTML = "<strong>Estado:</strong><br> " + estado;
        card.appendChild(estadoElement);

        var numeroElement = document.createElement("p");
        numeroElement.innerHTML =
          "<strong>En caso de localizar, contactar al número:</strong><br> " +
          numero;
        card.appendChild(numeroElement);

        filteredList.appendChild(card);
      }
    });
}

function handleFiltrarLista() {
  var filtro =
    filtroCampo.value === "nombre" ? filtroEntrada.value : filtroZona.value;

  actualizarLista(filtro);
}

// Detect changes in the filtering method
function alCambiarTipo() {
  if (filtroCampo.value === "zona") {
    // If Zona is selected, show the Zona selector
    filtroZona.style.display = "block";
    filtroEntrada.style.display = "none";
    filtroEntrada.value = "";
    var filtro = filtroZona.value;
    actualizarLista(filtro);
  } else {
    // Otherwise, hide the Zona selector
    filtroZona.style.display = "none";
    filtroEntrada.style.display = "block";
    filtroEntrada.value = "";
    var filtro = filtroEntrada.value;
    actualizarLista(filtro);
  }
}

function cargarDatos() {
  fetch(csvFileURL)
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      Papa.parse(data, {
        header: true, // Si la primera fila del archivo .csv contiene encabezados de columna
        complete: function (rows) {
          // Agrega a global
          personas = rows.data;

          setTimeout(function () {
            // Mostrar todos los datos al cargar la página
            actualizarLista("");
          }, 0);
        },
      });
    });
}

// Función para transformar la URL de Google Drive
function transformarURLGoogleDrive(url) {
  var regex = /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  return url.replace(regex, "https://drive.google.com/uc?export=view&id=$1");
}

document.addEventListener("load", function () {
  console.log("loaded");
});

window.addEventListener("load", function () {
  console.log("win loaded");
  dataList = document.getElementById("data-list");
  filteredList = document.getElementById("filtered-list");
  filtroCampo = document.getElementById("filtro-campo");
  filtroEntrada = document.getElementById("filtro-entrada");
  filtrarButton = document.getElementById("filtrar-button");
  filtroZona = document.getElementById("filtro-zona");

  // document.querySelector("#reporte").addEventListener("click", nuevoReporte);

  filtrarButton.addEventListener("click", handleFiltrarLista);
  filtroCampo.addEventListener("change", alCambiarTipo);

  cargarDatos();
});
