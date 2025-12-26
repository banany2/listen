const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL не поддерживается!");
}

// Вершинный шейдер
const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

// Фрагментный шейдер без звездного поля (только фрактальный эффект)
const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;

      // Функции для фрактального эффекта
      const int iters = 150;
      int fractal(vec2 p, vec2 point) {
          vec2 so = (-1.0 + 2.0 * point) * 0.4;
          vec2 seed = vec2(0.098386255 + so.x, 0.6387662 + so.y);
          for (int i = 0; i < iters; i++) {
              if (length(p) > 2.0) {
                  return i;
              }
              vec2 r = p;
              p = vec2(p.x * p.x - p.y * p.y, 2.0 * p.x * p.y);
              p = vec2(p.x * r.x - p.y * r.y + seed.x, r.x * p.y + p.x * r.y + seed.y);
          }
          return 0;
      }
      vec3 color(int i) {
          float f = float(i) / float(iters) * 2.0;
          f = f * f * 2.0;
          return vec3(sin(f * 2.0), sin(f * 3.0), abs(sin(f * 7.0)));
      }

      void main() {
          // Нормализованные координаты пикселей
          vec2 uv = gl_FragCoord.xy / iResolution;
          // Смещаем координаты для фрактального эффекта
          vec2 position = 3.0 * (uv - 0.5);
          position.x *= iResolution.x / iResolution.y;
          // Вычисляем цвет фрактала
          vec3 col = color(fractal(position, vec2(0.5 + sin(iTime / 3.0) / 2.0, 0.5)));
          gl_FragColor = vec4(col, 1.0);
      }
    `;

// Функция для создания шейдера
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Ошибка компиляции шейдера:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Ошибка линковки программы:", gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Создаем буфер вершин
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
    ]),
    gl.STATIC_DRAW
);
const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Получаем uniform-переменные
const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
const iTimeLocation = gl.getUniformLocation(program, "iTime");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function render(time) {
    gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(iTimeLocation, time * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Обработчик клика по кнопке (например, переход на другую страницу)
document.getElementById('truthBtn').addEventListener('click', function() {
});