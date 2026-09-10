/**
 * The date, under a lacquer panel.
 *
 * Ported from the other four sites; only the cover painting differs. Here it
 * is a champagne sunburst on black — rays fanning from the bottom centre,
 * which is the one Deco figure that reads at any aspect ratio, plus the
 * double keyline the rest of the page uses on every frame.
 */
export function initDateScratch(selector = '[data-date-scratch]') {
  document.querySelectorAll(selector).forEach((container) => {
    const stage = container.querySelector('.date-scratch__stage');
    const value = container.querySelector('.date-scratch__value');
    const canvas = container.querySelector('.date-scratch__canvas');
    const hint = container.querySelector('.date-scratch__hint');
    const button = container.querySelector('.date-scratch__button');
    const status = container.querySelector('[data-date-scratch-status]');
    const context = canvas?.getContext('2d');

    // Anything missing and the date is simply shown. An invitation has to
    // fail readable.
    if (!stage || !value || !canvas || !hint || !button || !status || !context) {
      container.classList.add('is-revealed');
      return;
    }

    const storageKey = container.dataset.scratchKey || 'wedding-date-revealed';
    const coverColour = container.dataset.scratchCover || '#0b0c0b';
    const accentColour = container.dataset.scratchAccent || '#c8a35a';
    const gridColumns = 24;
    const gridRows = 8;
    const visitedCells = new Set();
    let drawing = false;
    let revealed = false;
    let lastPoint = null;

    function setLayerVisibility(hidden) {
      canvas.hidden = hidden;
      hint.hidden = hidden;
      button.hidden = hidden;
    }

    function revealDate({ moveFocus = false, remember = true } = {}) {
      if (revealed) return;
      revealed = true;
      drawing = false;
      container.classList.add('is-revealed');
      status.textContent = 'Wedding date revealed: Saturday 17 October 2026, Karachi.';
      if (remember) {
        try {
          window.sessionStorage.setItem(storageKey, 'true');
        } catch {
          // The interaction still works when browser storage is unavailable.
        }
      }

      const finish = () => {
        setLayerVisibility(true);
        if (moveFocus) value.focus({ preventScroll: true });
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
      else window.setTimeout(finish, 520);
    }

    function paintCover() {
      if (revealed) return;
      const bounds = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = coverColour;
      context.fillRect(0, 0, bounds.width, bounds.height);

      // The sunburst. Rays are struck from a point below the panel so the fan
      // opens across the full width rather than converging inside the frame.
      const originX = bounds.width / 2;
      const originY = bounds.height * 1.06;
      const reach = Math.hypot(bounds.width, bounds.height) * 1.2;
      const rays = 17;
      context.strokeStyle = accentColour;
      context.lineWidth = 1;
      for (let i = 0; i < rays; i += 1) {
        // Fanned across the upper half plane, edge to edge.
        const angle = Math.PI + (Math.PI * (i + 0.5)) / rays;
        context.globalAlpha = i % 2 === 0 ? 0.42 : 0.2;
        context.beginPath();
        context.moveTo(originX, originY);
        context.lineTo(originX + Math.cos(angle) * reach, originY + Math.sin(angle) * reach);
        context.stroke();
      }

      // Three concentric arcs, the stepped band Deco puts under every fan.
      context.globalAlpha = 0.32;
      for (let band = 1; band <= 3; band += 1) {
        context.beginPath();
        context.arc(originX, originY, bounds.height * (0.34 + band * 0.24), Math.PI, 0);
        context.stroke();
      }

      context.globalAlpha = 1;
      context.lineWidth = 1.5;
      context.strokeRect(4.5, 4.5, Math.max(0, bounds.width - 9), Math.max(0, bounds.height - 9));
      context.globalAlpha = 0.45;
      context.lineWidth = 1;
      context.strokeRect(10.5, 10.5, Math.max(0, bounds.width - 21), Math.max(0, bounds.height - 21));
      context.globalAlpha = 1;
    }

    function getPoint(event) {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        width: bounds.width,
        height: bounds.height,
      };
    }

    function markVisited(point) {
      const cellX = Math.max(0, Math.min(gridColumns - 1, Math.floor((point.x / point.width) * gridColumns)));
      const cellY = Math.max(0, Math.min(gridRows - 1, Math.floor((point.y / point.height) * gridRows)));
      for (let x = cellX - 2; x <= cellX + 2; x += 1) {
        for (let y = cellY - 1; y <= cellY + 1; y += 1) {
          if (x >= 0 && x < gridColumns && y >= 0 && y < gridRows) visitedCells.add(`${x}:${y}`);
        }
      }
    }

    function scratch(point) {
      const brushSize = Math.max(32, Math.min(point.width, point.height) * 0.42);
      context.globalCompositeOperation = 'destination-out';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = brushSize;
      context.beginPath();
      context.moveTo(lastPoint?.x ?? point.x, lastPoint?.y ?? point.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      markVisited(point);
      lastPoint = point;

      if (visitedCells.size / (gridColumns * gridRows) >= 0.36) revealDate();
    }

    canvas.addEventListener('pointerdown', (event) => {
      if (revealed) return;
      event.preventDefault();
      drawing = true;
      lastPoint = null;
      container.classList.add('is-scratching');
      canvas.setPointerCapture(event.pointerId);
      scratch(getPoint(event));
    });

    canvas.addEventListener('pointermove', (event) => {
      if (!drawing || revealed) return;
      event.preventDefault();
      scratch(getPoint(event));
    });

    function stopDrawing() {
      drawing = false;
      lastPoint = null;
    }

    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);
    button.addEventListener('click', () => revealDate({ moveFocus: true }));

    try {
      if (window.sessionStorage.getItem(storageKey) === 'true') {
        revealDate({ remember: false });
        setLayerVisibility(true);
      } else {
        paintCover();
      }
    } catch {
      paintCover();
    }

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        if (!revealed && !drawing) {
          visitedCells.clear();
          paintCover();
        }
      });
      resizeObserver.observe(stage);
    }
  });
}
