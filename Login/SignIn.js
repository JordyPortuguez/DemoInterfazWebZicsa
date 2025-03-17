
const formulario = document.getElementById('SignInForm');
const spinner = document.getElementById('loadingSpinner');
formulario.addEventListener('submit',  async (evento) => {
    evento.preventDefault();
    spinner.style.display = 'block'; // Mostrar spinner
const USER_CREDENTIALS = {
        CompanyDB: "SBO_ZICSA_05122024",
        UserName: document.getElementById("inputUserCode").value.trim(),
        Password: document.getElementById("inputPassword").value.trim(),  
};
   
try{
const response= await fetch("https://192.168.1.10:50000/b1s/v1/Login", {
  method: 'POST',
  mode: "cors",
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'   
         },
body: JSON.stringify(USER_CREDENTIALS)
   });
   if (response.ok || response.status==401) {
    const data = await response.json();
    // Verificar si el login es exitoso capturara un SessionId
    if (data.SessionId) {
        spinner.style.display = 'none';
        window.location.href ="/index.html"; // Redirige al index.html
        console.log(data);
    } else {
        spinner.style.display = 'none';
        alert('Credenciales inválidas, por favor intenta nuevamente.');
        console.log(data.error.message.value);
    }
} else {
      spinner.style.display = 'none';
      alert('Error en la comunicación con el servidor.');
}
}
catch (error) {
        spinner.style.display = 'none';
        console.error('Error:', error);
        alert('Ocurrió un error inesperado en la aplicación. Vuelta a Intentar.');
}

});