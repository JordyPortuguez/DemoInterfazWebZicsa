// function createEmployees(employeesData) {
//     if (!sessionId) {
//         console.error("Sesión no válida. Reautenticando...");
//         authenticate(() => createEmployees(employeesData));
//         return;
//     }

//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "https://192.168.1.10:50000/b1s/v1/EmployeesInfo", true);
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.withCredentials = true;

//     xhr.onload = function () { // Define lo que ocurre cuando el servidor responde
//         if (xhr.status === 201 || xhr.status === 200) { // Si la respuesta indica éxito (201 o 200)
//           const providerData = JSON.parse(xhr.responseText); // Convierte la respuesta en JSON
//           console.log("Socio de negocio creado exitosamente:", providerData); // Muestra un mensaje de éxito en la consola
//           //fillProviderForm(providerData); // Llama a una función para llenar un formulario con los datos del socio creado
//         } else if (xhr.status === 401) { // Si la sesión es inválida o ha expirado
//           console.error("Sesión inválida o expirada. Reautenticando...");
//           authenticate(() => createBusinessPartner(businessPartnerData)); // Reautentica y reintenta la solicitud
//         } else if (xhr.status === 400) { // Si hay un error en los datos enviados
//           console.error("Error en los datos enviados:", xhr.responseText); // Muestra el error en la consola
//           alert("Error en los datos enviados. Verifique los valores ingresados."); // Notifica al usuario sobre el error
//         } else { // Cualquier otro error inesperado
//           console.error("Error inesperado al crear el socio de negocio:", xhr.status, xhr.responseText);
//           alert("Hubo un error inesperado. Por favor, intente de nuevo."); // Notifica al usuario de un error general
//         }
//       };

//     xhr.onerror = function () {
//         console.error("Error de red o de conexión al servidor.");
//         alert("No se pudo conectar al servidor. Verifique su conexión.");
//     };

//     xhr.send(JSON.stringify(employeesData));
// }

// document.getElementById("createEmployee").addEventListener("click", function (e) {
//     e.preventDefault();
//     // Validaciones
//     if (!FirstName  ||  FirstName.length < 2 || FirstName.length > 50) {
//         alert("El campo 'Nombre' es obligatorio, debe tener entre 2 y 50 caracteres.");
//         return;
//     }

//     if (!LastName || LastName.length < 2 || LastName.length > 50) {
//         alert("El campo 'Apellidos' es obligatorio, debe tener entre 2 y 50 caracteres.");
//         return;
//     }

//     if (!OfficeExtension || OfficeExtension.length > 50) {
//         alert("El campo 'Nro Documento' es obligatorio y no debe exceder los 50 caracteres.");
//         return;
//     }

//     const employeesData = {
//         "EmployeeID" : "",
//         LastName: document.getElementById("LastName").value.trim(),
//         FirstName: document.getElementById("FirstName").value.trim(),
//         MiddleName: document.getElementById("MiddleName").value.trim() || null, // Si está vacío, envía null.
//         OfficeExtension: document.getElementById("OfficeExtension").value.trim(),
//         Active: "tYES" // Valor predeterminado.
//     };

//     createEmployees(employeesData);
// });




console.log('Ingresa a archivo javascript');
const loginUrl = "https://192.168.1.10:50000/b1s/v1/Login";
const CreateEmployeeUrl = "https://192.168.1.10:50000/b1s/v1/EmployeesInfo";
let sessionId=null;
const Credenciales = {
  CompanyDB: "SBO_ZICSA_05122024",
  Password: "B1Admin",
  UserName: "manager"
};

// const Employee = {
//   "FirstName": "Elsa",
//   "LastName": "Patito",
//   "MiddleName": "Alv",
//   "OfficeExtension": "999999"
// };

// Convertir el objeto a JSON
// const jsonData = JSON.stringify(Credenciales);

 document.getElementById("Login").addEventListener("click", function (e) 
 {
    e.preventDefault();
    console.log('Ingresa fetch');

    fetch(loginUrl, {
    method: 'POST',
    mode: "cors",
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'   
           },
  body: JSON.stringify(Credenciales)
     })
.then(response => response.json())
.then(data => {
              console.log(data);
              sessionId=data.SessionId;
              console.log("SessionId : "+sessionId);
              }
      )
.catch((error) => {
                  console.error('Error:', error);
                  alert("Error");
                  }
      )
  ;   
    }
  );
  document.getElementById("createEmployee").addEventListener("click", function (f)    
  {
         f.preventDefault();
        const Employee = {
        "FirstName": document.getElementById("FirstName").value.trim(),
        "LastName": document.getElementById("LastName").value.trim(),
        "MiddleName": document.getElementById("MiddleName").value.trim(),
        "OfficeExtension": document.getElementById("OfficeExtension").value.trim()

      };

      console.log("Entra a funcion crear empleados :");
      
      fetch(CreateEmployeeUrl, {
        method: 'POST',
        credentials: 'include',
        mode: "cors",
        headers: {
            'Content-Type': 'application/json'   
                 },
        body: JSON.stringify(Employee)
           })
      .then(response => response.json())
      .then(data => {
                    console.log(data);
                    console.log("Empleado Creado : "+data.EmployeeID);
                    }
            )
      .catch((error) => {
                         console.error("erroooooooor :"+error);
                         alert("error");
                         alert("error"+error.message);
                         alert(`Hubo un error al enviar los datos: ${error.message}`);
                         console.log("errorooo :"+error,message);

                        }
            )

  }
);

console.log('termina archivo javascript');