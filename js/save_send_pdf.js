document.getElementById('generatePdfButton').addEventListener('click', function () {
    const invoiceFrame = document.getElementById('invoiceFrame');
    if (invoiceFrame.contentWindow.document.body) {
        console.log('Generando PDF...');

        // Generar el PDF y luego enviarlo al servidor
        html2pdf().from(invoiceFrame.contentWindow.document.body).outputPdf().then(function (pdfData) {
            // Crear un objeto FormData para enviar el PDF
            let formData = new FormData();
            formData.append('pdf', new Blob([pdfData], { type: 'application/pdf' }), 'factura.pdf');

            // Hacer una solicitud POST al backend para guardar el PDF
            fetch('../php/save_pdf.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text()) // Cambia a .text() para ver la respuesta completa
            .then(result => {
                console.log('Respuesta del servidor:', result); // Muestra la respuesta completa en la consola
                try {
                    const jsonResult = JSON.parse(result); // Intenta convertir a JSON
                    if (jsonResult.status === 'success') {
                        console.log('PDF guardado en:', jsonResult.path);
                        // Aquí se puede proceder a enviar el PDF por WhatsApp
                        enviarPorWhatsApp(jsonResult.path); // Llamar a la función para enviar por WhatsApp
                    } else {
                        console.error('Error al guardar el PDF:', jsonResult.message);
                    }
                } catch (e) {
                    console.error('Error al analizar JSON:', e);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
        });
    } else {
        console.log('Error: El contenido de la factura aún no se ha cargado.');
    }
});

// Función para enviar el PDF por WhatsApp
function enviarPorWhatsApp(pdfPath) {
    fetch('../php/send_ws.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfPath: pdfPath })
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            console.log('Mensaje de WhatsApp enviado correctamente.');
        } else {
            console.error('Error al enviar mensaje de WhatsApp:', result.message);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}
