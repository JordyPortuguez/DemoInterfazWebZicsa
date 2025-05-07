// Gestión de sesión
let sessionId = null;

// Función de autenticación
function authenticate(callback) {
    const credentials = {
        CompanyDB: "SBO_ZICSA_05122024",
        UserName: "manager",
        Password: "B1Admin"
    };

    fetch("https://192.168.1.10:50000/b1s/v1/Login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(`Error de autenticación: ${response.status}`);
    })
    .then(data => {
        sessionId = data.SessionId;
        if (callback) callback();
    })
    .catch(error => {
        console.error("Error de autenticación:", error);
        alert("Error de autenticación. Por favor, verifique sus credenciales.");
    });
}

// Llamar a authenticate cuando se carga la página
authenticate();

// Función para obtener datos
function fetchProviderData(providerCode) {
    if (!sessionId) {
        console.error("No hay sesión activa. Reautenticando...");
        authenticate(() => fetchProviderData(providerCode));
        return;
    }

    const endpoint = `BusinessPartners('${providerCode}')`;
    
    fetch(`https://192.168.1.10:50000/b1s/v1/${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            throw new Error('not_found');
        } else if (response.status === 401) {
            throw new Error('unauthorized');
        }
        throw new Error(`Error: ${response.status}`);
    })
    .then(providerData => {
        fillProviderForm(providerData);
    })
    .catch(error => {
        if (error.message === 'not_found') {
            alert("Proveedor no encontrado.");
        } else if (error.message === 'unauthorized') {
            console.error("Sesión inválida o expirada. Reautenticando...");
            authenticate(() => fetchProviderData(providerCode));
        } else {
            console.error("Error al obtener datos del proveedor:", error);
        }
    });
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
  if (!sessionId) {
    console.error("Sesión no válida. Reautenticando...");
    authenticate(() => createBusinessPartner(businessPartnerData));
    return;
  }

  fetch("https://192.168.1.10:50000/b1s/v1/BusinessPartners", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(businessPartnerData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            throw new Error('unauthorized');
        } else if (response.status === 400) {
            return response.json().then(errorData => {
                throw new Error(JSON.stringify(errorData));
            });
        }
        throw new Error(`Error: ${response.status}`);
    })
    .then(providerData => {
        console.log("Socio de negocio creado exitosamente:", providerData);
    })
    .catch(error => {
        if (error.message === 'unauthorized') {
            console.error("Sesión inválida o expirada. Reautenticando...");
            authenticate(() => createBusinessPartner(businessPartnerData));
        } else if (error.message.includes('{')) {
            console.error("Error en los datos enviados:", error.message);
            alert("Error en los datos enviados. Verifique los valores ingresados.");
        } else {
            console.error("Error inesperado al crear el socio de negocio:", error);
            alert("Hubo un error inesperado. Por favor, intente de nuevo.");
        }
    });
}

document.getElementById("createProviderButton").addEventListener("click", function () {
  const businessPartnerData = {
    CardCode: document.getElementById("CardCode").value.trim(),
    CardName: document.getElementById("CardName").value.trim(),
    CardType: document.getElementById("CardType").value.trim(),
    GroupCode: parseInt(document.getElementById("GroupCode").value) || 100,
    FederalTaxID: document.getElementById("FederalTaxID").value.trim(),
    EmailAddress: document.getElementById("EmailAddress").value.trim(),
    U_VS_NOMCOM: document.getElementById("U_VS_NOMCOM").value.trim(),
    BPAddresses: [{
      Street: document.getElementById("Street").value.trim(),
      City: document.getElementById("City").value.trim(),
     // State: document.getElementById("State").value.trim(),
      County: document.getElementById("County").value.trim()
    }]
  };

  // Validate required fields
  if (!businessPartnerData.CardCode || !businessPartnerData.CardName) {
    alert("El código y nombre del proveedor son obligatorios.");
    return;
  }

  try {
    createBusinessPartner(businessPartnerData);
  } catch (error) {
    console.error("Error al crear el socio de negocio:", error);
    alert("Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo.");
  }
});

function updateBusinessPartner(businessPartnerData) {
    if (!sessionId) {
        console.error("No hay sesión activa. Reautenticando...");
        authenticate(() => updateBusinessPartner(businessPartnerData));
        return;
    }

    const updateData = {};
    const fields = ['CardName', 'FederalTaxID', 'EmailAddress', 'U_VS_NOMCOM', 'Street', 'City', 'County'];
    
    fields.forEach(field => {
        if (businessPartnerData[field] && businessPartnerData[field].trim() !== '') {
            updateData[field] = businessPartnerData[field].trim();
        }
    });

    const endpoint = `BusinessPartners('${businessPartnerData.CardCode}')`;
    
    fetch(`https://192.168.1.10:50000/b1s/v1/${endpoint}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (response.status === 204) {
            console.log("Socio de negocio actualizado exitosamente.");
        } else if (response.status === 401) {
            throw new Error('unauthorized');
        }
        throw new Error(`Error: ${response.status}`);
    })
    .catch(error => {
        if (error.message === 'unauthorized') {
            console.error("Sesión inválida o expirada. Reautenticando...");
            authenticate(() => updateBusinessPartner(businessPartnerData));
        } else {
            console.error("Error al actualizar el socio de negocio:", error);
        }
    });
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