// Obtener datos del excel y mostrarlos en la tabla

document.getElementById('excelFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' }); // Lee el archivo Excel
        const sheetName = workbook.SheetNames[0]; // Toma el nombre de la primera hoja
        const sheet = workbook.Sheets[sheetName]; // Obtiene la hoja
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convierte la hoja en un array de filas
  
        populateTable(rows.slice(1)); // Omite la primera fila del Excel
        populateTable(rows.slice(2)); // Omite la primera fila del Excel
      };
  
      reader.readAsArrayBuffer(file);
    }
  });
  
  function populateTable(rows) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Limpia la tabla antes de agregar datos
  
    rows.forEach((row) => {
      const tr = document.createElement('tr');
  
      // Lista de encabezados que se espera en el Excel
      const fields = ['CardCode', 'CardName', 'CardType', 'GroupCode', 'RUC', 'EmailAddress', 'Nombre Comercial'];
  
      fields.forEach((field, index) => {
        const td = document.createElement('td');
        td.textContent = row[index] || ''; // Si falta algún dato, deja la celda vacía
        tr.appendChild(td);
      });
  
      tableBody.appendChild(tr);
    });
  }

  //------------------------------------------------------------------------------------------------------------//
  // Obtener datos de la tabla previamente cargada de excel y enviarlos a la API de SAP Business One
  function createProvider(businessPartnerData) {
    // Verificar si la sesión es válida
    if (!sessionId) { // Comprueba si la sesión no está inicializada o ha expirado
      console.error("Sesión no válida. Reautenticando...");
      authenticate(() => createProvider(businessPartnerData)); // Llama a la función de autenticación y, una vez autenticado, reintenta crear el socio de negocio
      return; // Sale de la función hasta que se complete la autenticación
    }
  
    // Crear la solicitud para crear el socio de negocio
    const xhr = new XMLHttpRequest(); // Instancia un objeto XMLHttpRequest para realizar una solicitud HTTP
    xhr.open("POST", "https://192.168.1.10:50000/b1s/v1/BusinessPartners", true); // Configura la solicitud como POST hacia la URL del servicio
  
    // Configurar encabezados
    xhr.setRequestHeader("Content-Type", "application/json"); // Establece que los datos enviados serán en formato JSON
    xhr.withCredentials = true; // Habilita el envío automático de cookies para mantener la sesión
  
    // Manejar la respuesta del servidor
    xhr.onload = function () { // Define lo que ocurre cuando el servidor responde
      if (xhr.status === 201 || xhr.status === 200) { // Si la respuesta indica éxito (201 o 200)
        const providerData = JSON.parse(xhr.responseText); // Convierte la respuesta en JSON
        console.log("Socio de negocio creado exitosamente:", providerData); // Muestra un mensaje de éxito en la consola
       // fillProviderForm(providerData); // Llama a una función para llenar un formulario con los datos del socio creado
      } else if (xhr.status === 401) { // Si la sesión es inválida o ha expirado
        console.error("Sesión inválida o expirada. Reautenticando...");
        authenticate(() => createBusinessPartner(businessPartnerData)); // Reautentica y reintenta la solicitud
      } else if (xhr.status === 400) { // Si hay un error en los datos enviados
        console.error("Error en los datos enviados:", xhr.responseText); // Muestra el error en la consola
        alert("Error en los datos enviados. Verifique los valores ingresados."); // Notifica al usuario sobre el error
      } else { // Cualquier otro error inesperado
        console.error("Error inesperado al crear el socio de negocio:", xhr.status, xhr.responseText);
        alert("Hubo un error inesperado. Por favor, intente de nuevo."); // Notifica al usuario de un error general
      }
    };
  
    xhr.onerror = function () { // Define qué ocurre si hay un problema de red o conexión
      console.error("Error de red o de conexión al servidor.");
      alert("No se pudo conectar al servidor. Verifique la red o intente más tarde."); // Notifica al usuario sobre problemas de conexión
    };
  
    // Enviar los datos del socio de negocio
    xhr.send(JSON.stringify(businessPartnerData)); // Convierte los datos a JSON y los envía al servidor
  }

  // Función para crear múltiples proveedores
function createMultipleProviders(providers) {
  for (let i = 0; i < providers.length; i++) {
    console.log("Creando proveedor:", providers[i].CardCode);
    createProvider(providers[i]); // Crea cada proveedor de forma sincrónica
  }

  console.log("Todos los proveedores han sido procesados.");
  alert("Proceso de creación de proveedores completado.");
}

// Función para cargar datos desde un archivo Excel
function loadProvidersFromExcel(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0]; // Usa la primera hoja
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet); // Convierte a JSON

    const jsonWithoutHeader = json.slice(1); // Aquí omites tanto la primera como la segunda fila

    console.log("Datos del Excel cargados:", jsonWithoutHeader);
    createMultipleProviders(jsonWithoutHeader); // Llama directamente a la creación de proveedores
  };
   
  reader.onerror = function () {
    console.error("Error al leer el archivo Excel.");
    alert("No se pudo leer el archivo.");
  };

  reader.readAsArrayBuffer(file); // Lee el archivo como un buffer
}
// Evento para manejar el archivo Excel y crear proveedores
document.getElementById("excelFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    loadProvidersFromExcel(file);
  } else {
    alert("Selecciona un archivo válido.");
  }
});