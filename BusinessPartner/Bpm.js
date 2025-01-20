document.getElementById('excelFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' }); // Lee el archivo Excel
        const sheetName = workbook.SheetNames[0]; // Toma el nombre de la primera hoja
        const sheet = workbook.Sheets[sheetName]; // Obtiene la hoja
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convierte la hoja en un array de filas
  
        populateTable(rows.slice(1)); // Omite la primera fila del Excel
        populateTable(rows.slice(2)); // Omite la primera fila del Excel
      };
  
      reader.readAsArrayBuffer(file);
    }
  });
  
  function populateTable(rows) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Limpia la tabla antes de agregar datos
  
    rows.forEach((row) => {
      const tr = document.createElement('tr');
  
      // Lista de encabezados que se espera en el Excel
      const fields = ['CardCode', 'CardName', 'CardType', 'GroupCode', 'RUC', 'EmailAddress', 'Nombre Comercial'];
  
      fields.forEach((field, index) => {
        const td = document.createElement('td');
        td.textContent = row[index] || ''; // Si falta algún dato, deja la celda vacía
        tr.appendChild(td);
      });
  
      tableBody.appendChild(tr);
    });
  }
  
  