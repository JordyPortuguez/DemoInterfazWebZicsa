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
authenticate();