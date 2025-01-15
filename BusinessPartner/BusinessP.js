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
//Declaracion de variables fijas
const Currency="##";
const U_BPP_BPTP="TPJ";
const U_BPP_BPTD="6";
const U_VS_MAIL_SEC="facturas.contabilidad@zicsa.com";



//UPDATE