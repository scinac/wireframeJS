const uploadInput = document.getElementById('uploadModelInput');

uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.name.endsWith('.obj')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const objContent = e.target.result;
      console.log('OBJ file content:', objContent);
    };
    reader.readAsText(file);
  } else {
    alert('Please select a valid .obj file.');
  }
});

const BACKGROUND = "#101010";
const FOREGROUND = "#507533";

const game = document.getElementById("game");
game.width = 800;
game.height = 800;

const ctx = game.getContext("2d");

const FPS = 60;


//some math stuff needed, general credits to Tsoding for the formulas and inspiration
function vec(x, y, z) { return { x, y, z }; }

function add(a, b) { return vec(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return vec(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

function normalize(v) {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return vec(v.x / l, v.y / l, v.z / l);
}

//utils like projections and so on

function project({ x, y, z }) {
  z = Math.max(z, 0.001);
  return { x: x / z, y: y / z };
}

function screen(p) {
  return {
    x: (p.x + 1) * 0.5 * game.width,
    y: (1 - (p.y + 1) * 0.5) * game.height
  };
}

function rotate_xz({ x, y, z }, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return vec(
    x * c - z * s,
    y,
    x * s + z * c
  );
}

function translate_z(v, dz) {
  return vec(v.x, v.y, v.z + dz);
}


