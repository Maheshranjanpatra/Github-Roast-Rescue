import { useEffect, useRef } from 'react';

export default function InteractiveGridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const PI = Math.PI;

    // GitHub Roast & Rescue palette
    const BG = '#090a0c';
    const GRID = '#d9fff2';
    const GLOW = '#34d399';
    const RIPPLE = '#fb923c';

    const SP_DESKTOP = 30;
    const BASE_A = 0.055;
    const L_BASE = 1.8;
    const L_MAX = 7.5;
    const ROT_K = 5.5;

    const INFL = 165;
    const INFL2 = INFL * INFL;

    const PULSE_SPD = 620;
    const PULSE_BAND = 100;
    const PULSE_LIFE = 1.05;

    const NB = 14;

    let W = 1;
    let H = 1;
    let DPR = 1;

    let sp = SP_DESKTOP;
    let cols = 0;
    let rows = 0;
    let count = 0;

    let ox = 0;
    let oy = 0;

    let px = null;
    let py = null;
    let ang = null;

    const buckets = Array.from(
      { length: NB },
      () => []
    );

    const pulses = [];

    const mouse = {
      x: -100000,
      y: -100000,
      tx: -100000,
      ty: -100000,
      active: false
    };

    let animationFrame = null;
    let last = performance.now();

    function buildGrid() {
      sp =
        W < 420
          ? 22
          : W < 768
            ? 26
            : SP_DESKTOP;

      cols = Math.ceil(W / sp) + 1;
      rows = Math.ceil(H / sp) + 1;
      count = cols * rows;

      ox = (W - (cols - 1) * sp) / 2;
      oy = (H - (rows - 1) * sp) / 2;

      px = new Float32Array(count);
      py = new Float32Array(count);
      ang = new Float32Array(count);

      for (let r = 0; r < rows; r++) {
        const y = oy + r * sp;

        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;

          px[i] = ox + c * sp;
          py[i] = y;
          ang[i] = 0;
        }
      }
    }

    function resize() {
      DPR = Math.min(
        window.devicePixelRatio || 1,
        1.75
      );

      W = window.innerWidth;
      H = window.innerHeight;

      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);

      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
      );

      buildGrid();
    }

    function calculateInfluence(
      x,
      y,
      mx,
      my,
      active
    ) {
      let influence = 0;

      // Cursor influence
      if (active) {
        const dx = x - mx;
        const dy = y - my;
        const distanceSquared =
          dx * dx + dy * dy;

        if (distanceSquared < INFL2) {
          const distance =
            Math.sqrt(distanceSquared);

          const t =
            1 - distance / INFL;

          // Smoothstep
          const smooth =
            t * t * (3 - 2 * t);

          influence = smooth;
        }
      }

      // Ripple influence
      for (let i = 0; i < pulses.length; i++) {
        const pulse = pulses[i];

        const dx = x - pulse.x;
        const dy = y - pulse.y;

        const distance =
          Math.sqrt(dx * dx + dy * dy);

        const radius =
          pulse.t * PULSE_SPD;

        const difference =
          Math.abs(distance - radius);

        if (difference < PULSE_BAND) {
          const t =
            1 - difference / PULSE_BAND;

          const strength =
            t *
            (1 - pulse.t / PULSE_LIFE) *
            0.9;

          if (strength > influence) {
            influence = strength;
          }
        }
      }

      return influence;
    }

    function update(dt) {
      // Smooth cursor movement
      const cursorEase =
        1 - Math.exp(-dt * 16);

      mouse.x +=
        (mouse.tx - mouse.x) *
        cursorEase;

      mouse.y +=
        (mouse.ty - mouse.y) *
        cursorEase;

      // Update ripples
      for (
        let i = pulses.length - 1;
        i >= 0;
        i--
      ) {
        pulses[i].t += dt;

        if (
          pulses[i].t >
          PULSE_LIFE
        ) {
          pulses.splice(i, 1);
        }
      }

      const rotationEase =
        1 - Math.exp(-dt * ROT_K);

      if (mouse.active) {
        for (let i = 0; i < count; i++) {
          const target =
            Math.atan2(
              mouse.y - py[i],
              mouse.x - px[i]
            );

          let difference =
            target - ang[i];

          difference =
            ((difference + PI) %
              TAU +
              TAU) %
              TAU -
            PI;

          ang[i] +=
            difference *
            rotationEase;
        }
      } else {
        // Return to horizontal
        for (let i = 0; i < count; i++) {
          let difference =
            -ang[i];

          difference =
            ((difference + PI) %
              TAU +
              TAU) %
              TAU -
            PI;

          ang[i] +=
            difference *
            rotationEase *
            0.55;
        }
      }
    }

    function render() {
      // Base
      ctx.fillStyle = BG;
      ctx.fillRect(
        0,
        0,
        W,
        H
      );

      const active =
        mouse.active;

      const mx = mouse.x;
      const my = mouse.y;

      // Very subtle emerald cursor glow
      if (active) {
        const radius = 290;

        const gradient =
          ctx.createRadialGradient(
            mx,
            my,
            0,
            mx,
            my,
            radius
          );

        gradient.addColorStop(
          0,
          'rgba(52, 211, 153, 0.085)'
        );

        gradient.addColorStop(
          0.42,
          'rgba(52, 211, 153, 0.035)'
        );

        gradient.addColorStop(
          1,
          'rgba(0, 0, 0, 0)'
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
          mx - radius,
          my - radius,
          radius * 2,
          radius * 2
        );
      }

      // Clear buckets
      for (let i = 0; i < NB; i++) {
        buckets[i].length = 0;
      }

      // Calculate dash positions
      for (let i = 0; i < count; i++) {
        const x = px[i];
        const y = py[i];

        const influence =
          calculateInfluence(
            x,
            y,
            mx,
            my,
            active
          );

        const alpha =
          BASE_A +
          influence * 0.82;

        const length =
          L_BASE +
          influence *
            (L_MAX - L_BASE);

        let bucket =
          (alpha * NB) | 0;

        if (bucket < 0) {
          bucket = 0;
        }

        if (bucket >= NB) {
          bucket = NB - 1;
        }

        const half =
          length * 0.5;

        buckets[bucket].push(
          x,
          y,
          Math.cos(ang[i]) * half,
          Math.sin(ang[i]) * half,
          influence
        );
      }

      ctx.lineCap = 'round';

      // Draw grid dashes
      for (
        let bucket = 0;
        bucket < NB;
        bucket++
      ) {
        const items =
          buckets[bucket];

        if (!items.length) {
          continue;
        }

        const t =
          (bucket + 0.5) / NB;

        ctx.lineWidth =
          0.7 + t * 1.15;

        ctx.strokeStyle =
          GRID;

        ctx.globalAlpha =
          t * 0.78;

        ctx.beginPath();

        for (
          let i = 0;
          i < items.length;
          i += 5
        ) {
          const x = items[i];
          const y = items[i + 1];
          const dx = items[i + 2];
          const dy = items[i + 3];

          ctx.moveTo(
            x - dx,
            y - dy
          );

          ctx.lineTo(
            x + dx,
            y + dy
          );
        }

        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Ripple rings
      if (pulses.length) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = RIPPLE;

        for (
          let i = 0;
          i < pulses.length;
          i++
        ) {
          const pulse =
            pulses[i];

          const life =
            Math.max(
              0,
              1 -
                pulse.t /
                  PULSE_LIFE
            );

          ctx.globalAlpha =
            life *
            life *
            0.22;

          ctx.beginPath();

          ctx.arc(
            pulse.x,
            pulse.y,
            pulse.t *
              PULSE_SPD,
            0,
            TAU
          );

          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      ctx.lineCap = 'butt';
    }

    function frame(now) {
      const dt = Math.min(
        (now - last) / 1000,
        1 / 30
      );

      last = now;

      update(dt);
      render();

      animationFrame =
        requestAnimationFrame(frame);
    }

    function handlePointerMove(event) {
      if (!mouse.active) {
        mouse.x =
          event.clientX;

        mouse.y =
          event.clientY;
      }

      mouse.tx =
        event.clientX;

      mouse.ty =
        event.clientY;

      mouse.active = true;
    }

    function handlePointerDown(event) {
      mouse.x =
        mouse.tx =
          event.clientX;

      mouse.y =
        mouse.ty =
          event.clientY;

      mouse.active = true;

      pulses.push({
        x: event.clientX,
        y: event.clientY,
        t: 0
      });

      // Keep the effect lightweight
      if (pulses.length > 4) {
        pulses.shift();
      }
    }

    function handlePointerLeave() {
      mouse.active = false;

      mouse.x =
        mouse.tx =
          -100000;

      mouse.y =
        mouse.ty =
          -100000;
    }

    window.addEventListener(
      'resize',
      resize,
      { passive: true }
    );

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      'pointerdown',
      handlePointerDown,
      { passive: true }
    );

    document.addEventListener(
      'mouseleave',
      handlePointerLeave
    );

    resize();

    last =
      performance.now();

    animationFrame =
      requestAnimationFrame(frame);

    return () => {
      window.removeEventListener(
        'resize',
        resize
      );

      window.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      window.removeEventListener(
        'pointerdown',
        handlePointerDown
      );

      document.removeEventListener(
        'mouseleave',
        handlePointerLeave
      );

      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="interactive-grid-background"
    />
  );
}
