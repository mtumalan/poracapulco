// Hoisting vars.
var personas = [];
var filtered = [];

var dataList,
  filteredList,
  filtroCampo,
  filtroEntrada,
  filtrarButton,
  filtroColonia,
  errorMessage;

var csvFileURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSt2NyNi1j5lkpkyjVWgpTcdlVSSTvanrE4cVnxLmIixQPcgVhnZDSEkOsWhd6RFvJbT9YHruk0C3S5/pub?gid=208503125&single=true&output=csv";

function abreNuevoReporte() {
  window.open(
    "https://forms.gle/RPPbJS7AGk5TjGcJA",
    "_blank"
  );
}

function createSlug(value, separator) {
  return value
    .toLowerCase()
    .replace(/[áàâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/\W+/g, separator || "-")  // Reemplaza cualquier carácter no alfanumérico por el separador
    .trim();  // Asegúrate de quitar espacios innecesarios
}

function normalizeString(str) {
  return str
    .trim()
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/[^A-Z0-9]+/g, ' '); // Reemplaza caracteres no alfanuméricos por un espacio
}

// Levenshtein Distance function
function getLevenshteinDistance(a, b) {
  const matrix = Array(a.length + 1).fill(null).map(() =>
    Array(b.length + 1).fill(null)
  );

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

// Function to calculate similarity percentage
function calculateSimilarity(a, b) {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1; // If both strings are empty, consider them 100% similar
  const distance = getLevenshteinDistance(a, b);
  return 1 - (distance / maxLength); // Similarity as a percentage (0-1)
}

function normalizeColonias(personas) {
  const colonias = personas.map(persona => {
    // Normaliza la colonia quitando caracteres no deseados, poniendo en mayúsculas y quitando espacios
    return normalizeString(persona["Colonia"] || "").trim();
  });

  // Crea un set con valores únicos para evitar duplicados
  const uniqueColonias = [...new Set(colonias)];

  // Devuelve las colonias ordenadas alfabéticamente
  return uniqueColonias.sort((a, b) => a.localeCompare(b));
}

function renderDropdownColonias(colonias) {
  const dropdown = document.getElementById('filtro-colonia');

  // Add the Tailwind CSS width class to the select element
  dropdown.classList.add("w-64");

  // Populate the dropdown with options
  colonias.forEach(colonia => {
    const option = document.createElement('option');
    option.value = colonia;
    option.textContent = colonia;
    dropdown.appendChild(option);
  });
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
  var esPorColonia = filtroCampo.value === "colonia";

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
      var nombrePublicador = persona["Nombre persona que genera el reporte"] || "";
      var cleanPublicadorName = createSlug(nombrePublicador, " ");

      // Filtra por el nombre del publicador
      if (!cleanPublicadorName.match(regex)) {
        document
          .querySelectorAll("." + CSS.escape(persona.slug))
          .forEach((item) => item.classList.add("hidden"));
      } else {
        filtered.push(persona);
      }
    }
  } else if (esPorColonia) {
    // Normalize the filter input
    var zone = normalizeString(filtro.trim());
  
    for (var i = 0; i < personas.length; i++) {
      var persona = personas[i];
  
      // Normalize the coloniaSlug of the persona
      var normalizedColoniaSlug = normalizeString(persona.coloniaSlug);
  
      // Calculate the similarity between the normalized filter (zone) and the normalizedColoniaSlug
      var similarity = calculateSimilarity(normalizedColoniaSlug, zone);
  
      // Set threshold for similarity (e.g., 40%)
      if (similarity >= 0.4) {
        filtered.push(persona);
        //console.log("filtered: ", filtered);
      } else {
        document
          .querySelectorAll("." + CSS.escape(persona.slug))
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
    filtroCampo.value === "nombre" ? filtroEntrada.value : filtroColonia.value;

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

      // console.log("item: ", index, ": ", item)

      var colonia = (item["Colonia"] || "").trim();
      var direccionLugar = (item["Dirección del lugar"] || "").trim();
      var totalAevacuar = (item["Número de personas en total a evacuar"] || "").trim();
      var adultosMayores = (item["¿Cuántas personas de la tercera edad se encuentran?"] || "").trim();
      var adultos = (item["¿Cuántas personas adultas se encuentran?"] || "").trim();
      var ninos = (item["¿Cuántos niños y bebés se encuentran?"] || "").trim();
      var discapacitados = (item["¿Cuántas personas con discapacidad se encuentran?"] || "").trim();
      var embarazadas = (item["¿Cuántas personas embarazadas se encuentran?"] || "").trim();
      var foto = (item["Fotografía del lugar"] || "").trim();
      var nombrePublicador = (item["Nombre persona que genera el reporte"] || "").trim();
      var numeroPublicador = (item["Número de teléfono de contacto"] || "").trim();

      // Remplaza caracteres especiales.
      var slug = createSlug(direccionLugar, "-");
      var coloniaSlug = createSlug(direccionLugar, "-");

      // Agrega slugs
      item.slug = slug;
      item.cleanName = createSlug(direccionLugar, " ");
      item.coloniaSlug = coloniaSlug;

      var card = document.createElement("div");
      card.className = `${slug} ${coloniaSlug} card bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md flex flex-col`; // Tailwind card styling

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
      totalEvacuarElement.innerHTML = "<strong>Total de Personas a Evacuar: </strong> " +  totalAevacuar;

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

      // Sección de información del publicador
      var publicadorSection = document.createElement("div");
      publicadorSection.classList.add("mt-4", "p-2", "bg-gray-100", "rounded-lg"); // Estilos Tailwind para la sección

      var nombreElement = document.createElement("p");
      nombreElement.innerHTML = "<strong>Autor: </strong>" + nombrePublicador;
      publicadorSection.appendChild(nombreElement);

      var numeroElement = document.createElement("p");
      numeroElement.innerHTML = "<strong>Contacto: </strong>" + numeroPublicador;
      publicadorSection.appendChild(numeroElement);

      cardBody.appendChild(publicadorSection);

      filteredList.appendChild(card);
    }
  }
}

// Detect changes in the filtering method
function alCambiarTipo() {
  if (filtroCampo.value === "colonia") {
    // If Colonia is selected, show the Colonia selector
    filtroColonia.style.display = "block";
    filtroEntrada.style.display = "none";
    filtroEntrada.value = "";
    var filtro = filtroColonia.value;
  } else {
    // Otherwise, hide the Colonia selector
    filtroColonia.style.display = "none";
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

          // Normaliza las colonias
          const colonias = normalizeColonias(personas);
          renderDropdownColonias(colonias);
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
  filtroColonia = document.getElementById("filtro-colonia");
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
