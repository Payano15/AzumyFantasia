document.addEventListener('DOMContentLoaded', function () {
    // Evento para el botón "FINALIZAR PEDIDO"
    document.getElementById('final_button').addEventListener('click', function () {
        console.log('Botón FINALIZAR PEDIDO clicado.');

        const invoiceFrame = document.getElementById('invoiceFrame');
        if (!invoiceFrame) {
            console.error('No se encontró el iframe con id "invoiceFrame".');
            return;
        }

        // Cargar el contenido de la factura en el iframe
        invoiceFrame.src = '../cart/factura.html'; // Ruta al archivo de la factura

        // Esperar a que el iframe cargue el contenido
        invoiceFrame.addEventListener('load', function () {
            console.log('Contenido de factura.html cargado en el iframe.');

            // Verificar que el documento del iframe esté disponible
            const invoiceDoc = invoiceFrame.contentDocument || invoiceFrame.contentWindow.document;
            if (invoiceDoc) {
                // Esperar un poco más para asegurarse de que el contenido esté completamente cargado
                setTimeout(function () {
                    if (invoiceDoc.body && invoiceDoc.body.innerHTML.trim() !== "") {
                        console.log('Contenido del iframe:', invoiceDoc.body.innerHTML);

                        // Mostrar el modal con el contenido cargado
                        $('#invoiceModal').modal('show');
                    } else {
                        console.log('El contenido del iframe está vacío o no se ha cargado correctamente.');
                    }
                }, 1000);  // Espera 1000ms (1 segundo) para asegurar que el contenido esté completamente cargado
            } else {
                console.error('No se pudo acceder al documento del iframe.');
            }
        });
    });

    // Evento para el botón "Terminar pedido"
    document.getElementById('generatePdfButton').addEventListener('click', function () {
        console.log('Botón "Terminar pedido" clicado.');

        const invoiceFrame = document.getElementById('invoiceFrame');
        if (!invoiceFrame) {
            console.error('No se encontró el iframe con id "invoiceFrame".');
            return;
        }

        // Verificar que el contenido del iframe esté cargado
        const invoiceDoc = invoiceFrame.contentDocument || invoiceFrame.contentWindow.document;
        if (invoiceDoc && invoiceDoc.body && invoiceDoc.body.innerHTML.trim() !== "") {
            console.log('Contenido del iframe:', invoiceDoc.body.innerHTML);

            // Ajustar la configuración de html2pdf
            html2pdf()
                .set({
                    margin: 0.5,
                    filename: 'factura.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                })
                .from(invoiceDoc.body)  // Convertir el contenido del body del iframe a PDF
                .toPdf()
                .get('pdf')
                .then(pdf => {
                    // Log para verificar el contenido del PDF
                    console.log('PDF generado:', pdf);

                    // Enviar PDF al servidor
                    let formData = new FormData();
                    formData.append('pdf', pdf.output('blob'), 'factura.pdf');

                    fetch('../php/save_pdf.php', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.text())
                        .then(result => {
                            console.log('Respuesta del servidor:', result);
                            try {
                                const jsonResult = JSON.parse(result);
                                if (jsonResult.status === 'success') {
                                    console.log('PDF guardado en:', jsonResult.path);
                                    // Llamar a la función para enviar por WhatsApp
                                    enviarPorWhatsApp(jsonResult.path);
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
                })
                .catch(error => {
                    console.error('Error al generar el PDF:', error);
                });
        } else {
            console.log('Error: El contenido de la factura aún no se ha cargado o está vacío.');
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
});
