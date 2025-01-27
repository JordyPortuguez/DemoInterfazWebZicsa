//GET
// Función para obtener datos
function fetchProviderData(providerCode) {
  if (!sessionId) {
    console.error("No hay sesión activa. Reautenticando...");
    authenticate(() => fetchProviderData(providerCode)); // Reautenticar si es necesario
    return;
  }

  const endpoint = `BusinessPartners('${providerCode}')`; // Endpoint para obtener datos del proveedor
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://192.168.1.10:50000/b1s/v1/${endpoint}`, true); // Configurar solicitud
  xhr.setRequestHeader("Content-Type", "application/json");

  // Incluir conCredentials para permitir el envío de cookies de sesión automáticamente
  xhr.withCredentials = true;

  xhr.onload = function () {
    if (xhr.status === 200) {
      const providerData = JSON.parse(xhr.responseText);
      fillProviderForm(providerData); // Llenar el formulario con los datos del proveedor
    } else if (xhr.status === 404) {
      alert("Proveedor no encontrado.");
    } else if (xhr.status === 401) {
      console.error("Sesión inválida o expirada. Reautenticando...");
      authenticate(() => fetchProviderData(providerCode)); // Reautenticar y reintentar
    } else {
      console.error("Error al obtener datos del proveedor:", xhr.status, xhr.responseText);
    }
  };

  xhr.onerror = function () {
    console.error("Error en la solicitud al buscar proveedor.");
  };

  xhr.send();
}

// Función para llenar el formulario con los datos del proveedor
function fillProviderForm(providerData) {
  document.getElementById("CardCode").value = providerData.CardCode || "";
  document.getElementById("CardName").value = providerData.CardName || "";
  document.getElementById("CardType").value = providerData.CardType || "";
  document.getElementById("GroupCode").value = providerData.GroupCode || "";
  document.getElementById("FederalTaxID").value = providerData.FederalTaxID || "";
  document.getElementById("EmailAddress").value = providerData.EmailAddress || "";
  document.getElementById("U_VS_NOMCOM").value = providerData.U_VS_NOMCOM || "";
  document.getElementById("Street").value = providerData.BPAddresses[0].Street || "";
  document.getElementById("City").value = providerData.BPAddresses[0].City || "";
  document.getElementById("State").value = providerData.BPAddresses[0].State || "";
  document.getElementById("County").value = providerData.BPAddresses[0].County || "";
}

// Agregar evento al botón de búsqueda
document.getElementById("searchProviderButton").addEventListener("click", function () {
  const providerCode = document.getElementById("CardCode").value.trim();
  if (providerCode) {
    fetchProviderData(providerCode);
  } else {
    alert("Por favor, ingresa un código de proveedor válido.");
  }
});


//POST
// Función para crear un socio de negocio

function createBusinessPartner(businessPartnerData) {
  // Verificar si la sesión es válida
  if (!sessionId) { // Comprueba si la sesión no está inicializada o ha expirado
    console.error("Sesión no válida. Reautenticando...");
    authenticate(() => createBusinessPartner(businessPartnerData)); // Llama a la función de autenticación y, una vez autenticado, reintenta crear el socio de negocio
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

// Agregar evento al botón de creación
document.getElementById("createProviderButton").addEventListener("click", function (e) {
  e.preventDefault(); // Previene que el botón recargue la página al hacer clic

  // Obteniendo y limpiando los datos del formulario
  const businessPartnerData = {
      "BPAddresses": [
        {
          AddressName: "FISCAL",
          Street:document.getElementById("Street").value.trim(),
          City: document.getElementById("City").value.trim(),
          State: parseInt(document.getElementById("State").value.trim(), 10),
          Country: "PE",
          County: document.getElementById("County").value.trim(),
          AddressType: "bo_BillTo",
          GlobalLocationNumber: "150122",
          BPCode: document.getElementById("CardCode").value.trim(),
          RowNum: "0"
        },
        {
          AddressName: "ALMACEN",
          Street: document.getElementById("Street").value.trim(),
          City: document.getElementById("City").value.trim(),
          State: parseInt(document.getElementById("State").value.trim(), 10),
          Country: "PE",
          County: document.getElementById("County").value.trim(),
          AddressType: "bo_ShipTo",
          GlobalLocationNumber: "150122",
          BPCode: document.getElementById("CardCode").value.trim(),
          RowNum: "1"
        }
      ],
      /*"ContactEmployees": [
        {
          InternalCode: 0,
          Name: "CONTACTO1",
          FirstName: "JORGE",
          MiddleName: "MUÑOZ",
          LastName: "MUÑOZ",
          MobilePhone: "999999999"
        }
      ],*/
      CardCode: document.getElementById("CardCode").value.trim(), // Obtiene y limpia el código del socio
      CardName: document.getElementById("CardName").value.trim(), // Obtiene y limpia el nombre del socio
      CardType: document.getElementById("CardType").value, // Obtiene el tipo de socio (sin limpiar porque es una lista desplegable)
      GroupCode: parseInt(document.getElementById("GroupCode").value.trim(), 10), // Convierte el código del grupo a un número entero
      FederalTaxID: document.getElementById("FederalTaxID").value.trim(), // Obtiene y limpia el ID fiscal
      EmailAddress: document.getElementById("EmailAddress").value.trim(), // Obtiene y limpia el correo electrónico
      U_VS_NOMCOM: document.getElementById("U_VS_NOMCOM").value.trim(), // Obtiene y limpia un campo personalizado
      Currency: "##", // Asigna un valor predeterminado para la moneda
      U_BPP_BPTP: "TPJ", // Asigna un tipo de socio fijo
      U_BPP_BPTD: "6", // Asigna un tipo de documento fijo
      U_VS_MAIL_SEC: "facturas.contabilidad@zicsa.com", // Asigna un correo electrónico secundario fijo
  };

  // Validaciones de los campos obligatorios
  const requiredFields = ["CardCode", "CardName", "CardType"]; // Define los campos obligatorios
  for (let field of requiredFields) { // Itera por los campos obligatorios
    if (!businessPartnerData[field]) { // Si algún campo está vacío
      alert(`El campo ${field} es obligatorio.`); // Muestra un mensaje de error
      return; // Detiene la ejecución de la función
    }
  }

  // Validación de GroupCode (debe ser un número válido)
  if (isNaN(businessPartnerData.GroupCode)) { // Verifica si GroupCode no es un número válido
    alert("El campo GroupCode debe ser un número válido."); // Muestra un mensaje de error
    return; // Detiene la ejecución de la función
  }

  // Llamada a la función createBusinessPartner
  try {
    createBusinessPartner(businessPartnerData); // Llama a la función para crear el socio de negocio
  } catch (error) { // Captura cualquier error inesperado
    console.error("Error al crear el socio de negocio:", error); // Muestra el error en la consola
    alert("Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo."); // Notifica al usuario
  }
});


//PATCH
// Función para actualizar un socio de negocio
// Función para actualizar un socio de negocio
function updateBusinessPartner(businessPartnerData) {
  if (!sessionId) {
    console.error("No hay sesión activa. Reautenticando...");
    authenticate(() => updateBusinessPartner(businessPartnerData));
    return;
  }

  // Crear un nuevo objeto solo con los campos que han cambiado
  const updateData = {};
  const fields = ['CardName', 'FederalTaxID', 'EmailAddress', 'U_VS_NOMCOM', 'Street', 'City', 'County'];
  
  fields.forEach(field => {
    if (businessPartnerData[field] && businessPartnerData[field].trim() !== '') {
      updateData[field] = businessPartnerData[field].trim();
    }
  });

  const endpoint = `BusinessPartners('${businessPartnerData.CardCode}')`;
  const xhr = new XMLHttpRequest();
  xhr.open("PATCH", `https://192.168.1.10:50000/b1s/v1/${endpoint}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.withCredentials = true;

  xhr.onload = function () {
    if (xhr.status === 204) {
      console.log("Socio de negocio actualizado exitosamente.");
    } else if (xhr.status === 401) {
      console.error("Sesión inválida o expirada. Reautenticando...");
      authenticate(() => updateBusinessPartner(businessPartnerData));
    } else {
      console.error("Error al actualizar el socio de negocio:", xhr.status, xhr.responseText);
    }
  };

  xhr.onerror = function () {
    console.error("Error en la solicitud al actualizar socio de negocio.");
  };

  // Enviar solo los datos que han cambiado
  console.log("Datos a actualizar:", JSON.stringify(updateData, null, 2));
  xhr.send(JSON.stringify(updateData));
}

document.getElementById("updateProviderButton").addEventListener("click", function (e) {
  e.preventDefault();

  const businessPartnerData = {
    CardCode: document.getElementById("CardCode").value.trim(),
    CardName: document.getElementById("CardName").value.trim(),
    FederalTaxID: document.getElementById("FederalTaxID").value.trim(),
    EmailAddress: document.getElementById("EmailAddress").value.trim(),
    U_VS_NOMCOM: document.getElementById("U_VS_NOMCOM").value.trim(),
  };

  // Validar solo el CardCode ya que es el identificador
  if (!businessPartnerData.CardCode) {
    alert("El código del socio de negocio es obligatorio.");
    return;
  }

  try {
    updateBusinessPartner(businessPartnerData);
  } catch (error) {
    console.error("Error al actualizar el socio de negocio:", error);
    alert("Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo.");
  }
});