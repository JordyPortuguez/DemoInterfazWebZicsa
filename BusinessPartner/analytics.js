// Configuración de la conexión con SAP B1
const baseUrl = "https://192.168.1.10:50000/b1s/v1/";
let sessionId = null;

const credentials = {
    CompanyDB: "SBO_ZICSA_05122024",
    UserName: "manager",
    Password: "B1Admin"
};

function authenticate(callback) {
    fetch(`${baseUrl}Login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) throw new Error(`Error autenticación: ${res.status}`);
        return res.json();
    })
    .then(data => {
        sessionId = data.SessionId;
        console.log("Autenticación exitosa. SessionId:", sessionId);
        if (callback) callback();
    })
    .catch(err => {
        console.error("Error autenticación:", err);
        alert("Error al conectar con SAP B1. Por favor, verifique sus credenciales y conexión.");
    });
}

function checkSession() {
    if (!sessionId) {
        return new Promise(resolve => authenticate(() => resolve()));
    }
    return Promise.resolve();
}

// *** FUNCIÓN CLAVE AÑADIDA PARA PAGINACIÓN MANUAL ***
async function fetchAllODataPages(initialUrl) {
    let allItems = [];
    let nextLink = initialUrl;

    while (nextLink) {
        try {
            const response = await fetch(nextLink, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cookie': `B1SESSION=${sessionId}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('401');
                }
                const text = await response.text();
                throw new Error(`Error al obtener página OData: ${response.status} - ${response.statusText}. Detalles: ${text}`);
            }

            const data = await response.json();
            
            if (data.value && Array.isArray(data.value)) {
                allItems = allItems.concat(data.value);
            }

            nextLink = data['odata.nextLink'] ? `${baseUrl}${data['odata.nextLink']}` : null; // Construir la URL completa
            console.log("Fetched page. Next link:", nextLink); // Debug de paginación
        } catch (error) {
            console.error("Error fetching OData page:", error);
            // Si hay un error, detenemos la paginación y propagamos el error
            throw error; 
        }
    }
    return { value: allItems }; // Devolver los datos acumulados en el formato esperado
}

async function actualizarGraficos() { // Marcado como async
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const tipoEntidad = document.getElementById('tipoEntidad').value;

    if (!dateFrom || !dateTo) {
        alert('Por favor, seleccione un rango de fechas válido');
        return;
    }

    try {
        await checkSession();

        let odataFilter = `$filter=CreateDate ge '${dateFrom}' and CreateDate le '${dateTo}'`;
        
        let cardTypeOdataValue = '';
        if (tipoEntidad === 'clientes') {
            cardTypeOdataValue = 'C'; 
        } else if (tipoEntidad === 'proveedores') {
            cardTypeOdataValue = 'S'; 
        } 
        
        if (cardTypeOdataValue) {
            odataFilter += ` and CardType eq '${cardTypeOdataValue}'`;
        }

        const initialOdataQuery = `BusinessPartners?${odataFilter}&$select=CreateDate,UpdateDate,CardType`;

        console.log("Consulta OData inicial para paginación:", initialOdataQuery);

        // *** CAMBIO CLAVE AQUÍ: Usar fetchAllODataPages para obtener todos los datos ***
        const data = await fetchAllODataPages(`${baseUrl}${initialOdataQuery}`); 
        console.log('Todos los datos recibidos de SAP B1 (OData API, todas las páginas):', data);

        if (!data || !data.value || data.value.length === 0) {
            actualizarDatosGraficos({ dates: [], cantidad: [], tiempoPromedio: [] }, tipoEntidad);
            return;
        }

        // Procesar los datos para calcular Cantidad y Tiempo Promedio de Actualización (en DÍAS) por día
        const dailyStats = new Map(); // Mapa para agrupar por fecha (YYYY-MM-DD)

        data.value.forEach(item => {
            const createDateFormatted = new Date(item.CreateDate).toISOString().slice(0,10); 
            
            if (!dailyStats.has(createDateFormatted)) {
                dailyStats.set(createDateFormatted, {
                    CreateDate: createDateFormatted,
                    totalTimeDiffDays: 0, 
                    countRecordsForTimeAverage: 0, 
                    cantidadRegistros: 0 
                });
            }

            const dayData = dailyStats.get(createDateFormatted);
            
            dayData.cantidadRegistros++; 
            dayData.countRecordsForTimeAverage++; 

            // Calcular la diferencia de tiempo en DÍAS
            const createDateTime = new Date(item.CreateDate);
            const updateDateTime = (item.UpdateDate && !isNaN(new Date(item.UpdateDate))) ? new Date(item.UpdateDate) : new Date(); 
            
            const oneDayMs = 1000 * 60 * 60 * 24; 
            const timeDiffDays = Math.round( (updateDateTime.getTime() - createDateTime.getTime()) / oneDayMs ); 
            
            if (timeDiffDays >= 0) { 
                dayData.totalTimeDiffDays += timeDiffDays;
            }
        });

        // Filtrar y convertir el Map a un array, calculando promedios
        const finalProcessedData = Array.from(dailyStats.values()).filter(group => group.cantidadRegistros > 0).map(group => ({
            CreateDate: group.CreateDate,
            Cantidad: group.cantidadRegistros, 
            TiempoPromedio: (group.countRecordsForTimeAverage > 0 ? (group.totalTimeDiffDays / group.countRecordsForTimeAverage) : 0).toFixed(2) 
        }));

        // Ordenar por fecha para asegurar el orden correcto en los gráficos
        finalProcessedData.sort((a, b) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());

        // Preparar los datos para Chart.js
        const chartData = {
            dates: finalProcessedData.map(d => d.CreateDate),
            cantidad: finalProcessedData.map(d => d.Cantidad),
            tiempoPromedio: finalProcessedData.map(d => d.TiempoPromedio)
        };

        // Identificar la fecha con más registros y mostrar en el resumen
        let maxCountDate = '';
        let maxCount = 0;
        let totalRecordsInPeriod = 0;
        let totalTimeDiffSumInPeriod = 0; 
        let countForOverallAverage = 0; 

        finalProcessedData.forEach(item => {
            totalRecordsInPeriod += item.Cantidad;
            
            const originalDayData = dailyStats.get(item.CreateDate);
            if(originalDayData) {
                totalTimeDiffSumInPeriod += originalDayData.totalTimeDiffDays;
                countForOverallAverage += originalDayData.countRecordsForTimeAverage; 
            }
            
            if (item.Cantidad > maxCount) { 
                maxCount = item.Cantidad;
                maxCountDate = item.CreateDate;
            }
        });
        
        let summaryText = "";
        let entityLabel = '';
        if (tipoEntidad === 'clientes') entityLabel = 'clientes';
        else if (tipoEntidad === 'proveedores') entityLabel = 'proveedores';
        else entityLabel = 'clientes/proveedores';

        if (totalRecordsInPeriod > 0) {
            const averageTimeOverall = (countForOverallAverage > 0 ? (totalTimeDiffSumInPeriod / countForOverallAverage) : 0).toFixed(2); 
            summaryText = `**Resumen del Periodo (${dateFrom} a ${dateTo}):**<br>`;
            summaryText += `Total de **${totalRecordsInPeriod}** ${entityLabel} registrados.<br>`;
            summaryText += `El tiempo promedio de **"vida útil"** fue de **${averageTimeOverall} días**.<br>`; 
            if (maxCountDate) {
                summaryText += `Fecha con más registros: **${maxCountDate}** con **${maxCount}** registros.`;
            }
        } else {
            summaryText = `No se encontraron ${entityLabel} en el rango de fechas seleccionado.`;
        }
        document.getElementById('summaryInfo').innerHTML = summaryText;

        actualizarDatosGraficos(chartData, tipoEntidad); 
    } catch (error) { // Manejo de errores de la función asíncrona
        console.error('Error en la petición a SAP B1:', error);
        if (error.message.includes('401')) {
            authenticate(() => actualizarGraficos());
        } else {
            alert(`Error al obtener datos de SAP B1: ${error.message}`);
        }
    }
}

let tiempoChart, cantidadChart;

function initializeCharts() {
    const ctxTiempo = document.getElementById('tiempoPromedioChart').getContext('2d');
    if (tiempoChart) tiempoChart.destroy();
    tiempoChart = new Chart(ctxTiempo, {
        type: 'line', 
        data: {
            labels: [],
            datasets: [] 
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } },
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencia de Tiempo Promedio (días hasta última modificación)' 
                }
            }
        }
    });

    const ctxCantidad = document.getElementById('cantidadRegistrosChart').getContext('2d');
    if (cantidadChart) cantidadChart.destroy();
    cantidadChart = new Chart(ctxCantidad, {
        type: 'bar', 
        data: {
            labels: [],
            datasets: [] 
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } },
            plugins: {
                title: {
                    display: true,
                    text: 'Cantidad de Registros por Día'
                }
            }
        }
    });
}

// Función para actualizar los datos en los gráficos
function actualizarDatosGraficos(chartData, tipoEntidad) {
    if (!chartData || chartData.dates.length === 0) {
        document.getElementById('summaryInfo').innerHTML = `No se encontraron datos para los ${tipoEntidad === 'clientes' ? 'clientes' : tipoEntidad === 'proveedores' ? 'proveedores' : 'clientes/proveedores'} en el rango de fechas seleccionado.`;
        
        tiempoChart.data.labels = [];
        tiempoChart.data.datasets = [];
        tiempoChart.update();
        cantidadChart.data.labels = [];
        cantidadChart.data.datasets = [];
        cantidadChart.update();
        return;
    }

    // --- Determinar etiquetas y colores ---
    let cantidadLabel = 'Cantidad de Registros';
    let tiempoLabel = 'Tiempo Promedio (días)'; 
    let colorPrimario = 'rgba(54, 162, 235, 0.5)'; 
    let colorSecundario = 'rgba(54, 162, 235, 1)'; 
    let colorLinea = 'rgb(75, 192, 192)'; 

    if (tipoEntidad === 'clientes') {
        cantidadLabel = 'Cantidad de Clientes Registrados';
        tiempoLabel = 'Tiempo Promedio Clientes (días)'; 
        colorPrimario = 'rgba(153, 102, 255, 0.5)'; 
        colorSecundario = 'rgba(153, 102, 255, 1)';
        colorLinea = 'rgb(153, 102, 255)';
    } else if (tipoEntidad === 'proveedores') {
        cantidadLabel = 'Cantidad de Proveedores Registrados';
        tiempoLabel = 'Tiempo Promedio Proveedores (días)'; 
        colorPrimario = 'rgba(255, 99, 132, 0.5)'; 
        colorSecundario = 'rgba(255, 99, 132, 1)';
        colorLinea = 'rgb(255, 99, 132)';
    }


    // --- Actualizar Gráfico de Tiempo Promedio (Líneas) ---
    tiempoChart.data.labels = chartData.dates;
    tiempoChart.data.datasets = [{
        label: tiempoLabel,
        data: chartData.tiempoPromedio,
        backgroundColor: colorPrimario, 
        borderColor: colorLinea,
        borderWidth: 2,
        fill: false, 
        tension: 0.3 
    }];
    tiempoChart.options.plugins.title.text = `Tendencia de Tiempo Promedio de "Vida Útil" (${tipoEntidad === 'todos' ? 'general' : tipoEntidad}, en días)`; 
    tiempoChart.update();


    // --- Actualizar Gráfico de Cantidad (Barras) ---
    cantidadChart.data.labels = chartData.dates;
    cantidadChart.data.datasets = [{
        label: cantidadLabel,
        data: chartData.cantidad,
        backgroundColor: colorPrimario, 
        borderColor: colorSecundario,
        borderWidth: 1
    }];
    cantidadChart.options.plugins.title.text = `Cantidad de Registros por Día (${tipoEntidad === 'todos' ? 'clientes/proveedores' : tipoEntidad})`;
    cantidadChart.update();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();

    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    document.getElementById('dateFrom').value = hace30Dias.toISOString().slice(0,10);
    document.getElementById('dateTo').value = hoy.toISOString().slice(0,10);

    document.getElementById('btnActualizar').addEventListener('click', actualizarGraficos);
    
    authenticate(() => {
        console.log("Autenticado, listo para obtener datos iniciales.");
        actualizarGraficos();
    });
});