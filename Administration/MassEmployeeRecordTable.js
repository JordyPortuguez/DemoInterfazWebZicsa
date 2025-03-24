const spinner = document.getElementById('loadingContainer');

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

    document.getElementById('createEmployee').addEventListener('click', function(event) {
    event.preventDefault();
    spinner.style.display = 'flex'; // Mostrar spinner    
    const table = document.getElementById('employeeTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    const sendEmployee = (rowIndex) => {
        if (rowIndex >= rows.length) {          
            spinner.style.display = 'none';
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
                if(data.EmployeeID)
                {
                    resultCell.textContent = "Empleado Creado : "+data.EmployeeID;
                    console.log("Empleado Creado : "+data.EmployeeID);
                }    
                else
                {
                    resultCell.textContent = data.error.message.value;
                    console.log(resultCell.textContent );

                }
                sendEmployee(rowIndex + 1); // Procesar la siguiente fila
                
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