// Create Initial References & declare variables
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let width = window.innerWidth;
let height = window.innerHeight;
let clicked = false;
let mouseX = 0, mouseY = 0;
let particles = [];
let risingParticles = [];
let particleSettings = { gravity: 0.05 };
let fireworkTimer = 0; // Tracks time for the next firework
let fireworkInterval = 200; // Firework launch every 200 animation frames

// Events Object
let events = {
  mouse: { down: "mousedown", move: "mousemove", up: "mouseup" },
  touch: { down: "touchstart", move: "touchmove", up: "touchend" },
};

let deviceType = "";

// For using request animationFrame on all browsers
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

// Function on window load
window.onload = () => {
  canvas.width = width;
  canvas.height = height;
  getLetterBounds(); // Get letter bounding boxes before animation starts
  window.requestAnimationFrame(startFireWork);
};

// Detect Touch Device
const isTouchDevice = () => {
  try {
    // We try to create TouchEvent (it fails for desktops and throws error)
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

isTouchDevice();

// Function on mousedown
canvas.addEventListener(events[deviceType].down, function (e) {
  e.preventDefault();
  clicked = true;
  mouseX = isTouchDevice() ? e.touches[0].pageX : e.pageX;
  mouseY = isTouchDevice() ? e.touches[0].pageY : e.pageY;

  // Create a rising particle from the bottom of the screen
  let risingParticle = new Particle();
  risingParticle.x = mouseX;
  risingParticle.y = height;
  risingParticle.vx = 0;
  risingParticle.vy = -8; // Adjust speed of rise
  risingParticle.color = `rgb(${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)})`;
  risingParticles.push(risingParticle);
});

// Function on mouseup
canvas.addEventListener(events[deviceType].up, function (e) {
  e.preventDefault();
  clicked = false;
});

// Function to generate random number between a given range
function randomNumberGenerator(min, max) {
  return Math.random() * (max - min) + min;
}

function Particle() {
  this.width = randomNumberGenerator(0.1, 0.9) * 5;
  this.height = randomNumberGenerator(0.1, 0.9) * 5;
  this.x = mouseX - this.width / 2;
  this.y = mouseY - this.height / 2;

  // Velocity of the particle
  this.vx = (Math.random() - 0.5) * 10;
  this.vy = (Math.random() - 0.5) * 10;
}

Particle.prototype = {
  move: function () {
    if (this.x >= canvas.width || this.y >= canvas.height) {
      return false;
    }
    return true;
  },
  draw: function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += particleSettings.gravity;
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.arc(0, 0, this.width, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.closePath();
    context.fill();
    context.restore();
  },
};

// Define the text and its properties
let text = "~~~~~~~~~~~~~~~~~~~~~~~~\nThank you for making 2024\nthe best year of my life <3\nI can't wait to spend the many\n more years to come with you!\n - JZ x JY Jan.1.25\n~~~~~~~~~~~~~~~~~~~~~~~~";
let fontSize = Math.floor(height * 0.05); // Font size is 10% of canvas height
let font = `${fontSize}px Satisfy`; // Adjusted font size
let textPositionX; // X position of the text (calculated dynamically)
let textPositionY; // Y position of the text (calculated dynamically)
let letterBounds = [];

// Function to create bounding boxes for each letter
function getLetterBounds() {
  context.font = font; // Set the font before measuring
  let lines = text.split("\n"); // Split the text into lines
  let lineHeight = fontSize * 1.2; // Spacing between lines
  let startY = (height - lines.length * lineHeight) / 2; // Center the text block vertically

  letterBounds = [];
  lines.forEach((line, lineIndex) => {
    let x = (width - context.measureText(line).width) / 2; // Center line horizontally
    let y = startY + lineIndex * lineHeight; // Position line vertically

    for (let i = 0; i < line.length; i++) {
      let letter = line[i];
      let width = context.measureText(letter).width;
      let height = fontSize; // Font size is used for height
      letterBounds.push({
        letter: letter,
        x: x,
        y: y - fontSize, // Align text with baseline
        width: width,
        height: height,
        lit: false,
        litTimer: 0, // Timer to track how long the letter stays lit
      });
      x += width; // Move to the next letter position
    }
  });
}

// Function to draw the text
function drawText() {
  context.font = font;
  let lines = text.split("\n"); // Split the text into lines
  let lineHeight = fontSize * 1.2; // Spacing between lines
  let startY = (height - lines.length * lineHeight) / 2; // Center the text block vertically

  lines.forEach((line, index) => {
    let lineWidth = context.measureText(line).width;
    let x = (width - lineWidth) / 2; // Center each line horizontally
    let y = startY + index * lineHeight; // Position each line vertically
    context.fillStyle = "black"; // Default text color

    // Draw each letter individually, using its lit state
    for (let i = 0; i < line.length; i++) {
      let letter = letterBounds.find(
        (l) => l.letter === line[i] && l.x >= x && l.y + fontSize === y
      );
      if (letter && letter.lit) {
        context.fillStyle = letter.color;
      }
      context.fillText(line[i], x, y);
      x += context.measureText(line[i]).width; // Move to next letter position
    }
  });
}

// Function to light up the text when a particle overlaps
function lightUpText(particle) {
  for (let i = 0; i < letterBounds.length; i++) {
    let letter = letterBounds[i];
    // Check if the particle is within the bounding box of the letter
    if (
      particle.x >= letter.x &&
      particle.x <= letter.x + letter.width &&
      particle.y >= letter.y &&
      particle.y <= letter.y + letter.height
    ) {
      // If overlap occurs, change the color of the letter and reset the timer
      letter.color = particle.color;
      letter.lit = true;
      letter.litTimer = 60; // Keep lit for 60 frames (~1 second)
    }
  }
}

// Function to update the lit state of letters
function updateLitLetters() {
  for (let i = 0; i < letterBounds.length; i++) {
    let letter = letterBounds[i];
    if (letter.lit) {
      letter.litTimer--;
      if (letter.litTimer <= 0) {
        letter.lit = false; // Reset the lit state when the timer expires
      }
    }
  }
}

// Function to create fireworks
function createFirework(x, y) {
  // Increase range for bigger fireworks
  var numberOfParticles = randomNumberGenerator(25, 250);

  for (var i = 0; i < numberOfParticles; i++) {
    var particle = new Particle();
    particle.x = x;
    particle.y = y;
    particle.color = `rgb(${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)})`;
    var vy = Math.sqrt(25 - particle.vx * particle.vx);
    if (Math.abs(particle.vy) > vy) {
      particle.vy = particle.vy > 0 ? vy : -vy;
    }
    particles.push(particle);
  }
}

// Function that begins the firework
function startFireWork() {
  let current = [];
  // Control trail left by particles through the value of alpha
  context.fillStyle = "rgba(0,0,0,0.1)";
  context.fillRect(0, 0, width, height);

  // Update lit letters before redrawing
  updateLitLetters();

  // Draw the text each frame, but once a letter is lit, it stays lit
  drawText();

  // Periodically launch a firework
  fireworkTimer++;
  if (fireworkTimer >= fireworkInterval) {
    fireworkTimer = 0;
    let randomX = randomNumberGenerator(0.2 * width, 0.8 * width); // Random position on the canvas
    let risingParticle = new Particle();
    risingParticle.x = randomX;
    risingParticle.y = height;
    risingParticle.vx = 0;
    risingParticle.vy = -8; // Rising speed
    risingParticle.color = `rgb(${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)},${randomNumberGenerator(0, 255)})`;
    risingParticles.push(risingParticle);
  }

  let activeRisingParticles = [];
  for (let i = 0; i < risingParticles.length; i++) {
    let risingParticle = risingParticles[i];
    risingParticle.draw();
    risingParticle.y += risingParticle.vy;

    // Check if rising particle has reached the explosion height
    if (risingParticle.y <= height * 0.3) { // Explode when it reaches 30% height
      createFirework(risingParticle.x, risingParticle.y);
    } else {
      activeRisingParticles.push(risingParticle);
    }
  }
  risingParticles = activeRisingParticles;

  for (let i in particles) {
    particles[i].draw();
    // Light up any text that the particle overlaps with
    lightUpText(particles[i]);
    if (particles[i].move()) {
      current.push(particles[i]);
    }
  }
  particles = current;

  window.requestAnimationFrame(startFireWork);
}
