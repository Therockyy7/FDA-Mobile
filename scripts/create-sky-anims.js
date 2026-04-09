/**
 * Re-creates sunny.json and partly-cloudy.json with proper weather animations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.join(__dirname, "../assets/animations");

const kf = (t, v) => ({
  t, s: Array.isArray(v) ? v : [v],
  i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] }
});

function ellipseShape(x, y, w, h, nm = "El") {
  return { ty: "el", nm, d: 1, hd: false, p: { a: 0, k: [x, y] }, s: { a: 0, k: [w, h] } };
}

function fillShape(r, g, b, a = 1) {
  return { ty: "fl", nm: "Fill", hd: false, r: 1, c: { a: 0, k: [r / 255, g / 255, b / 255, a] }, o: { a: 0, k: 100 } };
}

function tr(px = 0, py = 0, op = 100) {
  return {
    ty: "tr", nm: "T", hd: false,
    a: { a: 0, k: [0, 0] }, p: { a: 0, k: [px, py] },
    s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 },
    o: { a: 0, k: op }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }
  };
}

function group(items, nm = "G", px = 0, py = 0, op = 100) {
  return { ty: "gr", nm, hd: false, it: [...items, tr(px, py, op)] };
}

function base(nm, w = 500, h = 500, fr = 30, op = 120) {
  return { v: "5.9.0", fr, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers: [] };
}

// ─── SUNNY ─────────────────────────────────────────────────────
function makeSunny() {
  const anim = base("Sunny Clear", 500, 500, 30, 150);

  // Sun core - gentle slow pulse
  const sunCore = {
    ty: 4, nm: "SunCore", ind: 1, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [250, 250, 0] },
      s: { a: 1, k: [kf(0, [95, 95, 100]), kf(75, [105, 105, 100]), kf(150, [95, 95, 100])] },
      r: { a: 1, k: [kf(0, [0]), kf(150, [30])] }, // slow rotation
      o: { a: 0, k: 100 }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 140, 140),
        fillShape(255, 210, 50)
      ], "Core")
    ]
  };

  // Outer glow - pulsating ring
  const sunGlow = {
    ty: 4, nm: "SunGlow", ind: 2, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [250, 250, 0] },
      s: { a: 1, k: [kf(0, [100, 100, 100]), kf(75, [120, 120, 100]), kf(150, [100, 100, 100])] },
      r: { a: 0, k: 0 },
      o: { a: 1, k: [kf(0, [30]), kf(75, [55]), kf(150, [30])] }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 190, 190),
        fillShape(255, 195, 30)
      ], "Glow")
    ]
  };

  // Ray lines (8 rays rotating)
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45);
    const rad = angle * Math.PI / 180;
    const x = Math.cos(rad) * 100;
    const y = Math.sin(rad) * 100;
    rays.push({
      ty: "rc", nm: `Ray${i}`, d: 1, hd: false,
      p: { a: 0, k: [x, y] },
      s: { a: 1, k: [kf(0, [8, 28]), kf(75, [8, 38]), kf(150, [8, 28])] },
      r: { a: 0, k: angle + 90 }
    });
  }

  const rayLayer = {
    ty: 4, nm: "Rays", ind: 3, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [250, 250, 0] },
      s: { a: 0, k: [100, 100, 100] },
      r: { a: 1, k: [kf(0, [0]), kf(150, [360])] },
      o: { a: 0, k: 85 }
    },
    shapes: [...rays.map(r => group([r, fillShape(255, 200, 40)], r.nm)), ]
  };

  // Warm halo
  const halo = {
    ty: 4, nm: "Halo", ind: 4, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [250, 250, 0] },
      s: { a: 1, k: [kf(0, [100, 100, 100]), kf(75, [130, 130, 100]), kf(150, [100, 100, 100])] },
      r: { a: 0, k: 0 },
      o: { a: 1, k: [kf(0, [10]), kf(75, [20]), kf(150, [10])] }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 260, 260),
        fillShape(255, 180, 30)
      ], "H")
    ]
  };

  anim.layers = [halo, rayLayer, sunGlow, sunCore];
  return anim;
}

// ─── PARTLY CLOUDY ─────────────────────────────────────────────
function makePartlyCloudy() {
  const anim = base("Partly Cloudy", 500, 500, 30, 150);

  // Mini sun (top right quadrant)
  const sun = {
    ty: 4, nm: "Sun", ind: 1, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [330, 155, 0] },
      s: { a: 1, k: [kf(0, [95, 95, 100]), kf(75, [108, 108, 100]), kf(150, [95, 95, 100])] },
      r: { a: 1, k: [kf(0, [0]), kf(150, [25])] },
      o: { a: 0, k: 100 }
    },
    shapes: [
      group([ellipseShape(0, 0, 100, 100), fillShape(255, 210, 40)], "SC"),
      group([ellipseShape(0, 0, 140, 140), fillShape(255, 200, 30)], "SG",0,0,25),
    ]
  };

  // Cloud (overlapping sun)
  const cloud = {
    ty: 4, nm: "Cloud", ind: 2, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 1, k: [kf(0, [240, 265, 0]), kf(75, [240, 258, 0]), kf(150, [240, 265, 0])] },
      s: { a: 0, k: [100, 100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 100 }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 200, 110),
        ellipseShape(80, -20, 160, 95),
        ellipseShape(-80, -15, 140, 88),
        fillShape(225, 235, 252)
      ], "CL")
    ]
  };

  // Shadow under cloud
  const shadow = {
    ty: 4, nm: "Shadow", ind: 3, ip: 0, op: 150, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 1, k: [kf(0, [240, 275, 0]), kf(75, [240, 268, 0]), kf(150, [240, 275, 0])] },
      s: { a: 0, k: [100, 100, 100] },
      r: { a: 0, k: 0 },
      o: { a: 0, k: 18 }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 195, 30),
        fillShape(100, 120, 160)
      ], "SH")
    ]
  };

  anim.layers = [sun, cloud, shadow];
  return anim;
}

// ─── Write ─────────────────────────────────────────────────────
const files = {
  "sunny.json": makeSunny(),
  "partly-cloudy.json": makePartlyCloudy(),
};

for (const [name, data] of Object.entries(files)) {
  const filePath = path.join(OUT, name);
  fs.writeFileSync(filePath, JSON.stringify(data));
  const size = fs.statSync(filePath).size;
  console.log(`✅ ${name} → ${(size / 1024).toFixed(1)} KB`);
}
console.log("🎨 Done!");
