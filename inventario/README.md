Proyecto Final — Redes Neuronales Convolucionales

Detección de objetos con YOLOv8 y despliegue web con TensorFlow Lite
Estudiante: Daniela Ivon Zabala Donato
Código: 20251695011

📌 Descripción del Proyecto

Este proyecto implementa un modelo de detección de objetos utilizando YOLOv8, entrenado con el conjunto de clases fotografiadas en clase sobre el salón 416 de la sede Sabio Caldas de la Facultad de Ingeniería de la UDFJC. Posteriormente, el modelo fue convertido a los formatos ONNX y TensorFlow Lite (TFLite) con el fin de desplegarlo en una aplicación web funcional.

🛠️ Herramientas Utilizadas

  - YOLOv8 para el entrenamiento inicial del modelo en un Jupiter Notebook ejecutado localmente y con el cual se obtuvo el modelo en formato ONNX.
  
  - Google Colab para convertir el modelo de ONNX → TFLite, debido a dependencias que no estaban disponibles en el entorno local.
  
  - TensorFlow Lite para la integración del modelo en una aplicación web.
  
  - HTML, CSS y JavaScript (con TensorFlow.js) para la interfaz web de prueba.

📁 Estructura del Repositorio

Carpeta cuadernos/

  - Contiene los notebooks utilizados durante el desarrollo:
  
  - Notebook_20251695011.ipynb: empleado para el entrenamiento del modelo YOLOv8, exportación del modelo a formato ONNX

Exportar_de_ONNX_a_TFLITE.ipynb (Colab): empleado para la conversión del modelo de ONNX a TFLite y generación del archivo final best_float16.tflite para la web

▶️ Instrucciones para Ejecutar el Proyecto Web

Se debe tener los siguientes archivos en la misma carpeta:

  - index.html
  
  - styles.css
  
  - app.js
  
  - Carpeta /model con el archivo best_float16.tflite

Se debe abrir el index.html utilizando Live Server en VS Code u otra herramienta similar y seguir las instrucciones que aparecen en la interfaz web.

📱 Cómo probarlo desde el celular

Verificar la dirección IP local del computador donde está corriendo Live Server.

Desde el navegador del celular, acceder a:

http://<IP_DEL_PC>:<PUERTO>/index.html

Ambos dispositivos deben estar conectados a la misma red WiFi.

