
// Obtiene referencias a elementos del DOM: el formulario de inicio de sesión y el contenedor del spinner
const formulario = document.getElementById('SignInForm');
const spinner = document.getElementById('loadingContainer');

// Agrega un evento de escucha para el envío del formulario
formulario.addEventListener('submit',  async (evento) => {
    // Previene el comportamiento predeterminado del formulario
    evento.preventDefault();
    // Muestra el spinner de carga
    spinner.style.display = 'flex';

    // Define las credenciales del usuario para la autenticación
    const USER_CREDENTIALS = {
        CompanyDB: "SBO_ZICSA_05122024",  // Base de datos de la compañía
        UserName: document.getElementById("inputUserCode").value.trim(),  // Obtiene y limpia el valor del campo de usuario
        Password: document.getElementById("inputPassword").value.trim(),   // Obtiene y limpia el valor del campo de contraseña
    };
   
    try {
        // Realiza una petición POST al servidor de autenticación
        const response = await fetch("https://192.168.1.10:50000/b1s/v1/Login", {
            method: 'POST',
            //mode: "cors",  // Modo CORS comentado
            credentials: 'include',  // Incluye las credenciales en la petición
            headers: {
                'Content-Type': 'application/json'   // Establece el tipo de contenido como JSON
            },
            body: JSON.stringify(USER_CREDENTIALS)  // Convierte las credenciales a formato JSON
        });

        // Verifica si la respuesta es exitosa o si es un error de autenticación (401)
        if (response.ok || response.status == 401) {
            const data = await response.json();  // Parsea la respuesta a JSON
            
            // Verifica si se obtuvo un ID de sesión (login exitoso)
            if (data.SessionId) {
                spinner.style.display = 'none';  // Oculta el spinner
                window.location.href = "/index.html";  // Redirige al usuario a la página principal
                console.log(data);  // Muestra los datos de la sesión en la consola
            } else {
                spinner.style.display = 'none';  // Oculta el spinner
                alert('Credenciales inválidas, por favor intenta nuevamente.');  // Muestra mensaje de error
                console.log(data.error.message.value);  // Muestra el mensaje de error en la consola
            }
        } else {
            spinner.style.display = 'none';  // Oculta el spinner
            alert('Error en la comunicación con el servidor.');  // Muestra mensaje de error de comunicación
        }
    }
    catch (error) {
        spinner.style.display = 'none';  // Oculta el spinner
        console.error('Error:', error);  // Registra el error en la consola
        alert('Ocurrió un error inesperado en la aplicación. Vuelta a Intentar.');  // Muestra mensaje de error general
    }
});