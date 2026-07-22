const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
resizeCanvas();

let particlesArray;

// get mouse position
let mouse = {
x: null,
y: null,
  radius: (window.innerHeight / 250) * (window.innerWidth / 250)
}

window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// create particles
class Particle {
  constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;

      this.directionX = directionX;
      this.directionY = directionY;

      this.velocityX = 0;
      this.velocityY = 0;

      this.size = size;
      this.color = color;
  }

  // method to draw individual particle
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = '#d6d6d6';
    ctx.fill();
  }

  // check particle position, check mouse position, move the particles, draw the particles
  update() {
    // check if particle is still within canvas
    if (this.x > canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }

    if (this.y > canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }

    // check collision detection - mouse position / particle position
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    const pushStrength = 2;

    if (distance < mouse.radius + this.size) {

        const angle = Math.atan2(dy, dx);

        this.velocityX -= Math.cos(angle) * pushStrength;
        this.velocityY -= Math.sin(angle) * pushStrength;
    }

    // Apply velocity
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Slow the particle back down
    this.velocityX *= 0.92;
    this.velocityY *= 0.92;

    // Normal drifting movement
    this.x += this.directionX;
    this.y += this.directionY;
    // draw particle
    this.draw();
  }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;

    canvas.height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    );
}

resizeCanvas(); // call once up front

// ... Particle class unchanged ...

function init() {
  particlesArray = [];
  let numberOfParticles = (canvas.height * canvas.width) / 5000;
  for (let i = 0; i < numberOfParticles; i++) {
    let size = (Math.random() * 5) + 1;
    let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
    let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
    let directionX = (Math.random() * .05) - 0.01;
    let directionY = (Math.random() * .05) - 0.01;
    let color = 'rgba(0,198,247,0.6)';
    particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
  }
}

function animate() {
    requestAnimationFrame(animate);

    const pageHeight = document.documentElement.scrollHeight;

    if (canvas.height !== pageHeight) {
        resizeCanvas();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }

    connect();
}

window.addEventListener('resize',
  function () {
    resizeCanvas();
    mouse.radius = (window.innerHeight / 250) * (window.innerWidth / 250);
    init();
  })

window.addEventListener('load', function () {
  resizeCanvas();
  init();
});

init();
animate();
