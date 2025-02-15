// // Función para enviar la solicitud POST
// async function sendData(url, data) {
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       // Si la respuesta no es OK, lanza un error
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Manejar la respuesta si es exitosa
//     const result = await response.json();
//     console.log('Success:', result);
//   } catch (error) {
//     // Manejar el error aquí
//     console.error('Error occurred:', error);

//     // Ejemplo de manejo de errores específicos
//     if (error.message.includes('NetworkError')) {
//       alert('Network error, please try again later.');
//     } else if (error.message.includes('400')) {
//       alert('Bad request, please check your data.');
//     } else if (error.message.includes('500')) {
//       alert('Server error, please try again later.');
//     } else {
//       alert(`Unexpected error: ${error.message}`);
//     }
//   }
// }

// // Ejemplo de uso
// const url = 'https://ejemplo.com/api';
// const data = { name: 'Jane Doe', age: 25 };

// sendData(url, data);
