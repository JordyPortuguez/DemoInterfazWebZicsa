

const CreateEmployeeUrl = "https://192.168.1.10:50000/b1s/v1/EmployeesInfo";
let sessionId=null;
const Credenciales = {
  CompanyDB: "SBO_ZICSA_05122024",
  Password: "B1Admin",
  UserName: "manager"
};

    fetch("https://192.168.1.10:50000/b1s/v1/Login", {
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
  console.log("salio de login");   
  const formulario = document.getElementById('FormularioEmpleado');

  formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
   
  const Employee = {
    "FirstName": document.getElementById("FirstName").value.trim(),
    "LastName": document.getElementById("LastName").value.trim(),
    "MiddleName": document.getElementById("MiddleName").value.trim(),
    "OfficeExtension": document.getElementById("OfficeExtension").value.trim()
  };
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
                if(data.EmployeeID='null')
                {
                alert(data.error.message.value);
                }
                else{
                alert("Empleado Creado : "+data.EmployeeID);
                    }
                }
        )
  .catch((error) => {
                     console.error('erroooooooor :',error);
                     console.error('erroooooooor :',error.code);
                     alert('ERROOOOR  : ',error.message.value);
                    }
        )




  });

