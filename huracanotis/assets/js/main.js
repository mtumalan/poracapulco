// Hoisting vars.
var personas = [];
var filtered = [];

var dataList,
  filteredList,
  filtroCampo,
  filtroEntrada,
  filtrarButton,
  filtroZona,
  errorMessage;

var csvFileURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRo-QOJ6L0_YLK8A5ThIugf6c1AcZE-MGgd_hLuWgRhQKf1HauB3MOEkkfKa7xBMKQwbNGJ9KMWZoI/pub?output=csv";

function abreNuevoReporte() {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSfqtoS1DvwwcNj56MevuQl002A8lKWvwGci-t7OceWkfydtMA/viewform",
    "_blank"
  );
}

function createSlug(value, separator) {
  return value
    .toLowerCase()
    .replace("á", "a")
    .replace("é", "e")
    .replace("í", "i")
    .replace("ó", "o")
    .replace("ú", "u")
    .replace("ñ", "n")
    .replace(/\W/g, separator || " ");
}

function resetResultList() {
  var elements = document.querySelectorAll(".card");

  // Quita mensaje no encontrado
  errorMessage && errorMessage.classList.add("hidden");

  for (var index = 0; index < elements.length; index++) {
    const item = elements[index];
    item.classList.remove("hidden");
  }
}

function filtrarLista(filtro) {
  resetResultList();

  var esPorNombre = filtroCampo.value === "nombre";
  var esPorZona = filtroCampo.value === "zona";

  if (!filtro || filtro.length < 1) return;

  // Reset
  filtered = [];

  // Remplaza caracteres especiales.
  if (esPorNombre) {
    var cleanName = createSlug(filtro.trim(), " ");
    var tokens = cleanName.split(" ");
    // Crea regexp: /text1|texto2|..n/ig
    var regex = new RegExp(tokens.join("|"), "ig");

    for (var i = 0; i < personas.length; i++) {
      var persona = personas[i];

      // Oculta los no encontrados
      if (!persona.cleanName.match(regex)) {
        document
          .querySelectorAll("." + persona.slug)
          .forEach((item) => item.classList.add("hidden"));
      } else {
        filtered.push(persona);
      }
    }
  } else if (esPorZona) {
    var zone = createSlug(filtro.trim(), "-");

    for (var i = 0; i < personas.length; i++) {
      var persona = personas[i];
      var match = persona.zonaSlug.match(zone);

      // Oculta los no encontrados
      if (!!match) {
        filtered.push(persona);
      } else {
        // Oculta la tarjeta de la persona sin match
        document
          .querySelectorAll("." + persona.slug)
          .forEach((item) => item.classList.add("hidden"));
      }
    }
  }

  if (filtered.length < 1) {
    errorMessage && errorMessage.classList.remove("hidden");
  } else {
    errorMessage && errorMessage.classList.add("hidden");
  }
}

function handleFiltrarLista() {
  var filtro =
    filtroCampo.value === "nombre" ? filtroEntrada.value : filtroZona.value;

  filtrarLista(filtro.trim());
}

function onFormSubmit(e) {
  e.preventDefault();

  handleFiltrarLista();
}

function renderLista() {
  // Orden cronológico inverso.
  personas = personas.reverse();

  if (personas && personas.length > 0) {
    for (var index = 0; index < personas.length; index++) {
      const item = personas[index];

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
      var slug = createSlug(nombre, "-");
      var zonaSlug = createSlug(zona, "-");

      // Agrega slugs
      item.slug = slug;
      item.cleanName = createSlug(nombre, " ");
      item.zonaSlug = zonaSlug;

      var card = document.createElement("div");
      card.className = `${slug} ${zonaSlug} card bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md flex flex-col`; // Tailwind card styling

      // Transform the Google Drive URL if needed
      if (foto && foto.includes("drive.google.com/open?id=")) {
        foto = transformarURLGoogleDrive(foto);
        console.log(foto);
      }

      var image = document.createElement("img");
      image.src = foto ? foto : "avatar.png";
      image.classList =
      image.classList = "w-full aspect-square object-contain h-auto";
      card.appendChild(image);

      var cardBody = document.createElement("div");
      cardBody.classList.add("p-4"); // Tailwind padding for card body
      card.appendChild(cardBody);

      var nombreElement = document.createElement("h3");
      nombreElement.innerHTML = nombre;
      nombreElement.classList.add("py-2", "text-xl", "font-semibold"); // Tailwind for typography
      cardBody.appendChild(nombreElement);

      var grid = document.createElement("div");
      grid.classList.add("grid", "grid-cols-3", "my-3"); // Tailwind grid
      cardBody.appendChild(grid);

      var edadElement = document.createElement("p");
      edadElement.innerHTML = "<strong>Edad:</strong> <br>" + edad;
      grid.appendChild(edadElement);

      var sexoElement = document.createElement("p");
      sexoElement.innerHTML = "<strong>Sexo:</strong> <br>" + sexo;
      grid.appendChild(sexoElement);

      var zonaElement = document.createElement("p");
      zonaElement.innerHTML = "<strong>Zona:</strong><br> " + zona;
      grid.appendChild(zonaElement);

      if (rasgos) {
        var rasgosElement = document.createElement("p");
        rasgosElement.classList.add("my-2"); // Tailwind margin class
        rasgosElement.innerHTML =
          "<strong>Rasgos distintivos:</strong><br> " + rasgos;
        cardBody.appendChild(rasgosElement);
      }

      if (ultima) {
        var ultimaElement = document.createElement("p");
        ultimaElement.classList.add("my-2"); // Tailwind margin class
        ultimaElement.innerHTML =
          "<strong>Última ubicación conocida:</strong><br> " + ultima;
        cardBody.appendChild(ultimaElement);
      }

      var estadoElement = document.createElement("p");
      estadoElement.classList.add("my-2"); // Tailwind margin class
      estadoElement.innerHTML = "<strong>Estado:</strong><br> " + estado;
      cardBody.appendChild(estadoElement);

      var numeroElement = document.createElement("p");
      numeroElement.innerHTML =
        "<strong>En caso de localizar, contactar al número:</strong><br> " +
        numero;
      cardBody.appendChild(numeroElement);

      filteredList.appendChild(card);
    }
  }
}

// Detect changes in the filtering method
function alCambiarTipo() {
  if (filtroCampo.value === "zona") {
    // If Zona is selected, show the Zona selector
    filtroZona.style.display = "block";
    filtroEntrada.style.display = "none";
    filtroEntrada.value = "";
    var filtro = filtroZona.value;
  } else {
    // Otherwise, hide the Zona selector
    filtroZona.style.display = "none";
    filtroEntrada.style.display = "block";
    filtroEntrada.value = "";
    var filtro = filtroEntrada.value;
  }

  filtrarLista(filtro);
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

          // Mostrar todos los datos al cargar la página
          renderLista();
        },
      });
    });
}

function transformarURLGoogleDrive(url) {
  // Match both 'open?id=' or 'file/d/' formats in the same regex
  var regex = /https:\/\/drive\.google\.com\/(?:open\?id=|file\/d\/)([a-zA-Z0-9_-]+)/;

  // Check if the URL matches either of the formats
  var match = url.match(regex);

  // If a match is found, return the transformed thumbnail URL with size
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }

  // If no match is found, return the original URL
  return url;
}

function onClear(text) {
  if (text.length < 1) {
    resetResultList();
  }
}

window.addEventListener("load", function () {
  dataList = document.getElementById("data-list");
  filteredList = document.getElementById("filtered-list");
  filtroCampo = document.getElementById("filtro-campo");
  filtroEntrada = document.getElementById("filtro-entrada");
  filtrarButton = document.getElementById("filtrar-button");
  filtroZona = document.getElementById("filtro-zona");
  errorMessage = document.querySelector("#results-error");

  document.querySelector("#buscador").addEventListener("submit", onFormSubmit);

  document
    .querySelector("#reporte")
    .addEventListener("click", abreNuevoReporte);

  filtrarButton.addEventListener("click", handleFiltrarLista);
  filtroCampo.addEventListener("change", alCambiarTipo);

  filtroEntrada.addEventListener("search", function (e) {
    onClear(e.target.value.trim());
  });

  filtroEntrada.addEventListener("keyup", function (e) {
    onClear(e.target.value.trim());
  });

  cargarDatos();
});
