console.log("🚀 app.js iniciado");

const MODEL_TFLITE_URL = "./model/best_float16.tflite";
const INPUT_SIZE = 416;
const CONF_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;

const CLASS_MAP = {
  0: "CPU", 1: "Mesa", 2: "Mouse",
  3: "Pantalla", 4: "Silla", 5: "Teclado"
};

const CLASS_COLORS = {
  0: "#FF6B6B", 1: "#1ab8e0ff", 2: "#454cd1ff",
  3: "#FFA07A", 4: "#11cf9fff", 5: "#F7DC6F"
};

console.log("📋 Configuración:");
console.log("  - Modelo:", MODEL_TFLITE_URL);
console.log("  - Input size:", INPUT_SIZE);
console.log("  - Umbral conf:", CONF_THRESHOLD);

// ==========================
//  ELEMENTOS DOM
// ==========================
console.log("🔍 Buscando elementos DOM...");

const imgEl = document.getElementById("img");
const canvas = document.getElementById("canvas");
const ctx = canvas?.getContext("2d");
const fileInput = document.getElementById("fileInput");
const btnRun = document.getElementById("btnRun");
const statusEl = document.getElementById("status");
const countsBody = document.getElementById("countsBody");

console.log("Elementos encontrados:");
console.log("  - img:", imgEl ? "✅" : "❌");
console.log("  - canvas:", canvas ? "✅" : "❌");
console.log("  - fileInput:", fileInput ? "✅" : "❌");
console.log("  - btnRun:", btnRun ? "✅" : "❌");
console.log("  - statusEl:", statusEl ? "✅" : "❌");

let model = null;

const imgPlaceholder = document.getElementById("imgPlaceholder");
const canvasPlaceholder = document.getElementById("canvasPlaceholder");
const canvasPlaceholderText = document.getElementById("canvasPlaceholderText");
// ==========================
//  FUNCIONES AUXILIARES
// ==========================

function updateStatus(message) {
  console.log("📢 Status:", message);
  if (statusEl) statusEl.textContent = message;
}

function enableButton() {
  console.log("✅ Habilitando botón");
  if (btnRun) btnRun.disabled = false;
}

function disableButton() {
  console.log("🔒 Deshabilitando botón");
  if (btnRun) btnRun.disabled = true;
}

// ==========================
//  CARGA DEL MODELO
// ==========================
(async () => {
  console.log("\n" + "=".repeat(50));
  console.log("🔄 INICIANDO CARGA DEL MODELO");
  console.log("=".repeat(50));
  
  try {
    // Paso 1: Verificar TensorFlow.js
    console.log("\n1️⃣ Verificando TensorFlow.js...");
    updateStatus("Verificando TensorFlow.js...");
    
    if (typeof tf === 'undefined') {
      throw new Error("TensorFlow.js no está cargado");
    }
    console.log("   ✅ TensorFlow.js:", tf.version.tfjs);
    
    await tf.ready();
    console.log("   ✅ Backend:", tf.getBackend());
    
    // Paso 2: Verificar TFLite
    console.log("\n2️⃣ Verificando tfjs-tflite...");
    updateStatus("Verificando TFLite...");
    
    if (typeof window.tflite === "undefined") {
      throw new Error("tfjs-tflite no está cargado. Verifica el <script> en HTML");
    }
    console.log("   ✅ window.tflite disponible");
    
    // Paso 3: Verificar archivo del modelo
    console.log("\n3️⃣ Verificando archivo del modelo...");
    updateStatus("Verificando archivo del modelo...");
    
    const response = await fetch(MODEL_TFLITE_URL);
    if (!response.ok) {
      throw new Error(`No se puede acceder al modelo (${response.status}). Verifica:\n` +
                     `1. Que el archivo existe en: ${MODEL_TFLITE_URL}\n` +
                     `2. Que estás usando servidor local (http://localhost)\n` +
                     `3. Que NO estás abriendo con file:///`);
    }
    
    const sizeMB = (response.headers.get('content-length') / 1024 / 1024).toFixed(2);
    console.log("   ✅ Archivo encontrado:", sizeMB, "MB");
    
    // Paso 4: Cargar modelo TFLite
    console.log("\n4️⃣ Cargando modelo TFLite...");
    updateStatus("Cargando modelo YOLO... Esto puede tardar 10-30 segundos");
    
    const startTime = performance.now();
    model = await window.tflite.loadTFLiteModel(MODEL_TFLITE_URL);
    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    
    console.log("   ✅ Modelo cargado en", loadTime, "segundos");
    console.log("   Inputs:", model.inputs);
    console.log("   Outputs:", model.outputs);
    
    // Paso 5: Listo
    console.log("\n✅ TODO LISTO");
    updateStatus("✅ Modelo cargado. Sube una imagen .jpg o .png");
    enableButton();
    
  } catch (e) {
    console.error("\n❌ ERROR EN CARGA DEL MODELO:");
    console.error(e);
    
    updateStatus("❌ Error: " + e.message);
    
    console.log("\n💡 SOLUCIONES POSIBLES:");
    console.log("1. Verifica que model/best_float32.tflite existe");
    console.log("2. Estás usando: python -m http.server 8000");
    console.log("3. Abre en: http://localhost:8000/ (NO file:///)");
    console.log("4. Revisa la consola para más detalles");
    
    disableButton();
  }
})();

// ==========================
//  MANEJO DE IMAGEN
// ==========================
if (fileInput) {
  fileInput.addEventListener("change", (ev) => {
    console.log("\n📸 Archivo seleccionado");
    
    const file = ev.target.files?.[0];
    if (!file) {
      console.log("   ⚠️ No se seleccionó archivo");
      return;
    }
    
    console.log("   Nombre:", file.name);
    console.log("   Tipo:", file.type);
    console.log("   Tamaño:", (file.size / 1024).toFixed(2), "KB");
    
    const url = URL.createObjectURL(file);
    imgEl.src = url;
    console.log("   ✅ URL creada:", url.substring(0, 50) + "...");
    
    imgEl.onload = () => {
      console.log("   ✅ Imagen cargada");
      console.log("   Dimensiones:", imgEl.naturalWidth, "x", imgEl.naturalHeight);
      
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      
      // Ocultar placeholder de imagen y mostrar imagen
      imgPlaceholder.classList.add("hidden");
      imgEl.classList.add("loaded");
      
      // Actualizar mensaje del canvas
      canvasPlaceholderText.textContent = "¡Presiona Detectar Objetos para usar el Modelo!";
      
      drawImageOnly();
      
      updateStatus("✅ Imagen lista. Presiona 'Detectar Objetos'");
    };
    
    imgEl.onerror = (e) => {
      console.error("   ❌ Error cargando imagen:", e);
      updateStatus("❌ Error al cargar la imagen");
    };
  });
} else {
  console.error("❌ fileInput no encontrado en el DOM");
}

// ==========================
//  BOTÓN DE DETECCIÓN
// ==========================
if (btnRun) {
  btnRun.addEventListener("click", async () => {
    console.log("\n🔍 INICIO DE DETECCIÓN");
    console.log("=".repeat(50));
    
    if (!imgEl.src) {
      console.log("⚠️ No hay imagen");
      updateStatus("⚠️ Primero sube una imagen");
      return;
    }
    
    if (!model) {
      console.log("⚠️ Modelo no cargado");
      updateStatus("⚠️ El modelo aún no está cargado");
      return;
    }
    
    updateStatus("🔍 Detectando objetos...");
    disableButton();
    
    await tf.nextFrame();
    
    try {
      const t0 = performance.now();
      console.log("Ejecutando detección...");
      
      const detections = await detectObjects(imgEl);
      
      const t1 = performance.now();
      const time = (t1 - t0).toFixed(0);
      
      console.log("✅ Detección completada en", time, "ms");
      console.log("Objetos detectados:", detections.length);
      
      drawDetections(detections);
      
      const counts = countByClass(detections);
      renderCounts(counts);
      
      updateStatus(`✅ Listo. ${detections.length} objetos detectados en ${time}ms`);
      
    } catch (error) {
      console.error("❌ Error en detección:", error);
      updateStatus("❌ Error durante la detección");
    } finally {
      enableButton();
    }
  });
} else {
  console.error("❌ btnRun no encontrado en el DOM");
}

// ==========================
//  FUNCIONES DE DETECCIÓN
// ==========================

function preprocessImage(imageElement) {
  console.log("  Preprocesando imagen...");
  return tf.tidy(() => {
    let tensor = tf.browser.fromPixels(imageElement);
    tensor = tf.image.resizeBilinear(tensor, [INPUT_SIZE, INPUT_SIZE]);
    tensor = tensor.div(255.0);
    tensor = tensor.expandDims(0);
    console.log("  Input shape:", tensor.shape);
    return tensor;
  });
}

async function detectObjects(imageElement) {
  const originalWidth = imageElement.naturalWidth;
  const originalHeight = imageElement.naturalHeight;
  
  console.log("  Tamaño original:", originalWidth, "x", originalHeight);
  
  const inputTensor = preprocessImage(imageElement);
  
  console.log("  Ejecutando modelo...");
  const outputTensor = model.predict(inputTensor);
  
  console.log("  Output shape:", outputTensor.shape);
  
  const detections = await processYOLOOutput(outputTensor, originalWidth, originalHeight);
  
  inputTensor.dispose();
  outputTensor.dispose();
  
  const filtered = applyNMS(detections);
  console.log("  Después de NMS:", filtered.length, "detecciones");
  
  return filtered;
}

async function processYOLOOutput(output, originalWidth, originalHeight) {
  console.log("  Procesando output YOLO...");
  
  const data = await output.array();
  const outputData = data[0];
  
  const numPredictions = outputData[0].length;
  console.log("  Predicciones totales:", numPredictions);
  
  const detections = [];
  
  for (let i = 0; i < numPredictions; i++) {
    const x_center = outputData[0][i];
    const y_center = outputData[1][i];
    const width = outputData[2][i];
    const height = outputData[3][i];
    
    const classScores = [];
    for (let c = 0; c < 6; c++) {
      classScores.push(outputData[4 + c][i]);
    }
    
    const maxScore = Math.max(...classScores);
    const classId = classScores.indexOf(maxScore);
    
    if (maxScore > CONF_THRESHOLD) {
      const x1 = (x_center - width / 2) * originalWidth;
      const y1 = (y_center - height / 2) * originalHeight;
      const x2 = (x_center + width / 2) * originalWidth;
      const y2 = (y_center + height / 2) * originalHeight;
      
      detections.push({
        x: Math.max(0, x1),
        y: Math.max(0, y1),
        w: x2 - x1,
        h: y2 - y1,
        cls: classId,
        score: maxScore
      });
    }
  }
  
  console.log("  Detecciones después del filtrado:", detections.length);
  return detections;
}

function applyNMS(detections) {
  const byClass = {};
  for (const det of detections) {
    if (!byClass[det.cls]) byClass[det.cls] = [];
    byClass[det.cls].push(det);
  }
  
  const result = [];
  
  for (const [classId, classDets] of Object.entries(byClass)) {
    if (classDets.length === 0) continue;
    
    classDets.sort((a, b) => b.score - a.score);
    
    const keep = [];
    
    while (classDets.length > 0) {
      const current = classDets.shift();
      keep.push(current);
      
      const remaining = [];
      for (const det of classDets) {
        const iou = calculateIoU(current, det);
        if (iou < IOU_THRESHOLD) {
          remaining.push(det);
        }
      }
      classDets.length = 0;
      classDets.push(...remaining);
    }
    
    result.push(...keep);
  }
  
  return result;
}

function calculateIoU(det1, det2) {
  const x1_1 = det1.x, y1_1 = det1.y, x2_1 = det1.x + det1.w, y2_1 = det1.y + det1.h;
  const x1_2 = det2.x, y1_2 = det2.y, x2_2 = det2.x + det2.w, y2_2 = det2.y + det2.h;
  
  const xi1 = Math.max(x1_1, x1_2), yi1 = Math.max(y1_1, y1_2);
  const xi2 = Math.min(x2_1, x2_2), yi2 = Math.min(y2_1, y2_2);
  
  const intersectionArea = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
  const box1Area = det1.w * det1.h;
  const box2Area = det2.w * det2.h;
  const unionArea = box1Area + box2Area - intersectionArea;
  
  return unionArea > 0 ? intersectionArea / unionArea : 0;
}

// ==========================
//  FUNCIONES DE DIBUJO
// ==========================

function drawImageOnly() {
  if (!ctx) return;
  console.log("  Dibujando imagen original");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
}

function drawDetections(detections) {
  console.log("  Dibujando", detections.length, "detecciones");
  drawImageOnly();
  
  // Ocultar placeholder del canvas y mostrar canvas
  canvasPlaceholder.classList.add("hidden");
  canvas.classList.add("has-detection");
  
  ctx.lineWidth = 3;
  ctx.font = "bold 18px system-ui, sans-serif";
  
  for (const det of detections) {
    const color = CLASS_COLORS[det.cls];
    const label = String(det.cls);
    
    ctx.strokeStyle = color;
    ctx.strokeRect(det.x, det.y, det.w, det.h);
    
    const padding = 6;
    const textMetrics = ctx.measureText(label);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    
    const labelX = det.x;
    const labelY = Math.max(textHeight, det.y - 5);
    
    ctx.fillStyle = color;
    ctx.fillRect(labelX, labelY - textHeight, textWidth + padding * 2, textHeight + 2);
    
    ctx.fillStyle = "white";
    ctx.fillText(label, labelX + padding, labelY - 3);
  }
}

// ==========================
//  FUNCIONES DE CONTEO
// ==========================

function countByClass(detections) {
  const counts = {};
  for (const classId of Object.keys(CLASS_MAP)) {
    counts[classId] = 0;
  }
  for (const det of detections) {
    if (counts.hasOwnProperty(det.cls)) {
      counts[det.cls] += 1;
    }
  }
  return counts;
}

function renderCounts(counts) {
  if (!countsBody) return;
  
  console.log("  Actualizando tabla de conteos");
  countsBody.innerHTML = "";
  
  const sortedClasses = Object.keys(CLASS_MAP)
    .map(k => parseInt(k))
    .sort((a, b) => a - b);

  let totalFilas = 0;

  for (const classId of sortedClasses) {
    const count = counts[classId] || 0;

    if (count === 0) continue;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 700; color: ${CLASS_COLORS[classId]};">
        ${CLASS_MAP[classId]} (${classId})
      </td>
      <td><span class="count-badge" style="background: ${CLASS_COLORS[classId]};">${count}</span></td>
    `;
    
    countsBody.appendChild(tr);
    totalFilas++;
  }

  if (totalFilas === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="2" style="text-align:center; padding: 8px;">
        No se detectaron objetos en la imagen.
      </td>
    `;
    countsBody.appendChild(tr);
  }
}


console.log("\n✅ app.js cargado completamente");
console.log("Esperando carga del modelo...\n");