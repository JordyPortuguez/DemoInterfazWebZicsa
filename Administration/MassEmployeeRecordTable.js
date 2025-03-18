document.getElementById('employeeTable').addEventListener('paste', function(event) {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData('text');
    const rows = text.split('\n');
    const table = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
    table.innerHTML = ""; // Limpiar la tabla antes de pegar nuevos datos
    rows.forEach((row, rowIndex) => {
        const cells = row.split('\t');
        if (cells.length > 0 && cells.some(cell => cell.trim() !== "")) { // Verificar si la fila tiene contenido
            const newRow = table.insertRow();
            // Crear la celda para el número de fila
            const rowNumberCell = newRow.insertCell();
            rowNumberCell.innerHTML = rowIndex + 1;

            // Insertar celdas para "Nro Documento" hasta "Apellidos"
            for (let i = 0; i < 4; i++) {
                const newCell = newRow.insertCell();
                if (cells[i]) {
                    newCell.innerHTML = cells[i];
                }
                newCell.contentEditable = true;
            }

            // Crear la celda para "Resultado" (inicialmente vacía)
            const resultadoCell = newRow.insertCell();
            resultadoCell.innerHTML = ""; // Inicialmente vacía
        }
    });
});

document.getElementById('FormularioEmpleado').addEventListener('submit',  async (evento) => {
    evento.preventDefault();
    
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


    document.getElementById('createEmployee').addEventListener('click', function(event) {
    event.preventDefault();

    const table = document.getElementById('employeeTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    const sendEmployee = (rowIndex) => {
        if (rowIndex >= rows.length) {
            return; // Terminar si se han procesado todas las filas
        }

        const cells = rows[rowIndex].getElementsByTagName('td');
        if (cells.length > 0) {
            const employee = {
                "OfficeExtension" : cells[1].textContent,
                "FirstName" : cells[2].textContent,
                "MiddleName": cells[3].textContent,
                "LastName": cells[4].textContent
            };

            fetch('https://192.168.1.10:50000/b1s/v1/EmployeesInfo', {
                method: 'POST',
                credentials: 'include',
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employee)
            })
            .then(response => response.json())
            .then(data => {
                const resultCell = rows[rowIndex].getElementsByTagName('td')[5];
                resultCell.textContent = "Empleado Creado : "+data.EmployeeID;
                sendEmployee(rowIndex + 1); // Procesar la siguiente fila
                console.log("Empleado Creado : "+data.EmployeeID);
            })
            .catch(error => {
                const resultCell = rows[rowIndex].getElementsByTagName('td')[5];
                resultCell.textContent = 'Error: ' + error.message;
                sendEmployee(rowIndex + 1); // Procesar la siguiente fila a pesar del error
                console.log(data.error.message.value);
            });
        } else {
             sendEmployee(rowIndex + 1); // Procesar la siguiente fila si la actual esta vacia
        }
    };

    sendEmployee(0); // Iniciar el procesamiento desde la primera fila
});