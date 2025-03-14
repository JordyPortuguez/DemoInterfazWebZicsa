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