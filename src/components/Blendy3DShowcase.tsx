import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, Layers, RotateCcw, Waves } from 'lucide-react';
import { FLAVORS, FLAVOR_MAP, FlavorId } from '../data/blendyData';
import { Blendy3DAssembly, buildBlendy3DScene } from '../three/bottleBuilder';

const _targetBgColor = new THREE.Color();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

type CameraPreset = 'hero' | 'exploded' | 'closeup';

interface Blendy3DShowcaseProps {
  flavorId: FlavorId;
  onSelectFlavor?: (id: FlavorId) => void;
  heightClass?: string;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const Blendy3DShowcase: React.FC<Blendy3DShowcaseProps> = ({
  flavorId,
  onSelectFlavor,
  heightClass = 'h-[560px] sm:h-[640px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [exploded, setExploded] = useState(false);
  const [preset, setPreset] = useState<CameraPreset>('hero');
  const [hudCollapsed, setHudCollapsed] = useState(false);

  const controlStateRef = useRef({
    flavorId,
    exploded: false,
    preset: 'hero' as CameraPreset,
    presetAnimating: false,
    sloshImpulse: 0.3,
    isVisible: true,
    assembly: null as Blendy3DAssembly | null,
  });

  useEffect(() => {
    const st = controlStateRef.current;
    if (st.flavorId !== flavorId) {
      st.flavorId = flavorId;
      st.sloshImpulse = 1.25;
      st.assembly?.updateFlavor(FLAVOR_MAP[flavorId]);
    }
  }, [flavorId]);

  useEffect(() => {
    controlStateRef.current.exploded = exploded;
    if (exploded) {
      controlStateRef.current.preset = 'exploded';
      controlStateRef.current.presetAnimating = true;
      setPreset('exploded');
    }
  }, [exploded]);

  const applyPreset = (nextPreset: CameraPreset) => {
    setPreset(nextPreset);
    controlStateRef.current.preset = nextPreset;
    controlStateRef.current.presetAnimating = true;
    if (nextPreset === 'exploded') {
      setExploded(true);
    } else if (nextPreset === 'hero') {
      setExploded(false);
    }
  };

  const triggerSwirl = () => {
    controlStateRef.current.sloshImpulse = 1.45;
  };

  useEffect(() => {
    const mountEl = mountRef.current;
    const containerEl = containerRef.current;
    if (!mountEl || !containerEl) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initialFlavor = FLAVOR_MAP[controlStateRef.current.flavorId];

    const width = mountEl.clientWidth || 800;
    const height = mountEl.clientHeight || 580;

    const scene = new THREE.Scene();
    // Use rich flavour pastel backdrop directly so the bottle & liquid pop dramatically
    const initialBg = new THREE.Color(initialFlavor.bg);
    scene.background = initialBg;
    scene.fog = new THREE.FogExp2(initialBg.getHex(), 0.032);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 40);
    camera.position.set(0.32, 1.72, 4.95);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountEl.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.72;
    pmremGenerator.dispose();

    // Balanced Studio Lighting (controlled intensity so pastels stay vivid)
    const hemiLight = new THREE.HemisphereLight(0xf6f8ff, 0xcabaa4, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.55);
    keyLight.position.set(3.2, 5.4, 4.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 2.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.95);
    rimLight.position.set(-3.4, 3.8, -3.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxL = new THREE.RectAreaLight(0xffffff, 1.65, 1.4, 3.0);
      softboxL.position.set(-2.9, 1.9, 2.5);
      softboxL.lookAt(0, 1.2, 0);
      scene.add(softboxL);

      const softboxR = new THREE.RectAreaLight(0xfff8ee, 1.35, 1.3, 2.8);
      softboxR.position.set(3.0, 1.8, 2.2);
      softboxR.lookAt(0, 1.2, 0);
      scene.add(softboxR);
    }

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const assembly = buildBlendy3DScene(initialFlavor, isSoftwareGl, maxAnisotropy);
    // Offset slightly upward so bottle sits cleanly above the bottom dock
    assembly.root.position.y = 0.14;
    scene.add(assembly.root);
    controlStateRef.current.assembly = assembly;

    // Redraw label once self-hosted fonts finish loading so Baloo 2 renders crisply
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) {
          assembly.refreshLabel(FLAVOR_MAP[controlStateRef.current.flavorId]);
        }
      });
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.26, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.update();

    const onControlsStart = () => {
      controlStateRef.current.presetAnimating = false;
      controlStateRef.current.sloshImpulse = Math.max(
        controlStateRef.current.sloshImpulse,
        0.65
      );
    };
    controls.addEventListener('start', onControlsStart);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const ro = new ResizeObserver(() => {
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(mountEl);

    const io = new IntersectionObserver(
      (entries) => {
        controlStateRef.current.isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(containerEl);

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsedTotal = 0;
    let explodeFactor = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick(now: number) {
      if (disposed) return;

      const delta = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const st = controlStateRef.current;

      if (st.isVisible) {
        if (!reducedMotion) {
          elapsedTotal += delta;
          assembly.bottleGroup.rotation.y += delta * (0.24 + st.sloshImpulse * 0.52);
          assembly.splashGroup.rotation.y -= delta * (0.42 + st.sloshImpulse * 0.85);
          assembly.splashGroup.position.y =
            0.165 + Math.sin(elapsedTotal * 2.1) * 0.04;
        }

        // Smoothly lerp 3D backdrop & fog to match active hero flavour pastel
        const targetSpec = FLAVOR_MAP[st.flavorId];
        _targetBgColor.set(targetSpec.bg);
        (scene.background as THREE.Color).lerp(
          _targetBgColor,
          1 - Math.exp(-5.5 * delta)
        );
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.copy(scene.background as THREE.Color);
        }

        st.sloshImpulse = THREE.MathUtils.damp(st.sloshImpulse, 0.16, 2.0, delta);
        assembly.liquidUniforms.uTime.value = elapsedTotal;
        assembly.liquidUniforms.uSlosh.value = st.sloshImpulse;

        explodeFactor = THREE.MathUtils.damp(
          explodeFactor,
          st.exploded ? 1 : 0,
          6.5,
          delta
        );
        assembly.capGroup.position.y = explodeFactor * 0.72;
        assembly.leavesGroup.position.y = 1.94 + explodeFactor * 0.42;
        assembly.glassMesh.position.y = explodeFactor * 0.18;
        assembly.labelMesh.position.y = 0.72 - explodeFactor * 0.12;
        assembly.labelMesh.position.z = explodeFactor * 0.24;
        assembly.splashGroup.scale.setScalar(1 + explodeFactor * 0.18);

        assembly.orbiters.forEach((orb) => {
          const angle = orb.angleOffset + elapsedTotal * orb.orbitSpeed;
          const r = orb.orbitRadius + explodeFactor * 0.34;
          orb.group.position.set(
            Math.cos(angle) * r,
            orb.baseY + Math.sin(elapsedTotal * orb.bobSpeed + orb.angleOffset) * 0.12,
            Math.sin(angle) * r
          );
          if (!reducedMotion) {
            orb.group.rotation.x += orb.spinSpeed.x * delta;
            orb.group.rotation.y += orb.spinSpeed.y * delta;
          }
        });

        if (st.presetAnimating) {
          if (st.preset === 'hero') {
            _targetCamPos.set(0.32, 1.72, 4.95);
            _targetLookAt.set(0, 1.26, 0);
          } else if (st.preset === 'exploded') {
            _targetCamPos.set(1.2, 2.1, 5.55);
            _targetLookAt.set(0, 1.45, 0);
          } else {
            _targetCamPos.set(0.18, 2.35, 3.25);
            _targetLookAt.set(0, 1.5, 0);
          }
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            _targetCamPos.x,
            5,
            delta
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            _targetCamPos.y,
            5,
            delta
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            _targetCamPos.z,
            5,
            delta
          );
          controls.target.x = THREE.MathUtils.damp(
            controls.target.x,
            _targetLookAt.x,
            5,
            delta
          );
          controls.target.y = THREE.MathUtils.damp(
            controls.target.y,
            _targetLookAt.y,
            5,
            delta
          );
          controls.target.z = THREE.MathUtils.damp(
            controls.target.z,
            _targetLookAt.z,
            5,
            delta
          );

          if (camera.position.distanceTo(_targetCamPos) < 0.02) {
            st.presetAnimating = false;
          }
        }

        controls.update();
        renderer.render(scene, camera);
      }

      if (reducedMotion) return;

      if (isSoftwareGl) {
        afterDraw(() => tick(performance.now()));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      io.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      assembly.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} rounded-[2rem] overflow-hidden border border-black/10 select-none theme-transition`}
      style={{ backgroundColor: FLAVOR_MAP[flavorId].bg }}
    >
      {/* Isolated WebGL Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label={`Interactive 3D ${FLAVOR_MAP[flavorId].fullName} bottle`}
      />

      {/* Minimal Top-Left Spec Label */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-5 sm:left-5">
        <span className="px-3.5 py-1.5 rounded-full bg-white/92 border border-black/10 text-xs font-semibold text-[#1E1B18]">
          3D Sensory Studio · Drag to Orbit
        </span>
      </div>

      {/* Collapsible Bottom Control Dock (never overlaps bottle center) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-3.5 w-[min(700px,94%)] transition-transform duration-300 ease-out ${
          hudCollapsed ? 'translate-y-[calc(100%-34px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-[#FDFBF7]/96 border border-black/10 rounded-2xl px-3.5 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
          {/* Flavour Swatches */}
          <div className="flex items-center gap-1.5" role="group" aria-label="3D flavour selector">
            {FLAVORS.map((f) => {
              const active = f.id === flavorId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelectFlavor?.(f.id)}
                  title={f.fullName}
                  aria-label={`Inspect ${f.fullName} in 3D`}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    active ? 'scale-115 ring-2 ring-[#1E1B18] ring-offset-1' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: f.bg }}
                />
              );
            })}
          </div>

          {/* Camera & Liquid Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('hero')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                preset === 'hero' && !exploded
                  ? 'bg-[#1E1B18] text-white'
                  : 'bg-black/5 text-[#1E1B18] hover:bg-black/10'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !exploded;
                setExploded(next);
                if (!next) applyPreset('hero');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                exploded
                  ? 'bg-[#1E1B18] text-white'
                  : 'bg-black/5 text-[#1E1B18] hover:bg-black/10'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Explode</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('closeup')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                preset === 'closeup'
                  ? 'bg-[#1E1B18] text-white'
                  : 'bg-black/5 text-[#1E1B18] hover:bg-black/10'
              }`}
            >
              Top Pour
            </button>

            <button
              type="button"
              onClick={triggerSwirl}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 text-[#1E1B18] cursor-pointer transition-opacity hover:opacity-85"
              style={{ backgroundColor: FLAVOR_MAP[flavorId].bg }}
            >
              <Waves className="w-3 h-3" />
              <span>Swirl</span>
            </button>

            <button
              type="button"
              onClick={() => setHudCollapsed((v) => !v)}
              aria-label={hudCollapsed ? 'Expand 3D controls' : 'Minimize 3D controls'}
              className="p-1.5 rounded-full bg-black/5 text-[#1E1B18] hover:bg-black/10 cursor-pointer"
            >
              {hudCollapsed ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
