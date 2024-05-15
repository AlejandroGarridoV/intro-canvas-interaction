const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.backgroundColor = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posx = x;
        this.posy = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
        this.colliding = false; // Utilizaremos esto para saber más adelante si está colisionando
    }

    draw(context) {
        context.beginPath();
        if (this.colliding) {
            context.strokeStyle = "red"; // Si está colisionando, pinta de rojo
        } else {
            context.strokeStyle = this.color; // Si no, usa el color normal
        }
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posx, this.posy);
        context.lineWidth = 5;
        context.arc(this.posx, this.posy, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    colisionOcurriendo(CirculoI) {
        const distanceX = this.posx - CirculoI.posx;
        const distanceY = this.posy - CirculoI.posy;
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
        return distance < this.radius + CirculoI.radius;
    }

    update(circles) {
        let collided = false;

        // Comprobación de colisión y ajuste de dirección
        for (let i = 0; i < circles.length; i++) {
            if (circles[i] !== this) {
                if (this.colisionOcurriendo(circles[i])) {
                    collided = true;
                    // Calcula un ángulo aleatorio para el rebote
                    const angle = Math.atan2(this.posy - circles[i].posy, this.posx - circles[i].posx);
                    const randomAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
                    this.dx = Math.cos(randomAngle) * this.speed;
                    this.dy = Math.sin(randomAngle) * this.speed;
                    this.colliding = true; // Marca como colisionando
                    break; // No necesitamos seguir verificando colisiones
                }
            }
        }

        if (!collided) {
            this.colliding = false; // No está colisionando
        }

        // Actualiza la posición del círculo
        this.posx += this.dx;
        this.posy += this.dy;

        // Si el círculo choca con el borde derecho o izquierdo, invierte la dirección horizontal
        if ((this.posx + this.radius) > window_width || (this.posx - this.radius) < 0) {
            this.dx = -this.dx;
        }

        // Si el círculo choca con el borde superior o inferior, invierte la dirección vertical
        if ((this.posy + this.radius) > window_height || (this.posy - this.radius) < 0) {
            this.dy = -this.dy;
        }

        // Limita la posición del círculo para que no quede fuera de los límites de la ventana
        this.posx = Math.max(this.radius, Math.min(this.posx, window_width - this.radius));
        this.posy = Math.max(this.radius, Math.min(this.posy, window_height - this.radius));
    }

    explode() {
        // Remover el círculo del canvas
        const index = arrayCircle.indexOf(this);
        arrayCircle.splice(index, 1);
        
        // Crear varios "fuegos artificiales" (divs) en la posición del círculo
        for (let i = 0; i < 10; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework', this.color);
            firework.style.left = `${this.posx}px`;
            firework.style.top = `${this.posy}px`;
            document.body.appendChild(firework);
        }
    }
}

let arrayCircle = [];

// Crea y almacena n círculos en el arreglo
const n = 10;
for (let i = 0; i < n; i++) {
    let randomX = Math.random() * window_width;
    let randomY = Math.random() * window_height;
    let randomRadius = Math.floor(Math.random() * 100 + 30);
    let randomSpeed = 1; // Genera un número aleatorio entre 1 y 5 Pero para este ejercicio se quedará en 1
    let randomColor = getRandomColor(); // Obtiene un color aleatorio
    let myCircle = new Circle(randomX, randomY, randomRadius, randomColor, i + 1, randomSpeed);
    // Agrega el objeto al arreglo
    arrayCircle.push(myCircle);
}

// Función para obtener un color aleatorio
function getRandomColor() {
    const colors = ['#FF4136', '#2ECC40', '#0074D9', '#FFDC00', '#B10DC9'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para actualizar y animar los círculos
let lastTime = 0;
let updateCircles = function (timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, window_width, window_height); // Limpia el canvas en cada frame

    // Itera sobre el arreglo de círculos y los actualiza
    for (let i = 0; i < arrayCircle.length; i++) {
        arrayCircle[i].update(arrayCircle);
        arrayCircle[i].draw(ctx);
    }
    requestAnimationFrame(updateCircles);
}

// Listener para el evento de clic en el canvas
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Itera sobre los círculos para comprobar si se hizo clic en alguno
    for (let i = 0; i < arrayCircle.length; i++) {
        const circle = arrayCircle[i];
        const distance = Math.sqrt((mouseX - circle.posx) ** 2 + (mouseY - circle.posy) ** 2);
        
        // Si la distancia entre el punto del clic y el centro del círculo es menor que el radio,
        // entonces se hizo clic dentro del círculo
        if (distance <= circle.radius) {
            // Hacer explotar el círculo
            circle.explode();
            break;
        }
    }
});

updateCircles(); // Inicia la animación de los círculos
