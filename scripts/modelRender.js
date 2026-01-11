const uploadInput = document.getElementById('uploadModelInput');

uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.name.endsWith('.obj')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const objContent = e.target.result;

      const m = loadOBJ(objContent);
      vs = m.vs;
      fs = m.fs.flatMap(f =>
        f.length === 3 ? [f] :
          f.slice(1).map((_, i) => [f[0], f[i + 1], f[i + 2]])
      );

      console.log("OBJ loaded from file:", file.name);
    };
    reader.readAsText(file);
  } else {
    alert('Please select a valid .obj file.');
  }
});

const BACKGROUND = "#101010";
const FOREGROUND = "#507533";

let facesOnMode = true;
const toggleFacesBtn = document.getElementById("toggleFacesBtn");

toggleFacesBtn.addEventListener("click", () => {
  facesOnMode = !facesOnMode;
});

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

//drawing related stuff

function clear() {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, game.width, game.height);
}

function triangle(a, b, c) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  if (facesOnMode) {
    ctx.fill();
  }
  ctx.stroke();
}

const camera = {
  pos: vec(0, 0, 0),
  light: normalize(vec(1, 1, 1))
};


// fallback cube
let vs = [
  vec(.5, .5, .5), vec(-.5, .5, .5),
  vec(-.5, -.5, .5), vec(.5, -.5, .5),
  vec(.5, .5, -.5), vec(-.5, .5, -.5),
  vec(-.5, -.5, -.5), vec(.5, -.5, -.5),
];

let fs = [
  [0, 1, 2], [0, 2, 3],
  [4, 7, 6], [4, 6, 5],
  [0, 4, 5], [0, 5, 1],
  [1, 5, 6], [1, 6, 2],
  [2, 6, 7], [2, 7, 3],
  [3, 7, 4], [3, 4, 0],
];

function loadOBJ(text) {
  const vs = [];
  const fs = [];

  for (const line of text.split("\n")) {
    const p = line.trim().split(/\s+/);
    if (p[0] === "v") {
      vs.push(vec(+p[1], +p[2], +p[3]));
    }
    if (p[0] === "f") {
      fs.push(p.slice(1).map(i => parseInt(i) - 1));
    }
  }
  return { vs, fs };
}


//main loop
let angle = 0;
const dz = 2;

function frame() {
  angle += 0.8 / FPS;
  clear();

  ctx.fillStyle = FOREGROUND;
  ctx.strokeStyle = FOREGROUND;

  const tris = [];

  for (const f of fs) {
    const v0 = translate_z(rotate_xz(vs[f[0]], angle), dz);
    const v1 = translate_z(rotate_xz(vs[f[1]], angle), dz);
    const v2 = translate_z(rotate_xz(vs[f[2]], angle), dz);

    const n = cross(sub(v1, v0), sub(v2, v0));

    if (dot(n, v0) >= 0) continue; // backface cull

    const light = Math.max(0.2, dot(normalize(n), camera.light));
    const zavg = (v0.z + v1.z + v2.z) / 3;

    tris.push({
      pts: [v0, v1, v2],
      light,
      z: zavg
    });
  }

  tris.sort((a, b) => b.z - a.z);

  for (const t of tris) {
    ctx.globalAlpha = t.light;
    const p = t.pts.map(v => screen(project(v)));
    triangle(p[0], p[1], p[2]);
  }

  ctx.globalAlpha = 1;
  setTimeout(frame, 1000 / FPS);
}

frame();
