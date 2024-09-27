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
  "https://docs.google.com/spreadsheets/d/1hnKEHMQlqfKKJDhC7e2A91sNhozkb_rgd2fs0atjQKk/pub?gid=980204347&single=true&output=csv";

function abreNuevoReporte() {
  window.open(
    "https://forms.gle/PC7Bf9hK5PPQzM7G7",
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

      //console.log("item: ", index, ": ", item)

      var colonia = (item["Colonia"] || "").trim();
      var direccionLugar = (item["Dirección del lugar"] || "").trim();
      var totalAevacuar = (item["Número de personas en total a evacuar"] || "").trim();
      var adultosMayores = (item["¿Cuántas personas de la tercera edad se encuentran?"] || "").trim();
      var adultos = (item["¿Cuántas personas adultas se encuentran?"] || "").trim();
      var ninos = (item["¿Cuántos niños y bebés se encuentran?"] || "").trim();
      var discapacitados = (item["¿Cuántas personas con discapacidad se encuentran?"] || "").trim();
      var embarazadas = (item["¿Cuántas personas embarazadas se encuentran?"] || "").trim();
      var foto = (item["Fotografía del lugar"] || "").trim();

      // Remplaza caracteres especiales.
      var slug = createSlug(direccionLugar, "-");
      var zonaSlug = createSlug(direccionLugar, "-");

      // Agrega slugs
      item.slug = slug;
      item.cleanName = createSlug(direccionLugar, " ");
      item.zonaSlug = zonaSlug;

      var card = document.createElement("div");
      card.className = `${slug} ${zonaSlug} card bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md flex flex-col`; // Tailwind card styling

      // Transform the Google Drive URL if needed
      if (foto && foto.includes("drive.google.com/open?id=")) {
        foto = transformarURLGoogleDrive(foto);
        //console.log(foto);
      }

      var image = document.createElement("img");
      image.src = foto ? foto : "avatar.png";
      image.classList = "w-full aspect-square object-contain h-auto";
      card.appendChild(image);

      var cardBody = document.createElement("div");
      cardBody.classList.add("p-4"); // Tailwind padding for card body
      card.appendChild(cardBody);

      var coloniaElement = document.createElement("h3");
      coloniaElement.innerHTML = "<strong>Colonia:</strong> " + colonia;

      coloniaElement.classList.add("py-2", "text-xl", "font-semibold"); // Tailwind for typography
      cardBody.appendChild(coloniaElement);

      var direccionElement = document.createElement("h4");
      direccionElement.innerHTML = "<strong>Dirección: </strong> " + direccionLugar;

      direccionElement.classList.add("py-2", "text-xl", "font-semibold"); // Tailwind for typography
      cardBody.appendChild(direccionElement);
      
      var totalEvacuarElement = document.createElement("h4");
      totalEvacuarElement.innerHTML = "<strong>Total de Personas a Evacuar: </strong> " + totalAevacuar;

      totalEvacuarElement.classList.add("py-2", "text-xl", "font-semibold"); // Tailwind for typography
      cardBody.appendChild(totalEvacuarElement);

      // Grid for additional information
      var grid = document.createElement("div");
      grid.classList.add("grid", "grid-cols-2", "my-3", "mx-2"); // Tailwind grid
      cardBody.appendChild(grid);

      if(parseInt(adultosMayores) !== 0) {
        var adultosMayoresElement = document.createElement("p");
        adultosMayoresElement.innerHTML = "<strong>Adultos Mayores: </strong>" + adultosMayores;
        grid.appendChild(adultosMayoresElement); 
      }

      if(parseInt(adultos) !== 0) {
        var adultosElement = document.createElement("p");
        adultosElement.innerHTML = "<strong>Adultos: </strong>" + adultos;
        grid.appendChild(adultosElement); 
      }
      
      if(parseInt(ninos) !== 0) {

        var ninosElement = document.createElement("p");
        ninosElement.innerHTML = "<strong>Niños: </strong>" + ninos;
        grid.appendChild(ninosElement); 
      }
      
      if(parseInt(discapacitados) !== 0) {

        var discapacitadosElement = document.createElement("p");
        discapacitadosElement.innerHTML = "<strong>Discapacitados: </strong>" + discapacitados;
        grid.appendChild(discapacitadosElement); 
      }
      
      if(parseInt(embarazadas) !== 0) {

        var embarazadasElement = document.createElement("p");
        embarazadasElement.innerHTML = "<strong>Embarazadas: </strong>" + embarazadas;
        grid.appendChild(embarazadasElement); 
      }

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

// Función para transformar la URL de Google Drive
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
