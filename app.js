const loginUrl = "https://192.168.1.10:50000/b1s/v1/Login"; // URL de inicio de sesión
let sessionId = null; // ID de sesión

// Función para autenticarse
function authenticate() { // Función para autenticarse
  // Crear una nueva solicitud
  const xhrLogin = new XMLHttpRequest();// Objeto XMLHttpRequest // Permite realizar solicitudes HTTP asíncronas en JavaScript
  // Método open // Inicializa una solicitud // xhr.open(método, url, asincrónico) // Método: GET, POST, PUT, DELETE // URL: dirección del recurso // Asincrónico: true o false
  xhrLogin.open("POST", loginUrl, true); // Abrir la solicitud // true para que sea asincrónico // false para que sea sincrónico //
 // Establecer encabezado // Tipo de contenido // JSON
  xhrLogin.setRequestHeader("Content-Type", "application/json"); 

  // Datos de inicio de sesión // Convertir a JSON
  const loginData = JSON.stringify({
    UserName: "manager",
    Password: "B1Admin",
    CompanyDB: "SBO_ZICSA_05122024"
  });

// Habilitar cookies
  xhrLogin.withCredentials = true; // Habilitar cookies

  // Función para manejar la respuesta
  xhrLogin.onload = function () {
    if (xhrLogin.status === 200) { // Si la solicitud fue exitosa
      const response = JSON.parse(xhrLogin.responseText); // Convertir la respuesta a JSON
      sessionId = response.SessionId; // Guardar el ID de sesión
      console.log("Sesión iniciada con cookies."); // Mensaje de éxito
    } else { 
      // Si hubo un error / Código de estado // Respuesta //
      console.error("Error al iniciar sesión:", xhrLogin.status, xhrLogin.responseText); // Mensaje de error
    }
  };
// Función para manejar errores
  xhrLogin.onerror = function () { 
    console.error("Error en la solicitud de autenticación."); // Mensaje de error
  };

  xhrLogin.send(loginData); // Enviar los datos de inicio de sesión
}
console.log("Inicio de sesion Exitoso")


// Función para obtener datos
function fetchData(providerCode) {
  if (!sessionId) {
    console.error("No hay una sesión válida. Intenta autenticarse nuevamente.");
    return;
  }

  const endpoint = `BusinessPartners('${providerCode}')`;
  const xhrData = new XMLHttpRequest();
  xhrData.open("GET", `https://192.168.1.10:50000/b1s/v1/${endpoint}`, true);
  xhrData.setRequestHeader("Content-Type", "application/json");


  xhrData.onload = function () {
    if (xhrData.status === 200) {
      const data = JSON.parse(xhrData.responseText);
      console.log(`Datos obtenidos del proveedor ${providerCode}:`, data);
      populateTable(data); // Llenar la tabla con los datos
    } else if (xhrData.status === 401) {
      console.error("Sesión inválida o expirada. Reautenticando...");
      authenticate(); // Reautenticar
    } else {
      console.error("Error al obtener datos:", xhrData.status, xhrData.responseText);
    }
  };

  xhrData.onerror = function () {
    console.error("Error en la solicitud de datos.");
  };

  xhrData.send();
}

// Función para llenar la tabla
function populateTable(data) {
  const tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = ""; // Limpiar datos previos

  const row = document.createElement("tr");

  const cardCodeCell = document.createElement("td");
  cardCodeCell.textContent = data.CardCode || "N/A";
  row.appendChild(cardCodeCell);

  const cardNameCell = document.createElement("td");
  cardNameCell.textContent = data.CardName || "N/A";
  row.appendChild(cardNameCell);

  const cardTypeCell = document.createElement("td");
  cardTypeCell.textContent = data.CardType || "N/A";
  row.appendChild(cardTypeCell);

  tableBody.appendChild(row);
}

// Manejar el envío del formulario
document.getElementById("providerForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Evitar que la página se recargue
  const providerCode = document.getElementById("providerCode").value.trim();
  if (providerCode) {
    fetchData(providerCode); // Obtener los datos del proveedor
  } else {
    alert("Por favor, ingresa un código de proveedor válido.");
  }
});

// Iniciar autenticación al cargar la página
authenticate();
