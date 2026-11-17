import * as THREE from 'three';
import { FlavorId, FlavorSpec } from '../data/blendyData';
import {
  createBottleLabelTexture,
  createContactShadowTexture,
  createFruitSliceTexture,
  createTravertineTexture,
} from './proceduralTextures';

export interface FruitOrbiter {
  group: THREE.Group;
  orbitRadius: number;
  baseY: number;
  angleOffset: number;
  orbitSpeed: number;
  bobSpeed: number;
  spinSpeed: THREE.Vector3;
}

export interface LiquidShaderUniforms {
  uTime: { value: number };
  uSlosh: { value: number };
  uColorA: { value: THREE.Color };
  uColorB: { value: THREE.Color };
}

export interface Blendy3DAssembly {
  root: THREE.Group;
  bottleGroup: THREE.Group;
  capGroup: THREE.Group;
  leavesGroup: THREE.Group;
  labelMesh: THREE.Mesh;
  glassMesh: THREE.Mesh;
  liquidMesh: THREE.Mesh;
  splashGroup: THREE.Group;
  pulpMesh: THREE.InstancedMesh;
  splashDrops: THREE.InstancedMesh;
  liquidUniforms: LiquidShaderUniforms;
  orbiters: FruitOrbiter[];
  updateFlavor: (flavour: FlavorSpec) => void;
  refreshLabel: (flavour: FlavorSpec) => void;
  dispose: () => void;
}

const FLAVOR_LIQUID_COLORS: Record<FlavorId, [string, string, string]> = {
  berry: ['#9472CE', '#552E8A', '#754BB0'],
  kiwi: ['#8EC64E', '#467D1A', '#73B334'],
  banana: ['#F5D05A', '#C98F16', '#E8B838'],
  strawberry: ['#EE7D99', '#BA2F52', '#DF5B7D'],
};

function createLeafGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.24, 0.16, 0.3, 0.56, 0.04, 0.84);
  shape.bezierCurveTo(-0.24, 0.6, -0.26, 0.2, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 18,
  });
  geo.center();
  return geo;
}

function buildBerryCluster(colorHex: number, roughness: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness,
    metalness: 0.02,
    clearcoat: 0.65,
    clearcoatRoughness: 0.2,
  });
  const drupeGeo = new THREE.SphereGeometry(0.075, 14, 12);
  const rings = [
    { y: -0.11, r: 0.07, count: 5 },
    { y: -0.02, r: 0.115, count: 7 },
    { y: 0.07, r: 0.11, count: 7 },
    { y: 0.15, r: 0.068, count: 5 },
  ];
  rings.forEach((ring, rIdx) => {
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + rIdx * 0.4;
      const m = new THREE.Mesh(drupeGeo, mat);
      m.position.set(Math.cos(a) * ring.r, ring.y, Math.sin(a) * ring.r);
      m.castShadow = true;
      g.add(m);
    }
  });
  return g;
}

function buildBlueberry(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.185, 24, 18),
    new THREE.MeshPhysicalMaterial({
      color: 0x354886,
      roughness: 0.34,
      clearcoat: 0.45,
      clearcoatRoughness: 0.35,
    })
  );
  body.scale.set(1, 0.86, 1);
  body.castShadow = true;
  g.add(body);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.062, 0.038, 0.045, 6),
    new THREE.MeshStandardMaterial({ color: 0x1d2952, roughness: 0.65 })
  );
  crown.position.y = 0.155;
  g.add(crown);
  return g;
}

function buildStrawberry(skinTex: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const pts = [
    new THREE.Vector2(0.001, -0.24),
    new THREE.Vector2(0.08, -0.18),
    new THREE.Vector2(0.18, -0.02),
    new THREE.Vector2(0.205, 0.11),
    new THREE.Vector2(0.14, 0.21),
    new THREE.Vector2(0.001, 0.24),
  ];
  const bodyGeo = new THREE.LatheGeometry(pts, 28);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: skinTex,
    roughness: 0.28,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  g.add(body);

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x3f8b2d,
    roughness: 0.48,
  });
  const leafGeo = new THREE.ConeGeometry(0.052, 0.15, 5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(a) * 0.08, 0.23, Math.sin(a) * 0.08);
    leaf.rotation.z = Math.PI / 2.2;
    leaf.rotation.y = -a;
    g.add(leaf);
  }
  return g;
}

function buildFruitDisc(
  sliceTex: THREE.CanvasTexture,
  rimColor: number,
  radius: number,
  thickness: number
): THREE.Group {
  const g = new THREE.Group();
  const faceMat = new THREE.MeshPhysicalMaterial({
    map: sliceTex,
    roughness: 0.26,
    clearcoat: 0.45,
    clearcoatRoughness: 0.22,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    roughness: 0.68,
  });
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, thickness, 36),
    [rimMat, faceMat, faceMat]
  );
  disc.castShadow = true;
  g.add(disc);
  return g;
}

export function buildBlendy3DScene(
  initialFlavor: FlavorSpec,
  isSoftwareGl: boolean,
  maxAnisotropy: number
): Blendy3DAssembly {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  // Grounded Travertine Pedestal (y = 0..0.16)
  const travertineTex = createTravertineTexture(maxAnisotropy);
  disposables.push(travertineTex);
  const plinthGeo = new THREE.CylinderGeometry(1.16, 1.24, 0.16, 56);
  const plinthMat = new THREE.MeshStandardMaterial({
    map: travertineTex,
    roughness: 0.82,
    metalness: 0.02,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.08;
  plinth.receiveShadow = true;
  root.add(plinth);
  disposables.push(plinthGeo, plinthMat);

  // Soft Contact Shadow plane on top of plinth
  const contactTex = createContactShadowTexture();
  disposables.push(contactTex);
  const shadowPlaneGeo = new THREE.PlaneGeometry(1.42, 1.42);
  const shadowPlaneMat = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.82,
  });
  const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.165;
  root.add(shadowPlane);
  disposables.push(shadowPlaneGeo, shadowPlaneMat);

  // Main Bottle Composite Group
  const bottleGroup = new THREE.Group();
  bottleGroup.position.y = 0.165;
  root.add(bottleGroup);

  // 1. Inner Smoothie Liquid (LatheGeometry + onBeforeCompile shader)
  const liquidProfile = [
    new THREE.Vector2(0.0, 0.06),
    new THREE.Vector2(0.37, 0.06),
    new THREE.Vector2(0.425, 0.14),
    new THREE.Vector2(0.43, 1.28),
    new THREE.Vector2(0.39, 1.54),
    new THREE.Vector2(0.24, 1.72),
    new THREE.Vector2(0.0, 1.72),
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidProfile, 48);
  const [initColA, initColB, initSplashCol] = FLAVOR_LIQUID_COLORS[initialFlavor.id];
  const liquidUniforms: LiquidShaderUniforms = {
    uTime: { value: 0 },
    uSlosh: { value: 0.2 },
    uColorA: { value: new THREE.Color(initColA) },
    uColorB: { value: new THREE.Color(initColB) },
  };

  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.0,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });

  liquidMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = liquidUniforms.uTime;
    shader.uniforms.uSlosh = liquidUniforms.uSlosh;
    shader.uniforms.uColorA = liquidUniforms.uColorA;
    shader.uniforms.uColorB = liquidUniforms.uColorB;

    shader.vertexShader =
      `
      uniform float uTime;
      uniform float uSlosh;
      varying vec3 vLocalPos;
    \n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalPos = position;
        float topMask = smoothstep(1.32, 1.72, position.y);
        float wave = sin(position.x * 7.0 + uTime * 3.8) * cos(position.z * 7.0 - uTime * 3.1);
        transformed.y += wave * (0.018 + uSlosh * 0.065) * topMask;
        float swirlTilt = sin(uTime * 2.5) * uSlosh * 0.05;
        transformed.y += position.x * swirlTilt * topMask;
      `
      );

    shader.fragmentShader =
      `
      uniform float uTime;
      uniform float uSlosh;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vLocalPos;
    \n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        float angle = atan(vLocalPos.z, vLocalPos.x);
        float ribbon = 0.5 + 0.5 * sin(angle * 3.0 + vLocalPos.y * 4.8 - uTime * (1.6 + uSlosh * 2.4));
        float verticalGrad = smoothstep(0.1, 1.65, vLocalPos.y);
        vec3 baseMix = mix(uColorB, uColorA, verticalGrad * 0.65 + 0.25);
        vec3 swirlCol = mix(baseMix, uColorA * 1.08, smoothstep(0.35, 0.9, ribbon) * 0.65);
        diffuseColor.rgb *= swirlCol;
      `
      );
  };

  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.castShadow = true;
  liquidMesh.receiveShadow = true;
  liquidMesh.renderOrder = 1;
  bottleGroup.add(liquidMesh);
  disposables.push(liquidGeo, liquidMat);

  // 1b. Suspended Real-Fruit Seeds / Pulp Flecks inside Bottle (InstancedMesh)
  const pulpCount = 110;
  const pulpGeo = new THREE.SphereGeometry(0.011, 6, 5);
  const pulpMat = new THREE.MeshStandardMaterial({
    color: 0x241720,
    roughness: 0.45,
  });
  const pulpMesh = new THREE.InstancedMesh(pulpGeo, pulpMat, pulpCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < pulpCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const rad = 0.14 + Math.random() * 0.27;
    const y = 0.16 + Math.random() * 1.45;
    dummy.position.set(Math.cos(theta) * rad, y, Math.sin(theta) * rad);
    dummy.scale.setScalar(0.6 + Math.random() * 0.9);
    dummy.updateMatrix();
    pulpMesh.setMatrixAt(i, dummy.matrix);
  }
  pulpMesh.instanceMatrix.needsUpdate = true;
  pulpMesh.computeBoundingSphere();
  pulpMesh.renderOrder = 2;
  bottleGroup.add(pulpMesh);
  disposables.push(pulpGeo, pulpMat);

  // 2. Outer Glass Bottle Vessel (LatheGeometry)
  const glassProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.41, 0.0),
    new THREE.Vector2(0.47, 0.09),
    new THREE.Vector2(0.475, 1.32),
    new THREE.Vector2(0.42, 1.6),
    new THREE.Vector2(0.21, 1.88),
    new THREE.Vector2(0.185, 2.08),
    new THREE.Vector2(0.205, 2.11),
    new THREE.Vector2(0.165, 2.11),
  ];
  const glassGeo = new THREE.LatheGeometry(glassProfile, 48);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.88,
    transparent: true,
    opacity: isSoftwareGl ? 0.26 : 1.0,
    ior: 1.52,
    thickness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.renderOrder = 3;
  bottleGroup.add(glassMesh);
  disposables.push(glassGeo, glassMat);

  // 3. Wraparound Blendy Label (4:1 aspect matching 2048x512 CanvasTexture)
  let currentLabelTex = createBottleLabelTexture(initialFlavor, maxAnisotropy);
  const labelGeo = new THREE.CylinderGeometry(0.482, 0.482, 0.76, 56, 1, true);
  const labelMat = new THREE.MeshStandardMaterial({
    map: currentLabelTex,
    roughness: 0.62,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.72;
  labelMesh.rotation.y = -Math.PI / 2;
  labelMesh.castShadow = true;
  labelMesh.renderOrder = 4;
  bottleGroup.add(labelMesh);
  disposables.push(labelGeo, labelMat);

  // 4. Fluted Anodized Dark/Flavour-Tinted Cap + Neck Collar
  const capGroup = new THREE.Group();
  const capMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialFlavor.ink).lerp(new THREE.Color(0x1e1b18), 0.35),
    metalness: 0.68,
    roughness: 0.26,
    anisotropy: 0.8,
    clearcoat: 0.4,
  });
  const capBodyGeo = new THREE.CylinderGeometry(0.205, 0.214, 0.23, 36);
  const capBody = new THREE.Mesh(capBodyGeo, capMat);
  capBody.position.y = 2.16;
  capBody.castShadow = true;
  capGroup.add(capBody);

  // Machined grip ribs on cap
  const ribGeo = new THREE.BoxGeometry(0.014, 0.19, 0.018);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, capMat);
    rib.position.set(Math.cos(a) * 0.209, 2.16, Math.sin(a) * 0.209);
    rib.rotation.y = -a;
    capGroup.add(rib);
  }

  const capRingGeo = new THREE.TorusGeometry(0.208, 0.015, 12, 36);
  const capRing = new THREE.Mesh(capRingGeo, capMat);
  capRing.rotation.x = Math.PI / 2;
  capRing.position.y = 2.02;
  capGroup.add(capRing);

  bottleGroup.add(capGroup);
  disposables.push(capBodyGeo, ribGeo, capRingGeo, capMat);

  // 5. Dual Botanical Mint Leaves around Neck
  const leavesGroup = new THREE.Group();
  leavesGroup.position.set(0, 1.94, 0);
  const leafGeo = createLeafGeometry();
  const leafMatA = new THREE.MeshPhysicalMaterial({
    color: 0x429632,
    roughness: 0.36,
    clearcoat: 0.35,
  });
  const leafMatB = new THREE.MeshPhysicalMaterial({
    color: 0x5ab144,
    roughness: 0.38,
    clearcoat: 0.35,
  });

  const leafA = new THREE.Mesh(leafGeo, leafMatA);
  leafA.position.set(-0.26, 0.08, 0.12);
  leafA.rotation.set(0.32, 0.22, 0.96);
  leafA.scale.setScalar(0.62);
  leafA.castShadow = true;
  leavesGroup.add(leafA);

  const leafB = new THREE.Mesh(leafGeo, leafMatB);
  leafB.position.set(0.24, 0.13, 0.14);
  leafB.rotation.set(0.22, -0.35, -0.88);
  leafB.scale.setScalar(0.5);
  leafB.castShadow = true;
  leavesGroup.add(leafB);

  bottleGroup.add(leavesGroup);
  disposables.push(leafGeo, leafMatA, leafMatB);

  // 6. Chilled Condensation Droplets (InstancedMesh)
  const dropCount = 84;
  const dropGeo = new THREE.SphereGeometry(0.012, 8, 6);
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.72,
  });
  const droplets = new THREE.InstancedMesh(dropGeo, dropMat, dropCount);
  for (let i = 0; i < dropCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const y = 0.2 + Math.random() * 1.28;
    const r = 0.484;
    dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
    const sc = 0.55 + Math.random() * 0.9;
    dummy.scale.set(sc * 0.7, sc * 1.15, sc * 0.7);
    dummy.lookAt(Math.cos(theta) * 2, y, Math.sin(theta) * 2);
    dummy.updateMatrix();
    droplets.setMatrixAt(i, dummy.matrix);
  }
  droplets.instanceMatrix.needsUpdate = true;
  droplets.computeBoundingSphere();
  bottleGroup.add(droplets);
  disposables.push(dropGeo, dropMat);

  // 7. Dynamic Glossy Smoothie Splash Ribbon Wrapping the Bottle
  const splashGroup = new THREE.Group();
  splashGroup.position.y = 0.165;
  root.add(splashGroup);

  const splashCurvePoints: THREE.Vector3[] = [];
  const ribbonSteps = 22;
  for (let i = 0; i <= ribbonSteps; i++) {
    const t = i / ribbonSteps;
    const angle = -0.6 + t * Math.PI * 2.15;
    const rad = 0.72 + Math.sin(t * Math.PI) * 0.34;
    const y = 0.42 + t * 1.32 + Math.sin(t * Math.PI * 3) * 0.08;
    splashCurvePoints.push(
      new THREE.Vector3(Math.cos(angle) * rad, y, Math.sin(angle) * rad)
    );
  }
  const splashCurve = new THREE.CatmullRomCurve3(splashCurvePoints);
  const splashGeo = new THREE.TubeGeometry(splashCurve, 96, 0.045, 16, false);
  // Taper the tube ends smoothly
  const posAttr = splashGeo.attributes.position;
  const centerPt = new THREE.Vector3();
  const vertexPt = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    const ringIdx = Math.floor(i / 17);
    const u = ringIdx / 96;
    const taper = Math.sin(u * Math.PI);
    const scale = 0.15 + 0.95 * Math.pow(taper, 0.55);
    splashCurve.getPointAt(Math.min(1, Math.max(0, u)), centerPt);
    vertexPt.fromBufferAttribute(posAttr, i);
    vertexPt.sub(centerPt).multiplyScalar(scale).add(centerPt);
    posAttr.setXYZ(i, vertexPt.x, vertexPt.y, vertexPt.z);
  }
  splashGeo.computeVertexNormals();

  const splashMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initSplashCol),
    roughness: 0.12,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const splashMesh = new THREE.Mesh(splashGeo, splashMat);
  splashMesh.castShadow = true;
  splashGroup.add(splashMesh);
  disposables.push(splashGeo, splashMat);

  // Orbiting Splash Juice Pearls along the swirl
  const pearlCount = 34;
  const pearlGeo = new THREE.SphereGeometry(0.036, 12, 10);
  const splashDrops = new THREE.InstancedMesh(pearlGeo, splashMat, pearlCount);
  for (let i = 0; i < pearlCount; i++) {
    const u = Math.random();
    splashCurve.getPointAt(u, centerPt);
    const jitterR = 0.08 + Math.random() * 0.22;
    const ja = Math.random() * Math.PI * 2;
    dummy.position.set(
      centerPt.x + Math.cos(ja) * jitterR,
      centerPt.y + (Math.random() - 0.5) * 0.24,
      centerPt.z + Math.sin(ja) * jitterR
    );
    const sc = 0.4 + Math.random() * 1.15;
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    splashDrops.setMatrixAt(i, dummy.matrix);
  }
  splashDrops.instanceMatrix.needsUpdate = true;
  splashDrops.computeBoundingSphere();
  splashDrops.castShadow = true;
  splashGroup.add(splashDrops);
  disposables.push(pearlGeo);

  // 8. Orbiting Juicy 3D Fruits
  const fruitRoot = new THREE.Group();
  root.add(fruitRoot);
  let orbiters: FruitOrbiter[] = [];
  let activeFruitTextures: THREE.Texture[] = [];

  function populateFruits(flavorId: FlavorId) {
    while (fruitRoot.children.length > 0) {
      fruitRoot.remove(fruitRoot.children[0]);
    }
    activeFruitTextures.forEach((t) => t.dispose());
    activeFruitTextures = [];
    orbiters = [];

    const specs = [
      { radius: 0.96, y: 2.05, angle: 0.35, speed: 0.35, bob: 1.45 },
      { radius: 1.14, y: 1.32, angle: 1.9, speed: 0.28, bob: 1.7 },
      { radius: 0.98, y: 0.64, angle: 3.45, speed: 0.38, bob: 1.3 },
      { radius: 1.12, y: 1.72, angle: 4.9, speed: 0.26, bob: 1.55 },
      { radius: 1.04, y: 0.92, angle: 5.8, speed: 0.32, bob: 1.4 },
    ];

    let fruitTex: THREE.CanvasTexture | null = null;
    if (flavorId === 'kiwi' || flavorId === 'banana' || flavorId === 'strawberry') {
      fruitTex = createFruitSliceTexture(flavorId, maxAnisotropy);
      activeFruitTextures.push(fruitTex);
    }

    specs.forEach((sp, idx) => {
      let fg: THREE.Group;
      if (flavorId === 'berry') {
        if (idx % 3 === 0) fg = buildBlueberry();
        else if (idx % 3 === 1) fg = buildBerryCluster(0xc42254, 0.28);
        else fg = buildBerryCluster(0x271a38, 0.22);
      } else if (flavorId === 'kiwi' && fruitTex) {
        fg = buildFruitDisc(fruitTex, 0x6c4b2b, 0.28, 0.075);
        fg.rotation.x = 0.72;
      } else if (flavorId === 'banana' && fruitTex) {
        fg = buildFruitDisc(fruitTex, 0xe4bc42, 0.24, 0.095);
        fg.rotation.z = 0.58;
      } else if (fruitTex) {
        fg = buildStrawberry(fruitTex);
      } else {
        fg = buildBlueberry();
      }

      fruitRoot.add(fg);
      orbiters.push({
        group: fg,
        orbitRadius: sp.radius,
        baseY: sp.y,
        angleOffset: sp.angle,
        orbitSpeed: sp.speed,
        bobSpeed: sp.bob,
        spinSpeed: new THREE.Vector3(0.32 + idx * 0.1, 0.48 + idx * 0.12, 0.24),
      });
    });
  }

  populateFruits(initialFlavor.id);

  function refreshLabel(flavour: FlavorSpec) {
    const nextTex = createBottleLabelTexture(flavour, maxAnisotropy);
    labelMat.map = nextTex;
    labelMat.needsUpdate = true;
    currentLabelTex.dispose();
    currentLabelTex = nextTex;
  }

  function updateFlavor(nextFlavor: FlavorSpec) {
    const [colA, colB, splashCol] = FLAVOR_LIQUID_COLORS[nextFlavor.id];
    liquidUniforms.uColorA.value.set(colA);
    liquidUniforms.uColorB.value.set(colB);
    liquidUniforms.uSlosh.value = 1.2;

    splashMat.color.set(splashCol);
    capMat.color.set(nextFlavor.ink).lerp(new THREE.Color(0x1e1b18), 0.35);

    refreshLabel(nextFlavor);
    populateFruits(nextFlavor.id);
  }

  function dispose() {
    currentLabelTex.dispose();
    activeFruitTextures.forEach((t) => t.dispose());
    disposables.forEach((d) => d.dispose());
  }

  return {
    root,
    bottleGroup,
    capGroup,
    leavesGroup,
    labelMesh,
    glassMesh,
    liquidMesh,
    splashGroup,
    pulpMesh,
    splashDrops,
    liquidUniforms,
    orbiters,
    updateFlavor,
    refreshLabel,
    dispose,
  };
}
