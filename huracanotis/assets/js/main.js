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

var csvFileURL = "https://script.google.com/macros/s/AKfycbxGw_lDWj-EYi9yMaybsPurff6VjVFlcVIfYiXYSx6qPSooW97ybMZ_hYpTM7m6hPiY/exec";

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
      var match = persona.zonaSlug === zone

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
  // filteredList.innerHTML = ""; // Limpiamos la lista antes de renderizar

  personas = personas.reverse();

  if (personas && personas.length > 0) {
    for (var index = 0; index < personas.length; index++) {
      const item = personas[index];

      var nombre = (item["Nombre persona desaparecida"] || "").trim();
      var edad = String(item["Edad"] || "").trim();
      var sexo = (item["Sexo"] || "").trim();
      var rasgos = (item["Rasgos distintivos"] || "").trim();
      var zona = (item["Zona"] || "").trim();
      var ultima = (item["Última ubicación conocida"] || "").trim();
      var estado = (item["Estado de la persona"] || "").trim();
      var foto = (item["Fotografía"] || "").trim();
      var numero = String(item["Número de teléfono de contacto"] || "").trim();

      // Remplaza caracteres especiales.
      var slug = createSlug(nombre, "-");
      var zonaSlug = createSlug(zona, "-");

      //Agrega slugs
      item.slug = slug;
      item.cleanName = createSlug(nombre, " ");
      item.zonaSlug = zonaSlug;

      var card = document.createElement("div");
      card.className = `${slug} ${zonaSlug} card bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center w-full`;

      // Transform the Google Drive URL if needed
      if (foto && foto.includes("drive.google.com/open?id=")) {
        foto = transformarURLGoogleDrive(foto);
        console.log(foto);
      } 

      var image = document.createElement("img");
      image.src = foto ? foto : "avatar.png";
      image.classList = "w-24 h-24 rounded-full mb-3 object-cover";
      card.appendChild(image);

      var cardBody = document.createElement("div");
      cardBody.classList.add("flex", "flex-col", "items-center", "text-center", "w-full");
      card.appendChild(cardBody);

      var nombreElement = document.createElement("h3");
      nombreElement.innerHTML = nombre;
      nombreElement.classList.add("text-lg", "font-bold");
      cardBody.appendChild(nombreElement);

      var infoElement = document.createElement("p");
      infoElement.innerHTML = `Edad: ${edad} años | Sexo: ${sexo}`;
      infoElement.classList.add("text-gray-500", "text-sm");
      cardBody.appendChild(infoElement);

      var zonaElement = document.createElement("p");
      zonaElement.innerText = `Zona: ${zona}`;
      zonaElement.classList.add("text-gray-500", "text-sm");
      cardBody.appendChild(zonaElement);

      var ultimaElement = document.createElement("p");
      ultimaElement.innerText = `Última ubicación: ${ultima}`;
      ultimaElement.classList.add("text-gray-700", "mt-2");
      cardBody.appendChild(ultimaElement);

      if (rasgos) {
        var rasgosElement = document.createElement("p");
        rasgosElement.innerText = `Rasgos distintivos: ${rasgos}`;
        rasgosElement.classList.add("text-gray-700", "mt-2");
        card.appendChild(rasgosElement);
      }

      var estadoElement = document.createElement("p");
      estadoElement.innerText = `Estado: ${estado}`;
      estadoElement.classList.add("text-red-500", "font-semibold", "mt-2");
      card.appendChild(estadoElement);

      var numeroElement = document.createElement("p");
      numeroElement.innerText = `Contacto: ${numero}`;
      numeroElement.classList.add("text-sm", "text-gray-600", "mt-2");
      card.appendChild(numeroElement);

      filteredList.appendChild(card);
    }
  }
}

// Llamamos a cargarDatos al cargar la página
//i wonder where to put this hmmm
window.addEventListener("load", function () {
  cargarDatos();
});

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
    .then(response => response.json())
    .then(data => {
      console.log("Datos recibidos:", data); // Verifica que se estén obteniendo los datos correctamente
      personas = data;
      renderLista();
    })
    .catch(error => console.error("Error al cargar datos:", error));
}

function transformarURLGoogleDrive(url) {
  var regex = /https:\/\/drive\.google\.com\/(?:open\?id=|file\/d\/)([a-zA-Z0-9_-]+)/;

  // Check if the URL matches either of the formats
  var match = url.match(regex);

  // If a match is found, return the transformed thumbnail URL with size
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }

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

document.addEventListener("DOMContentLoaded", function () {
  filtroCampo = document.getElementById("filtro-campo");
  filtroEntrada = document.getElementById("filtro-entrada");
  filtroZona = document.getElementById("filtro-zona");

  filtroCampo.addEventListener("change", function () {
    if (filtroCampo.value === "zona") {
      filtroEntrada.style.display = "none"; 
      filtroZona.style.display = "block"; 
    } else {
      filtroZona.style.display = "none"; 
      filtroEntrada.style.display = "block"; 
    }
  });
});
