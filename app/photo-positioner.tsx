"use client";
import { useEffect, useRef, useState } from "react";
import type { Canvas, FabricImage, filters } from "fabric";
import {
  cornerRadius,
  drawNameInBox,
  type NameBox,
  type PhotoFrame,
} from "./pass-layout";

type Filter = "none" | "bw" | "warm" | "cool" | "vivid" | "fade" | "sepia";
type Adjust = {
  zoom: number;
  rotation: number;
  flip: boolean;
  filter: Filter;
  brightness: number;
  contrast: number;
  saturation: number;
};

const DEFAULTS: Adjust = {
  zoom: 1,
  rotation: 0,
  flip: false,
  filter: "none",
  brightness: 0,
  contrast: 0,
  saturation: 0,
};

const FILTERS: { id: Filter; label: string; css: string }[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1)" },
  { id: "warm", label: "Warm", css: "sepia(0.25) saturate(1.2)" },
  { id: "cool", label: "Cool", css: "hue-rotate(-12deg) saturate(1.1)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.45) contrast(1.1)" },
  { id: "fade", label: "Fade", css: "contrast(0.85) brightness(1.08)" },
  { id: "sepia", label: "Sepia", css: "sepia(0.85)" },
];

// Long edge the uploaded photo is downscaled to before editing — plenty for
// the exported pass, and keeps filters smooth on phones.
const MAX_PHOTO_EDGE = 1600;
const MAX_ZOOM = 4;

// Interactive drag/zoom/rotate/filter step used before a registrant's pass is
// finalized. The event/ticket's own template and pass layout (set visually
// in /admin) drive this — no per-event code changes needed. The photo always fully covers the frame: zoom never goes below a
// cover fit and dragging is clamped, at any rotation.
export default function PhotoPositioner({
  templateSrc,
  photoUrl,
  canvasWidth,
  canvasHeight,
  frame,
  name,
  nameBox,
  onConfirm,
  onError,
}: {
  templateSrc: string;
  photoUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  frame: PhotoFrame;
  // The attendee's name and the layout's name box, both in canvas pixels.
  // Shown as a fixed preview only: the final pass draws it the same way.
  name?: string;
  nameBox?: NameBox | null;
  onConfirm: (dataUrl: string) => void;
  onError: (message: string) => void;
}) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<{
    fabric: typeof import("fabric");
    canvas: Canvas;
  } | null>(null);
  const photoRef = useRef<FabricImage | null>(null);
  const ghostRef = useRef<FabricImage | null>(null);
  const nameRef = useRef<FabricImage | null>(null);
  const frameRef = useRef({ cx: 0, cy: 0, w: 1, h: 1 });
  const editSizeRef = useRef({ w: canvasWidth, h: canvasHeight, scale: 1 });
  const adjustRef = useRef<Adjust>(DEFAULTS);
  const filterFrameRef = useRef(0);
  const [adjust, setAdjust] = useState<Adjust>(DEFAULTS);
  const [thumb, setThumb] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Smallest scale at which the photo, rotated by `deg`, still covers the
  // whole frame: the frame's bounding box in the photo's own rotated space.
  function coverScale(deg: number) {
    const img = photoRef.current!;
    const { w, h } = frameRef.current;
    const rad = (deg * Math.PI) / 180;
    const c = Math.abs(Math.cos(rad)),
      sn = Math.abs(Math.sin(rad));
    return Math.max(
      (w * c + h * sn) / (img.width || 1),
      (w * sn + h * c) / (img.height || 1),
    );
  }

  // Keep the photo's centre where the frame stays fully covered. Works in the
  // photo's rotated coordinate space so it holds at any angle.
  function clamp(left: number, top: number) {
    const img = photoRef.current!;
    const { cx, cy, w, h } = frameRef.current;
    const rad = ((img.angle || 0) * Math.PI) / 180;
    const cos = Math.cos(rad),
      sin = Math.sin(rad);
    const c = Math.abs(cos),
      sn = Math.abs(sin);
    const maxX = Math.max(0, (img.width * img.scaleX - (w * c + h * sn)) / 2);
    const maxY = Math.max(0, (img.height * img.scaleY - (w * sn + h * c)) / 2);
    const dx = left - cx,
      dy = top - cy;
    const lx = Math.min(maxX, Math.max(-maxX, dx * cos + dy * sin));
    const ly = Math.min(maxY, Math.max(-maxY, -dx * sin + dy * cos));
    return { left: cx + lx * cos - ly * sin, top: cy + lx * sin + ly * cos };
  }

  function syncGhost() {
    const img = photoRef.current,
      ghost = ghostRef.current;
    if (!img || !ghost) return;
    ghost.set({
      left: img.left,
      top: img.top,
      angle: img.angle,
      scaleX: img.scaleX,
      scaleY: img.scaleY,
      flipX: img.flipX,
    });
  }

  function applyTransform(next: Adjust) {
    const img = photoRef.current;
    if (!img) return;
    const scale = coverScale(next.rotation) * next.zoom;
    img.set({
      angle: next.rotation,
      scaleX: scale,
      scaleY: scale,
      flipX: next.flip,
    });
    img.set(clamp(img.left, img.top));
    img.setCoords();
    syncGhost();
    fabricRef.current!.canvas.requestRenderAll();
  }

  // Filters are batched to one run per frame while a slider is dragged.
  function applyFilters() {
    cancelAnimationFrame(filterFrameRef.current);
    filterFrameRef.current = requestAnimationFrame(runFilters);
  }

  function runFilters() {
    filterFrameRef.current = 0;
    const img = photoRef.current;
    if (!img) return;
    const next = adjustRef.current;
    const { fabric, canvas } = fabricRef.current!;
    const F = fabric.filters;
    const list: filters.BaseFilter<string>[] = [];
    if (next.filter === "bw") list.push(new F.Grayscale());
    if (next.filter === "sepia") list.push(new F.Sepia());
    if (next.filter === "warm")
      list.push(
        new F.ColorMatrix({
          matrix: [
            1.1, 0, 0, 0, 0.03, 0, 1.02, 0, 0, 0.01, 0, 0, 0.88, 0, 0, 0, 0, 0,
            1, 0,
          ],
        }),
      );
    if (next.filter === "cool")
      list.push(
        new F.ColorMatrix({
          matrix: [
            0.9, 0, 0, 0, 0, 0, 1.0, 0, 0, 0.01, 0, 0, 1.12, 0, 0.03, 0, 0, 0,
            1, 0,
          ],
        }),
      );
    if (next.filter === "vivid")
      list.push(
        new F.Saturation({ saturation: 0.35 }),
        new F.Contrast({ contrast: 0.08 }),
      );
    if (next.filter === "fade")
      list.push(
        new F.Contrast({ contrast: -0.15 }),
        new F.Brightness({ brightness: 0.05 }),
        new F.Saturation({ saturation: -0.2 }),
      );
    if (next.brightness)
      list.push(new F.Brightness({ brightness: next.brightness }));
    if (next.contrast) list.push(new F.Contrast({ contrast: next.contrast }));
    if (next.saturation)
      list.push(new F.Saturation({ saturation: next.saturation }));
    img.filters = list;
    img.applyFilters();
    canvas.requestRenderAll();
  }

  function update(patch: Partial<Adjust>) {
    const next = { ...adjustRef.current, ...patch };
    const prev = adjustRef.current;
    adjustRef.current = next;
    setAdjust(next);
    if (
      next.zoom !== prev.zoom ||
      next.rotation !== prev.rotation ||
      next.flip !== prev.flip
    )
      applyTransform(next);
    if (
      next.filter !== prev.filter ||
      next.brightness !== prev.brightness ||
      next.contrast !== prev.contrast ||
      next.saturation !== prev.saturation
    )
      applyFilters();
  }

  // Normalise any angle into -180..180 so the fine-rotation slider stays in
  // range after the 90° buttons.
  function rotateBy(deg: number) {
    let r = (adjustRef.current.rotation + deg) % 360;
    if (r > 180) r -= 360;
    if (r < -180) r += 360;
    update({ rotation: r });
  }

  function reset() {
    adjustRef.current = DEFAULTS;
    setAdjust(DEFAULTS);
    const img = photoRef.current;
    if (!img) return;
    const { cx, cy } = frameRef.current;
    img.set({ angle: 0, flipX: false });
    const scale = coverScale(0);
    // Anchored to the frame's top edge so a crop (if any) trims the bottom,
    // never the top — a face is never cut off.
    img.set({ scaleX: scale, scaleY: scale });
    img.set(clamp(cx, cy + 1e6));
    img.setCoords();
    syncGhost();
    applyFilters();
  }

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const fabric = await import("fabric");
        if (disposed || !canvasElRef.current) return;
        const maxEdge = Math.max(
          280,
          Math.min(480, (window.innerWidth || 480) - 64),
        );
        const scale = maxEdge / Math.max(canvasWidth, canvasHeight);
        const editW = Math.round(canvasWidth * scale);
        const editH = Math.round(canvasHeight * scale);
        editSizeRef.current = { w: editW, h: editH, scale };
        const canvas = new fabric.Canvas(canvasElRef.current, {
          width: editW,
          height: editH,
          selection: false,
          backgroundColor: "#10170e",
          preserveObjectStacking: true,
        });
        fabricRef.current = { fabric, canvas };
        if (templateSrc) {
          const template = await fabric.FabricImage.fromURL(templateSrc, {
            crossOrigin: "anonymous",
          });
          template.set({
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
            scaleX: editW / (template.width || editW),
            scaleY: editH / (template.height || editH),
          });
          canvas.add(template);
        }

        // Downscale very large phone photos once up front.
        const source = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const el = new Image();
            el.crossOrigin = "anonymous";
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = photoUrl;
          },
        );
        const ratio = Math.min(
          1,
          MAX_PHOTO_EDGE / Math.max(source.naturalWidth, source.naturalHeight),
        );
        const work = document.createElement("canvas");
        work.width = Math.max(1, Math.round(source.naturalWidth * ratio));
        work.height = Math.max(1, Math.round(source.naturalHeight * ratio));
        work.getContext("2d")!.drawImage(source, 0, 0, work.width, work.height);
        if (disposed) return;
        const t = document.createElement("canvas");
        const tr = 96 / Math.max(work.width, work.height);
        t.width = Math.round(work.width * tr);
        t.height = Math.round(work.height * tr);
        t.getContext("2d")!.drawImage(work, 0, 0, t.width, t.height);
        setThumb(t.toDataURL("image/jpeg", 0.8));

        const fx = frame.x * scale,
          fy = frame.y * scale,
          fw = frame.w * scale,
          fh = frame.h * scale;
        frameRef.current = { cx: fx + fw / 2, cy: fy + fh / 2, w: fw, h: fh };
        const radius = cornerRadius({ x: fx, y: fy, w: fw, h: fh });
        const clip =
          frame.shape === "circle"
            ? new fabric.Ellipse({
                left: fx + fw / 2,
                top: fy + fh / 2,
                rx: fw / 2,
                ry: fh / 2,
                originX: "center",
                originY: "center",
                absolutePositioned: true,
              })
            : new fabric.Rect({
                left: fx,
                top: fy,
                width: fw,
                height: fh,
                rx: radius,
                ry: radius,
                originX: "left",
                originY: "top",
                absolutePositioned: true,
              });

        // Faint copy of the whole photo, shown only while dragging, so the
        // visitor can see what lies outside the frame as they move it.
        const ghost = new fabric.FabricImage(work, {
          originX: "center",
          originY: "center",
          opacity: 0.35,
          selectable: false,
          evented: false,
          visible: false,
        });
        const photo = new fabric.FabricImage(work, {
          originX: "center",
          originY: "center",
          clipPath: clip,
          selectable: false,
          evented: false,
        });
        // Fabric hit-tests an image by its full, unclipped bounds, so the
        // photo itself isn't draggable; this invisible handle covering just
        // the frame is, and moves the photo by however far it's dragged.
        const handle = new fabric.Rect({
          left: fx,
          top: fy,
          width: fw,
          height: fh,
          originX: "left",
          originY: "top",
          fill: "rgba(0,0,0,0)",
          strokeWidth: 0,
          hasControls: false,
          hasBorders: false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hoverCursor: "grab",
          moveCursor: "grabbing",
        });
        let dragStart = { left: 0, top: 0 };
        canvas.add(ghost);
        canvas.add(photo);
        canvas.add(handle);
        photoRef.current = photo;
        ghostRef.current = ghost;
        reset();

        if (name && nameBox) {
          // Fixed preview of the name in the layout's box, drawn exactly as
          // the final pass draws it. Not part of the export: the pass adds it.
          const layer = document.createElement("canvas");
          layer.width = editW;
          layer.height = editH;
          drawNameInBox(layer.getContext("2d")!, name, {
            ...nameBox,
            x: nameBox.x * scale,
            y: nameBox.y * scale,
            w: nameBox.w * scale,
            h: nameBox.h * scale,
          });
          const text = new fabric.FabricImage(layer, {
            left: 0,
            top: 0,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });
          canvas.add(text);
          nameRef.current = text;
        }

        canvas.on("object:moving", (e) => {
          if (e.target !== handle) return;
          photo.set(
            clamp(
              dragStart.left + handle.left - fx,
              dragStart.top + handle.top - fy,
            ),
          );
          handle.set({ left: fx, top: fy });
          handle.setCoords();
          syncGhost();
        });
        canvas.on("mouse:down", (e) => {
          if (e.target !== handle) return;
          dragStart = { left: photo.left, top: photo.top };
          ghost.visible = true;
          canvas.requestRenderAll();
        });
        canvas.on("mouse:up", () => {
          ghost.visible = false;
          canvas.requestRenderAll();
        });
        // Scroll / trackpad pinch to zoom.
        canvas.on("mouse:wheel", (e) => {
          e.e.preventDefault();
          const z = adjustRef.current.zoom * Math.pow(0.999, e.e.deltaY);
          update({ zoom: Math.min(MAX_ZOOM, Math.max(1, z)) });
        });
        canvas.renderAll();
        setReady(true);
      } catch {
        onError("Couldn't load the pass template or photo. Please retry.");
      }
    })();
    return () => {
      disposed = true;
      cancelAnimationFrame(filterFrameRef.current);
      fabricRef.current?.canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSrc, photoUrl]);

  // Two-finger pinch on touch screens.
  useEffect(() => {
    const el = canvasElRef.current?.parentElement;
    if (!el || !ready) return;
    let start = 0,
      startZoom = 1;
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      start = dist(e.touches);
      startZoom = adjustRef.current.zoom;
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !start) return;
      e.preventDefault();
      const z = startZoom * (dist(e.touches) / start);
      update({ zoom: Math.min(MAX_ZOOM, Math.max(1, z)) });
    };
    const onEnd = () => {
      start = 0;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function confirm() {
    setBusy(true);
    try {
      const { canvas } = fabricRef.current!;
      // Apply a filter change still waiting for the next frame, so the
      // export always matches the latest choice.
      if (filterFrameRef.current) {
        cancelAnimationFrame(filterFrameRef.current);
        runFilters();
      }
      ghostRef.current!.visible = false;
      if (nameRef.current) nameRef.current.visible = false;
      canvas.discardActiveObject();
      canvas.renderAll();
      const url = canvas.toDataURL({
        format: "png",
        multiplier: 1 / editSizeRef.current.scale,
      });
      if (nameRef.current) nameRef.current.visible = true;
      onConfirm(url);
    } catch {
      onError("Couldn't finish positioning your photo. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  const slider = (
    label: string,
    key: "zoom" | "rotation" | "brightness" | "contrast" | "saturation",
    min: number,
    max: number,
    step: number,
    format: (v: number) => string,
  ) => (
    <label className="photo-editor-slider">
      <span>
        {label}
        <output>{format(adjust[key])}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={adjust[key]}
        disabled={!ready}
        onChange={(e) => update({ [key]: Number(e.target.value) })}
        onDoubleClick={() => update({ [key]: DEFAULTS[key] })}
      />
    </label>
  );
  const pct = (v: number) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}`;

  return (
    <div className="pass-generator-layout">
      <div className="pass-generator-canvas">
        <canvas ref={canvasElRef} />
        {!ready && <p role="status">Loading…</p>}
      </div>
      <div className="pass-generator-controls">
        <p style={{ fontSize: 13, margin: 0 }}>
          Drag to move. Scroll or pinch to zoom. Your photo always fills the
          frame.
        </p>

        <fieldset className="photo-editor-group">
          <legend>Adjust</legend>
          {slider("Zoom", "zoom", 1, MAX_ZOOM, 0.01, (v) => `${v.toFixed(1)}×`)}
          {slider("Rotate", "rotation", -180, 180, 1, (v) => `${v}°`)}
          <div className="photo-editor-buttons">
            <button
              type="button"
              className="text-button"
              disabled={!ready}
              onClick={() => rotateBy(-90)}
              aria-label="Rotate left 90 degrees"
            >
              ⟲ 90°
            </button>
            <button
              type="button"
              className="text-button"
              disabled={!ready}
              onClick={() => rotateBy(90)}
              aria-label="Rotate right 90 degrees"
            >
              ⟳ 90°
            </button>
            <button
              type="button"
              className="text-button"
              disabled={!ready}
              aria-pressed={adjust.flip}
              onClick={() => update({ flip: !adjust.flip })}
            >
              ⇋ Flip
            </button>
          </div>
        </fieldset>

        <fieldset className="photo-editor-group">
          <legend>Filter</legend>
          <div className="photo-editor-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={!ready}
                aria-pressed={adjust.filter === f.id}
                onClick={() => update({ filter: f.id })}
              >
                <span
                  style={{
                    backgroundImage: thumb ? `url(${thumb})` : undefined,
                    filter: f.css,
                  }}
                />
                {f.label}
              </button>
            ))}
          </div>
          {slider("Brightness", "brightness", -0.4, 0.4, 0.01, pct)}
          {slider("Contrast", "contrast", -0.4, 0.4, 0.01, pct)}
          {slider("Saturation", "saturation", -1, 1, 0.01, pct)}
        </fieldset>

        <div className="row">
          <button
            type="button"
            className="photo-editor-reset"
            disabled={!ready}
            onClick={reset}
          >
            Reset
          </button>
          <button
            className="button"
            disabled={!ready || busy}
            onClick={confirm}
          >
            {busy ? "Preparing…" : "Use This Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
