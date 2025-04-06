document.addEventListener('DOMContentLoaded', function() {
    // URL de tu API
    const apiUrl = 'https://192.168.1.10:50000/b1s/v1/UsersService_GetCurrentUser'; // Reemplaza con la URL real de tu API

    // Realizar la llamada a la API usando fetch
    fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        mode: "cors",
        headers: {
            'Content-Type': 'application/json'   
                 }
           })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            // Asumiendo que la API devuelve un objeto con la propiedad 'nombreUsuario'
            const nombreUsuario = data.UserName; // 

            // Actualizar el contenido del elemento 'bienvenida'
            document.getElementById('bienvenido').textContent = `Bienvenido ${nombreUsuario}`;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            document.getElementById('bienvenido').textContent = 'No se pudo obtener el nombre del usuario.';
        });
});