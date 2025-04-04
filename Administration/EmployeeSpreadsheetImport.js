const spinner = document.getElementById('loadingContainer');

document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.getElementById('ImportButton');
    const fileInput = document.getElementById('formFile');
    const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];

    importButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 1 }); // Start from row 2 (index 1)

                processExcelData(jsonData);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Por favor, selecciona un archivo Excel.');
        }
    });

    function processExcelData(data) {
        employeeTable.innerHTML = ''; // Clear existing table data
        let rowNumber = 1;

        data.forEach(row => {
            if (row && row.length >= 5) {
                const newRow = employeeTable.insertRow();

                // Add row number
                const cellNumber = newRow.insertCell(0);
                cellNumber.textContent = rowNumber++;

                // Add data from Excel columns 2, 3, 4, 5
                const cellDocument = newRow.insertCell(1);
                cellDocument.textContent = row[1] || '';

                const cellName = newRow.insertCell(2);
                cellName.textContent = row[2] || '';

                const cellSecondName = newRow.insertCell(3);
                cellSecondName.textContent = row[3] || '';

                const cellLastName = newRow.insertCell(4);
                cellLastName.textContent = row[4] || '';

                // Add empty result cell
                newRow.insertCell(5);
            }
        });
    }
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