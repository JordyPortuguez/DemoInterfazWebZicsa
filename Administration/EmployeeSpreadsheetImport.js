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