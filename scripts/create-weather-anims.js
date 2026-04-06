/**
 * Creates minimal but beautiful Lottie v5 JSON animations for weather conditions.
 * Generates: cloudy.json, fog.json, thunder.json, heavy-rain.json, drizzle.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.join(__dirname, "../assets/animations");

// ─── Helper: keyframe value builder ───────────────────────────
const kf = (t, v) => ({ t, s: Array.isArray(v) ? v : [v], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } });
const kfHold = (t, v) => ({ t, s: Array.isArray(v) ? v : [v], h: 1 });

// ─── Shape helpers ─────────────────────────────────────────────
function ellipseShape(x, y, w, h, name = "El") {
  return {
    ty: "el", nm: name, d: 1, hd: false,
    p: { a: 0, k: [x, y] },
    s: { a: 0, k: [w, h] }
  };
}

function fillShape(r, g, b, a = 1) {
  return {
    ty: "fl", nm: "Fill", hd: false, r: 1,
    c: { a: 0, k: [r / 255, g / 255, b / 255, a] },
    o: { a: 0, k: 100 }
  };
}

function rectShape(x, y, w, h) {
  return {
    ty: "rc", nm: "Rect", d: 1, hd: false,
    p: { a: 0, k: [x, y] },
    s: { a: 0, k: [w, h] },
    r: { a: 0, k: h / 2 }
  };
}

function group(shapes, name = "G") {
  return { ty: "gr", nm: name, hd: false, it: [...shapes, { ty: "tr", nm: "T", hd: false, a: { a: 0, k: [0, 0] }, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }] };
}

function shapeLayer({ nm, shapes, op = 100, ks = null, ip = 0, opEnd = 150 }) {
  const defaultKs = {
    a: { a: 0, k: [250, 250, 0] },
    p: { a: 0, k: [250, 250, 0] },
    s: { a: 0, k: [100, 100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: op },
  };
  return {
    ty: 4, nm, ind: 0, ip, op: opEnd, sr: 1, st: 0, bm: 0, hd: false,
    ks: ks || defaultKs,
    shapes,
    ao: 0, ddd: 0
  };
}

function base(nm, w = 500, h = 500, fr = 30, op = 150) {
  return { v: "5.9.0", fr, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers: [] };
}

// ─── 1. CLOUDY / OVERCAST ──────────────────────────────────────
function makeCloudy() {
  const anim = base("Cloudy", 500, 500, 30, 120);

  // Gentle up-down float animation
  const floatKs = (baseY, amp = 8, dur = 90) => ({
    a: { a: 0, k: [0, 0, 0] },
    p: {
      a: 1, k: [
        kf(0, [250, baseY, 0]),
        kf(dur / 2, [250, baseY - amp, 0]),
        kf(dur, [250, baseY, 0]),
      ]
    },
    s: { a: 0, k: [100, 100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 90 },
  });

  // Background cloud (large, dark gray)
  const bgCloud = {
    ty: 4, nm: "BgCloud", ind: 3, ip: 0, op: 120, sr: 1, st: 0, bm: 0, hd: false,
    ks: floatKs(255, 6, 120),
    ao: 0, ddd: 0,
    shapes: [
      group([
        ellipseShape(-30, 10, 200, 130),
        ellipseShape(60, 30, 160, 100),
        ellipseShape(-90, 30, 130, 90),
        fillShape(90, 100, 120, 1)
      ], "BgC")
    ]
  };

  // Foreground cloud (medium, lighter)
  const fgCloud = {
    ty: 4, nm: "FgCloud", ind: 2, ip: 0, op: 120, sr: 1, st: 0, bm: 0, hd: false,
    ks: floatKs(220, 10, 90),
    ao: 0, ddd: 0,
    shapes: [
      group([
        ellipseShape(20, 5, 220, 140),
        ellipseShape(110, 20, 170, 110),
        ellipseShape(-70, 20, 150, 100),
        fillShape(120, 135, 160, 1)
      ], "FgC")
    ]
  };

  // Small cloud top right
  const smallCloud = {
    ty: 4, nm: "SmCloud", ind: 1, ip: 0, op: 120, sr: 1, st: 0, bm: 0, hd: false,
    ks: floatKs(155, 5, 75),
    ao: 0, ddd: 0,
    shapes: [
      group([
        ellipseShape(45, 0, 130, 80),
        ellipseShape(110, 10, 100, 65),
        ellipseShape(-20, 10, 100, 65),
        fillShape(150, 165, 190, 1)
      ], "SC")
    ]
  };

  anim.layers = [bgCloud, fgCloud, smallCloud];
  return anim;
}

// ─── 2. FOG / MIST ─────────────────────────────────────────────
function makeFog() {
  const anim = base("Fog", 500, 500, 30, 120);
  const layers = [];

  // 5 fog strips moving slowly right-to-left
  const strips = [
    { y: 180, w: 420, h: 28, a: 70, delay: 0,  speed: 100 },
    { y: 230, w: 380, h: 22, a: 50, delay: 20, speed: 90 },
    { y: 280, w: 460, h: 32, a: 60, delay: 10, speed: 110 },
    { y: 330, w: 340, h: 20, a: 40, delay: 30, speed: 80 },
    { y: 140, w: 300, h: 18, a: 45, delay: 40, speed: 70 },
  ];

  strips.forEach((s, i) => {
    const startX = 300;
    const endX = -200;
    layers.push({
      ty: 4, nm: `Fog${i}`, ind: i, ip: 0, op: 120, sr: 1, st: 0, bm: 0, hd: false,
      ao: 0, ddd: 0,
      ks: {
        a: { a: 0, k: [0, 0, 0] },
        p: { a: 1, k: [kf(s.delay, [startX, s.y, 0]), kf(s.delay + s.speed, [endX, s.y, 0]), kf(s.delay + s.speed + 1, [startX + 400, s.y, 0])] },
        s: { a: 0, k: [100, 100, 100] },
        r: { a: 0, k: 0 },
        o: { a: 1, k: [kf(s.delay, [0]), kf(s.delay + 15, [s.a]), kf(s.delay + s.speed - 15, [s.a]), kf(s.delay + s.speed, [0])] }
      },
      shapes: [
        group([
          { ty: "rc", nm: "R", d: 1, hd: false, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [s.w, s.h] }, r: { a: 0, k: s.h / 2 } },
          fillShape(180, 195, 215)
        ], "FogStrip")
      ]
    });
  });

  anim.layers = layers;
  return anim;
}

// ─── 3. THUNDER / LIGHTNING ────────────────────────────────────
function makeThunder() {
  const anim = base("Thunder", 500, 500, 30, 90);

  // Rain drop layer (multiple animated drops)
  const rainDrops = [];
  const dropPositions = [
    [200, -20], [250, -60], [150, -40], [300, -10], [350, -50],
    [100, -30], [320, -70], [180, -15], [280, -45], [230, -80],
  ];
  dropPositions.forEach(([x, y], i) => {
    const delay = (i * 9) % 45;
    const dropLayer = {
      ty: 4, nm: `Drop${i}`, ind: 20 + i, ip: delay, op: 90, sr: 1, st: delay, bm: 0, hd: false,
      ao: 0, ddd: 0,
      ks: {
        a: { a: 0, k: [0, 0, 0] },
        p: { a: 1, k: [kf(delay, [x, y, 0]), kf(delay + 40, [x - 15, y + 420, 0])] },
        s: { a: 0, k: [100, 100, 100] },
        r: { a: 0, k: -15 },
        o: { a: 1, k: [kf(delay, [0]), kf(delay + 5, [80]), kf(delay + 35, [80]), kf(delay + 40, [0])] }
      },
      shapes: [
        group([
          { ty: "rc", d: 1, hd: false, nm: "R", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [3, 22] }, r: { a: 0, k: 2 } },
          fillShape(130, 170, 220)
        ])
      ]
    };
    rainDrops.push(dropLayer);
  });

  // Lightning bolt (flash on/off)
  const boltPoints = "M 10,-80 L -15,10 L 5,10 L -10,80 L 20,-10 L 0,-10 Z";
  const lightningLayer = {
    ty: 4, nm: "Lightning", ind: 5, ip: 0, op: 90, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0, 0, 0] },
      p: { a: 0, k: [255, 220, 0] },
      s: { a: 0, k: [130, 130, 100] },
      r: { a: 0, k: 0 },
      o: {
        a: 1, k: [
          kfHold(0, [0]), kfHold(30, [0]), kfHold(31, [100]), kfHold(33, [100]),
          kfHold(34, [0]), kfHold(36, [0]), kfHold(37, [80]), kfHold(39, [80]),
          kfHold(40, [0]), kfHold(65, [0]), kfHold(66, [100]), kfHold(68, [100]),
          kfHold(69, [0]), kfHold(89, [0])
        ]
      }
    },
    shapes: [
      {
        ty: "gr", nm: "Bolt", hd: false,
        it: [
          {
            ty: "sh", nm: "Path", hd: false,
            ks: { a: 0, k: { i: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]], v: [[10,-80],[-15,10],[5,10],[-10,80],[20,-10],[0,-10],[10,-80]], c: true } }
          },
          fillShape(255, 235, 50),
          { ty: "tr", nm: "T", hd: false, a: { a: 0, k: [0,0] }, p: { a: 0, k: [0,0] }, s: { a: 0, k: [100,100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }
        ]
      }
    ]
  };

  // Dark cloud
  const darkCloud = {
    ty: 4, nm: "DarkCloud", ind: 4, ip: 0, op: 90, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: { a: { a: 0, k: [0,0,0] }, p: { a: 0, k: [250, 160, 0] }, s: { a: 0, k: [100,100,100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
    shapes: [
      group([
        ellipseShape(0, 0, 260, 150),
        ellipseShape(90, -20, 200, 120),
        ellipseShape(-90, -20, 180, 110),
        fillShape(50, 55, 75)
      ], "DC")
    ]
  };

  // Lightning flash overlay (whole screen)
  const flashLayer = {
    ty: 4, nm: "Flash", ind: 1, ip: 0, op: 90, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0,0,0] }, p: { a: 0, k: [250,250,0] }, s: { a: 0, k: [100,100,100] }, r: { a: 0, k: 0 },
      o: { a: 1, k: [kfHold(0,[0]), kfHold(30,[0]), kfHold(31,[15]), kfHold(33,[0]), kfHold(65,[0]), kfHold(66,[20]), kfHold(68,[0]), kfHold(89,[0])] }
    },
    shapes: [
      group([
        { ty: "rc", d: 1, hd: false, nm: "R", p: { a: 0, k: [0,0] }, s: { a: 0, k: [500,500] }, r: { a: 0, k: 0 } },
        fillShape(200, 220, 255)
      ])
    ]
  };

  anim.layers = [...rainDrops, lightningLayer, darkCloud, flashLayer];
  return anim;
}

// ─── 4. DRIZZLE / LIGHT RAIN ───────────────────────────────────
function makeDrizzle() {
  const anim = base("Drizzle", 500, 500, 30, 90);
  const layers = [];

  // 14 light rain drops
  const drops = [];
  for (let i = 0; i < 14; i++) {
    const x = 80 + (i * 30) % 380;
    const delay = (i * 6) % 60;
    drops.push({
      ty: 4, nm: `D${i}`, ind: i, ip: delay, op: 90, sr: 1, st: delay, bm: 0, hd: false,
      ao: 0, ddd: 0,
      ks: {
        a: { a: 0, k: [0,0,0] },
        p: { a: 1, k: [kf(delay, [x, -30, 0]), kf(delay + 55, [x - 10, 480, 0])] },
        s: { a: 0, k: [100, 100, 100] }, r: { a: 0, k: -10 },
        o: { a: 1, k: [kf(delay,[0]), kf(delay+6,[65]), kf(delay+48,[65]), kf(delay+55,[0])] }
      },
      shapes: [
        group([
          { ty: "rc", d: 1, hd: false, nm: "R", p: { a: 0, k: [0,0] }, s: { a: 0, k: [2.5, 18] }, r: { a: 0, k: 2 } },
          fillShape(100, 160, 240)
        ])
      ]
    });
  }

  // Cloud on top
  const cloud = {
    ty: 4, nm: "Cloud", ind: 50, ip: 0, op: 90, sr: 1, st: 0, bm: 0, hd: false,
    ao: 0, ddd: 0,
    ks: {
      a: { a: 0, k: [0,0,0] },
      p: { a: 1, k: [kf(0,[250,165,0]), kf(45,[250,160,0]), kf(90,[250,165,0])] },
      s: { a: 0, k: [100,100,100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }
    },
    shapes: [
      group([
        ellipseShape(0, 0, 240, 130),
        ellipseShape(90, -15, 190, 110),
        ellipseShape(-90, -15, 170, 100),
        fillShape(100, 120, 155)
      ], "Cl")
    ]
  };

  anim.layers = [...drops, cloud];
  return anim;
}

// ─── Write files ───────────────────────────────────────────────
const files = {
  "cloudy.json": makeCloudy(),
  "fog.json": makeFog(),
  "thunder.json": makeThunder(),
  "drizzle.json": makeDrizzle(),
};

let ok = 0;
for (const [name, data] of Object.entries(files)) {
  const filePath = path.join(OUT, name);
  fs.writeFileSync(filePath, JSON.stringify(data));
  const size = fs.statSync(filePath).size;
  console.log(`✅ ${name} → ${(size / 1024).toFixed(1)} KB`);
  ok++;
}
console.log(`\n🎨 Created ${ok} weather animations in ${OUT}`);
