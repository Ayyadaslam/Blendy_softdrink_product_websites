import React, { useEffect, useRef } from 'react';
import { FLAVORS, FLAVOR_MAP, FLOOR_SHADOWS, FlavorId } from '../data/blendyData';
import { useStore } from '../context/StoreContext';

const COVER_POINTS: Array<[number, number]> = [
  [0, 0],
  [0.031, 0.006],
  [0.134, 0.012],
  [0.206, 0.023],
  [0.278, 0.047],
  [0.34, 0.07],
  [0.412, 0.105],
  [0.485, 0.158],
  [0.546, 0.246],
  [0.583, 0.55],
  [0.62, 0.825],
  [0.69, 0.9],
  [0.79, 0.94],
  [0.85, 0.956],
  [0.93, 0.975],
  [1, 1],
];

const PARALLAX_FACTORS = {
  word: 0.4,
  shadow: 0.3,
  bottle: 0.15,
  fruit: 0.55,
  corner: 0.75,
} as const;

const LAYER_ORDER = ['word', 'shadow', 'bottle', 'fruit', 'corner'] as const;
type LayerName = (typeof LAYER_ORDER)[number];

const TRANSITION_MS = 970;

function cover(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 0; i < COVER_POINTS.length - 1; i++) {
    const [t0, c0] = COVER_POINTS[i];
    const [t1, c1] = COVER_POINTS[i + 1];
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const s = k * k * (3 - 2 * k);
      return c0 + (c1 - c0) * s;
    }
  }
  return 1;
}

function easeOutQuad(x: number): number {
  const clamped = x < 0 ? 0 : x > 1 ? 1 : x;
  return 1 - (1 - clamped) * (1 - clamped);
}

export const HeroSlider: React.FC = () => {
  const { activeFlavor, setActiveFlavor, navigate, cartCount, setIsCartOpen, setIsRegisterOpen } =
    useStore();

  const heroRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const wordRefs = useRef<Array<HTMLDivElement | null>>([]);
  const layerRefs = useRef<Array<Record<LayerName, HTMLDivElement | null>>>(
    FLAVORS.map(() => ({ word: null, shadow: null, bottle: null, fruit: null, corner: null }))
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const underlineRef = useRef<HTMLSpanElement | null>(null);
  const revealRefs = useRef<Array<HTMLElement | null>>([]);

  // Mutable animation controller state
  const stateRef = useRef({
    currentIndex: Math.max(0, FLAVORS.findIndex((f) => f.id === activeFlavor)),
    currentU: 1,
    isMobile: false,
    isTransitioning: false,
    lastInteraction: 0,
    revealDone: false,
    openingAnims: [] as Animation[],
    bobTimings: FLAVORS.map((f) =>
      f.pieces.map(() => ({
        dur: (3.2 + Math.random() * 1.8).toFixed(3),
        delay: (-Math.random() * 4).toFixed(3),
      }))
    ),
  });

  // Expose goTo via ref so event handlers inside & outside can invoke it safely
  const goToRef = useRef<(targetIndex: number, dir: 1 | -1) => void>(() => {});

  useEffect(() => {
    const st = stateRef.current;
    const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');

    function measureInkWidthAt100(word: string, trackingEm: number): number {
      if (!measureCtx) return word.length * 60;
      measureCtx.font = '700 100px Poppins, system-ui, sans-serif';
      if ('letterSpacing' in measureCtx) {
        (measureCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          trackingEm * 100 + 'px';
      }
      const metrics = measureCtx.measureText(word);
      let ink =
        typeof metrics.actualBoundingBoxLeft === 'number' &&
        typeof metrics.actualBoundingBoxRight === 'number'
          ? metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
          : metrics.width;
      if (!('letterSpacing' in measureCtx)) {
        ink += Math.max(0, word.length - 1) * (trackingEm * 100);
      }
      return ink;
    }

    function layoutWords(vw: number) {
      const maxFitWidth = st.isMobile ? Math.min(1440, vw / st.currentU) * 0.92 : 1400;
      FLAVORS.forEach((flavour, i) => {
        const wordEl = wordRefs.current[i];
        if (!wordEl) return;
        const word = flavour.name;
        const inkLoose = measureInkWidthAt100(word, 0.005);
        const isLongWord = inkLoose * 4.45 > 1330;

        const trackingEm = isLongWord ? -0.035 : 0.005;
        const inkPer100 = isLongWord ? measureInkWidthAt100(word, -0.035) : inkLoose;

        const F = Math.min(445, (maxFitWidth * 100) / Math.max(1, inkPer100));
        const baseline = 403.5 + (0.698 * F) / 2;
        const top = baseline - 0.85 * F;

        wordEl.style.fontSize = `calc(${F.toFixed(4)} * var(--u))`;
        wordEl.style.letterSpacing = trackingEm + 'em';
        wordEl.style.top = `calc(${top.toFixed(4)} * var(--u))`;
      });
    }

    function moveUnderline(index: number, instant: boolean) {
      const underlineEl = underlineRef.current;
      const tab = tabRefs.current[index];
      if (!underlineEl || !tab) return;
      if (instant || reducedMotionMQ.matches) {
        underlineEl.classList.add('no-transition');
      } else {
        underlineEl.classList.remove('no-transition');
      }
      underlineEl.style.width = tab.offsetWidth + 'px';
      underlineEl.style.transform = `translateX(${tab.offsetLeft}px)`;
      if (instant && !reducedMotionMQ.matches) {
        void underlineEl.offsetWidth;
        underlineEl.classList.remove('no-transition');
      }
    }

    function updateLayout(instantUnderline: boolean) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      st.isMobile = vw <= 820 || vh > vw;

      document.documentElement.classList.toggle('is-hero-mobile', st.isMobile);

      if (st.isMobile) {
        st.currentU = Math.max(0.1, Math.min(vw / 640, (vh - 200) / 620));
        document.documentElement.style.setProperty('--fy', '8px');
      } else {
        st.currentU = Math.max(0.1, Math.min(vw / 1440, vh / 900));
        document.documentElement.style.setProperty('--fy', '0px');
      }

      document.documentElement.style.setProperty('--u', st.currentU + 'px');
      layoutWords(vw);
      moveUnderline(st.currentIndex, instantUnderline);
    }

    function clearSlideTransforms(index: number) {
      const section = slideRefs.current[index];
      if (section) section.style.clipPath = '';
      LAYER_ORDER.forEach((name) => {
        const layer = layerRefs.current[index]?.[name];
        if (layer) layer.style.transform = '';
      });
    }

    function finishRevealInstant() {
      if (st.revealDone) return;
      st.revealDone = true;
      revealRefs.current.forEach((el) => {
        if (!el) return;
        el.classList.remove('blendy-ui-hidden');
        el.style.opacity = '';
        el.style.translate = '';
      });
      clearSlideTransforms(st.currentIndex);
    }

    function cancelOpeningAnimations() {
      if (st.openingAnims.length) {
        st.openingAnims.forEach((a) => {
          try {
            a.cancel();
          } catch {
            // ignore
          }
        });
        st.openingAnims = [];
      }
      finishRevealInstant();
    }

    function updateActiveTabUI(targetIndex: number) {
      tabRefs.current.forEach((tab, i) => {
        if (tab) {
          tab.setAttribute('aria-current', i === targetIndex ? 'true' : 'false');
        }
      });
      moveUnderline(targetIndex, false);
    }

    goToRef.current = (targetIndex: number, dir: 1 | -1) => {
      if (st.isTransitioning || targetIndex === st.currentIndex) return;

      cancelOpeningAnimations();

      const fromIndex = st.currentIndex;
      const A = slideRefs.current[fromIndex];
      const B = slideRefs.current[targetIndex];
      if (!A || !B) return;

      const frameW = 1440 * st.currentU;
      updateActiveTabUI(targetIndex);
      setActiveFlavor(FLAVORS[targetIndex].id);

      if (reducedMotionMQ.matches) {
        A.classList.remove('is-active');
        A.style.display = 'none';
        A.style.zIndex = '0';
        A.setAttribute('aria-hidden', 'true');
        clearSlideTransforms(fromIndex);

        B.classList.add('is-active');
        B.style.display = 'block';
        B.style.zIndex = '2';
        B.setAttribute('aria-hidden', 'false');
        clearSlideTransforms(targetIndex);

        st.currentIndex = targetIndex;
        return;
      }

      st.isTransitioning = true;

      // Prepare B under A
      B.style.display = 'block';
      B.style.zIndex = '1';
      B.style.clipPath = '';
      B.setAttribute('aria-hidden', 'false');
      LAYER_ORDER.forEach((name) => {
        const layer = layerRefs.current[targetIndex]?.[name];
        if (layer) {
          const offset = dir * PARALLAX_FACTORS[name] * frameW;
          layer.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      });

      // Keep A on top
      A.style.display = 'block';
      A.style.zIndex = '2';
      A.style.clipPath = dir === 1 ? 'inset(0 0% 0 0)' : 'inset(0 0 0 0%)';

      const startTime = performance.now();

      function step(now: number) {
        if (!A || !B) {
          st.isTransitioning = false;
          return;
        }
        const elapsed = now - startTime;
        const t = elapsed / TRANSITION_MS;
        const tClamped = t > 1 ? 1 : t;
        const c = cover(tClamped);

        if (dir === 1) {
          A.style.clipPath = `inset(0 ${(c * 100).toFixed(4)}% 0 0)`;
        } else {
          A.style.clipPath = `inset(0 0 0 ${(c * 100).toFixed(4)}%)`;
        }

        const ax = -dir * c * 0.14 * frameW;
        LAYER_ORDER.forEach((name) => {
          const layerA = layerRefs.current[fromIndex]?.[name];
          if (layerA) {
            layerA.style.transform = ax === 0 ? '' : `translate3d(${ax}px, 0, 0)`;
          }
        });

        const k = easeOutQuad((t - 0.5) / 0.42);
        LAYER_ORDER.forEach((name) => {
          const layerB = layerRefs.current[targetIndex]?.[name];
          if (layerB) {
            const bx = dir * (1 - k) * PARALLAX_FACTORS[name] * frameW;
            layerB.style.transform = k >= 1 ? '' : `translate3d(${bx}px, 0, 0)`;
          }
        });

        if (t >= 1 && k >= 1) {
          A.classList.remove('is-active');
          A.style.display = 'none';
          A.style.zIndex = '0';
          A.setAttribute('aria-hidden', 'true');
          clearSlideTransforms(fromIndex);

          B.classList.add('is-active');
          B.style.zIndex = '2';
          clearSlideTransforms(targetIndex);

          st.currentIndex = targetIndex;
          st.isTransitioning = false;
          return;
        }

        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    };

    // Initial layout before fonts settle
    updateLayout(true);

    if (!reducedMotionMQ.matches) {
      const initialFrameW = 1440 * st.currentU;
      LAYER_ORDER.forEach((name) => {
        const layer = layerRefs.current[st.currentIndex]?.[name];
        if (layer) {
          layer.style.transform = `translate3d(${PARALLAX_FACTORS[name] * initialFrameW}px, 0, 0)`;
        }
      });
    } else {
      finishRevealInstant();
    }

    function runOpeningSequence() {
      updateLayout(true);
      if (reducedMotionMQ.matches) {
        finishRevealInstant();
        return;
      }
      if (st.revealDone) return;

      const frameW = 1440 * st.currentU;
      const easing = 'cubic-bezier(0.22, 0.8, 0.3, 1)';
      const activeIdx = st.currentIndex;

      LAYER_ORDER.forEach((name) => {
        const layer = layerRefs.current[activeIdx]?.[name];
        if (!layer) return;
        const startX = PARALLAX_FACTORS[name] * frameW;
        layer.style.transform = `translate3d(${startX}px, 0, 0)`;
        const anim = layer.animate(
          [
            { transform: `translate3d(${startX}px, 0, 0)` },
            { transform: 'translate3d(0px, 0, 0)' },
          ],
          { duration: 900, delay: 0, easing, fill: 'both' }
        );
        anim.onfinish = () => {
          layer.style.transform = '';
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
        st.openingAnims.push(anim);
      });

      const delays = [250, 330, 410, 490, 570, 650];
      revealRefs.current.forEach((el, idx) => {
        if (!el) return;
        const anim = el.animate(
          [
            { opacity: 0, translate: '0 14px' },
            { opacity: 1, translate: '0 0' },
          ],
          { duration: 1000, delay: delays[idx] ?? 250, easing, fill: 'both' }
        );
        anim.onfinish = () => {
          el.classList.remove('blendy-ui-hidden');
          el.style.opacity = '';
          el.style.translate = '';
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
        st.openingAnims.push(anim);
      });
    }

    const failsafeTimer = window.setTimeout(() => {
      cancelOpeningAnimations();
    }, 3000);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        runOpeningSequence();
      });
    } else {
      runOpeningSequence();
    }

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        st.lastInteraction = Date.now();
        goToRef.current((st.currentIndex - 1 + FLAVORS.length) % FLAVORS.length, -1);
      } else if (e.key === 'ArrowRight') {
        st.lastInteraction = Date.now();
        goToRef.current((st.currentIndex + 1) % FLAVORS.length, 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Swipe / pointer controls
    let swipeActive = false;
    let swipeStartX = 0;
    let swipeStartY = 0;

    const stageEl = stageRef.current;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      swipeActive = true;
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!swipeActive) return;
      swipeActive = false;
      const dx = e.clientX - swipeStartX;
      const dy = e.clientY - swipeStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        st.lastInteraction = Date.now();
        if (dx < 0) {
          goToRef.current((st.currentIndex + 1) % FLAVORS.length, 1);
        } else {
          goToRef.current((st.currentIndex - 1 + FLAVORS.length) % FLAVORS.length, -1);
        }
      }
    };
    const onPointerCancel = () => {
      swipeActive = false;
    };

    stageEl?.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    const onResize = () => updateLayout(true);
    window.addEventListener('resize', onResize);

    const autoplayTimer = window.setInterval(() => {
      if (document.hidden || st.isTransitioning) return;
      if (window.scrollY > window.innerHeight * 0.5) return;
      if (Date.now() - st.lastInteraction < 6000) return;
      goToRef.current((st.currentIndex + 1) % FLAVORS.length, 1);
    }, 2600);

    return () => {
      window.clearTimeout(failsafeTimer);
      window.clearInterval(autoplayTimer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      stageEl?.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.documentElement.classList.remove('is-hero-mobile');
    };
  }, [setActiveFlavor]);

  // Sync external flavour change (e.g. if user selects flavour elsewhere and returns to top)
  useEffect(() => {
    const idx = FLAVORS.findIndex((f) => f.id === activeFlavor);
    if (idx !== -1 && idx !== stateRef.current.currentIndex && !stateRef.current.isTransitioning) {
      const dir: 1 | -1 = idx > stateRef.current.currentIndex ? 1 : -1;
      goToRef.current(idx, dir);
    }
  }, [activeFlavor]);

  const handleTabClick = (idx: number) => {
    stateRef.current.lastInteraction = Date.now();
    const cur = stateRef.current.currentIndex;
    if (idx === cur) return;
    goToRef.current(idx, idx > cur ? 1 : -1);
  };

  const handlePrev = () => {
    stateRef.current.lastInteraction = Date.now();
    const cur = stateRef.current.currentIndex;
    goToRef.current((cur - 1 + FLAVORS.length) % FLAVORS.length, -1);
  };

  const handleNext = () => {
    stateRef.current.lastInteraction = Date.now();
    const cur = stateRef.current.currentIndex;
    goToRef.current((cur + 1) % FLAVORS.length, 1);
  };

  return (
    <section
      ref={heroRef}
      className="blendy-hero"
      aria-roledescription="carousel"
      aria-label="Blendy smoothie flavours"
      style={{ backgroundColor: FLAVOR_MAP[activeFlavor].bg }}
    >
      <div className="blendy-stage" ref={stageRef}>
        {FLAVORS.map((flavour, sIdx) => {
          const isInitialActive = sIdx === stateRef.current.currentIndex;
          const bottleBox = flavour.items[0];
          const bottleScale = flavour.bottle.w / bottleBox[2];
          const bottleSheetSize = (2048 * bottleScale).toFixed(4);
          const bottleH = (bottleBox[3] * bottleScale).toFixed(4);

          return (
            <div
              key={flavour.id}
              ref={(el) => {
                slideRefs.current[sIdx] = el;
              }}
              className={`blendy-slide${isInitialActive ? ' is-active' : ''}`}
              style={{ backgroundColor: flavour.bg }}
              aria-label={`${flavour.name} smoothie`}
              aria-hidden={isInitialActive ? 'false' : 'true'}
            >
              <div className="blendy-frame">
                {/* 1. Word layer */}
                <div
                  className="blendy-layer blendy-layer-word"
                  ref={(el) => {
                    layerRefs.current[sIdx].word = el;
                  }}
                >
                  <div
                    className="blendy-word"
                    ref={(el) => {
                      wordRefs.current[sIdx] = el;
                    }}
                  >
                    {flavour.name}
                  </div>
                </div>

                {/* 2. Shadow layer */}
                <div
                  className="blendy-layer blendy-layer-shadow"
                  ref={(el) => {
                    layerRefs.current[sIdx].shadow = el;
                  }}
                >
                  {FLOOR_SHADOWS.map((sh, i) => (
                    <div
                      key={i}
                      className="blendy-floor-shadow"
                      style={{
                        left: `calc(${sh.cx - sh.w / 2} * var(--u))`,
                        top: `calc(${sh.cy - sh.h / 2} * var(--u))`,
                        width: `calc(${sh.w} * var(--u))`,
                        height: `calc(${sh.h} * var(--u))`,
                      }}
                    />
                  ))}
                </div>

                {/* 3. Bottle layer */}
                <div
                  className="blendy-layer blendy-layer-bottle"
                  ref={(el) => {
                    layerRefs.current[sIdx].bottle = el;
                  }}
                >
                  <div
                    className="blendy-crop-item"
                    style={{
                      left: `calc(${flavour.bottle.x} * var(--u))`,
                      top: `calc(${flavour.bottle.y} * var(--u))`,
                      width: `calc(${flavour.bottle.w} * var(--u))`,
                      height: `calc(${bottleH} * var(--u))`,
                      backgroundImage: `url("${flavour.sheet}")`,
                      backgroundSize: `calc(${bottleSheetSize} * var(--u)) calc(${bottleSheetSize} * var(--u))`,
                      backgroundPosition: `calc(${(-bottleBox[0] * bottleScale).toFixed(
                        4
                      )} * var(--u)) calc(${(-bottleBox[1] * bottleScale).toFixed(4)} * var(--u))`,
                    }}
                  />
                </div>

                {/* 4. Fruit layer */}
                <div
                  className="blendy-layer blendy-layer-fruit"
                  ref={(el) => {
                    layerRefs.current[sIdx].fruit = el;
                  }}
                >
                  {flavour.pieces
                    .filter((p) => p.layer === 'fruit')
                    .map((piece, pIdx) => {
                      const box = flavour.items[piece.item];
                      const s = piece.w / box[2];
                      const sheetSize = (2048 * s).toFixed(4);
                      const h = (box[3] * s).toFixed(4);
                      const timing = stateRef.current.bobTimings[sIdx][pIdx];
                      return (
                        <div
                          key={pIdx}
                          className={`blendy-piece-outer${piece.mirror ? ' is-mirrored' : ''}`}
                          style={{
                            left: `calc(${piece.x} * var(--u))`,
                            top: `calc(${piece.y} * var(--u))`,
                            width: `calc(${piece.w} * var(--u))`,
                            height: `calc(${h} * var(--u))`,
                          }}
                        >
                          <div
                            className="blendy-piece-inner"
                            style={
                              {
                                backgroundImage: `url("${flavour.sheet}")`,
                                backgroundSize: `calc(${sheetSize} * var(--u)) calc(${sheetSize} * var(--u))`,
                                backgroundPosition: `calc(${(-box[0] * s).toFixed(
                                  4
                                )} * var(--u)) calc(${(-box[1] * s).toFixed(4)} * var(--u))`,
                                '--rot': `${piece.rot}deg`,
                                '--bob-dur': `${timing.dur}s`,
                                '--bob-delay': `${timing.delay}s`,
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      );
                    })}
                </div>

                {/* 5. Corner layer */}
                <div
                  className="blendy-layer blendy-layer-corner"
                  ref={(el) => {
                    layerRefs.current[sIdx].corner = el;
                  }}
                >
                  {flavour.pieces
                    .filter((p) => p.layer === 'corner')
                    .map((piece, pIdx) => {
                      const box = flavour.items[piece.item];
                      const s = piece.w / box[2];
                      const sheetSize = (2048 * s).toFixed(4);
                      const h = (box[3] * s).toFixed(4);
                      const timing = stateRef.current.bobTimings[sIdx][5 + pIdx];
                      return (
                        <div
                          key={pIdx}
                          className={`blendy-piece-outer${piece.mirror ? ' is-mirrored' : ''}`}
                          style={{
                            left: `calc(${piece.x} * var(--u))`,
                            top: `calc(${piece.y} * var(--u))`,
                            width: `calc(${piece.w} * var(--u))`,
                            height: `calc(${h} * var(--u))`,
                          }}
                        >
                          <div
                            className="blendy-piece-inner"
                            style={
                              {
                                backgroundImage: `url("${flavour.sheet}")`,
                                backgroundSize: `calc(${sheetSize} * var(--u)) calc(${sheetSize} * var(--u))`,
                                backgroundPosition: `calc(${(-box[0] * s).toFixed(
                                  4
                                )} * var(--u)) calc(${(-box[1] * s).toFixed(4)} * var(--u))`,
                                '--rot': `${piece.rot}deg`,
                                '--bob-dur': `${timing.dur}s`,
                                '--bob-delay': `${timing.delay}s`,
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Hero Overlay Controls */}
      <div className="blendy-hero-ui">
        <header className="blendy-hero-header">
          <a
            href="#top"
            ref={(el) => {
              revealRefs.current[0] = el;
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="blendy-hero-logo blendy-ui-hidden"
          >
            Blendy
          </a>

          <nav
            ref={(el) => {
              revealRefs.current[1] = el;
            }}
            className="blendy-hero-tabs blendy-ui-hidden"
            aria-label="Smoothie flavours"
          >
            {FLAVORS.map((flavour, idx) => (
              <button
                key={flavour.id}
                type="button"
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                onClick={() => handleTabClick(idx)}
                className="blendy-hero-tab"
                aria-current={idx === stateRef.current.currentIndex ? 'true' : 'false'}
              >
                {flavour.name}
              </button>
            ))}
            <span ref={underlineRef} className="blendy-tab-underline no-transition" aria-hidden="true" />
          </nav>

          <div
            ref={(el) => {
              revealRefs.current[2] = el;
            }}
            className="blendy-hero-account blendy-ui-hidden"
          >
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="hidden lg:inline-block bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Shop
            </button>
            <span className="hidden lg:inline-block opacity-75" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={() => navigate('/story')}
              className="hidden lg:inline-block bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Story
            </button>
            <span className="hidden lg:inline-block opacity-75" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity tabular-nums"
            >
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
            <span className="opacity-90" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Register
            </button>
          </div>
        </header>

        <button
          type="button"
          ref={(el) => {
            revealRefs.current[3] = el;
          }}
          onClick={handlePrev}
          className="blendy-hero-arrow blendy-hero-arrow-prev blendy-ui-hidden"
          aria-label="Previous flavour"
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M24 14H4 M12 6l-8 8 8 8" />
          </svg>
        </button>

        <button
          type="button"
          ref={(el) => {
            revealRefs.current[4] = el;
          }}
          onClick={() => navigate(`/product/${activeFlavor}`, activeFlavor)}
          className="blendy-hero-shop blendy-ui-hidden bg-transparent border-0 cursor-pointer hover:opacity-85 transition-opacity"
        >
          SHOP NOW
        </button>

        <button
          type="button"
          ref={(el) => {
            revealRefs.current[5] = el;
          }}
          onClick={handleNext}
          className="blendy-hero-arrow blendy-hero-arrow-next blendy-ui-hidden"
          aria-label="Next flavour"
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 14h20 M16 6l8 8-8 8" />
          </svg>
        </button>
      </div>
    </section>
  );
};
