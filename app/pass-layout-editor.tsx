"use client";
import { useEffect, useRef, useState } from "react";
import {
  PHOTO_SHAPES,
  clipToFrame,
  cornerRadius,
  defaultLayout,
  drawNameInBox,
  resolveLayout,
  type LayoutBox,
  type LayoutSource,
  type PassLayout,
  type PhotoShape,
} from "./pass-layout";

type Target = "photo" | "name";
type Corner = "nw" | "ne" | "sw" | "se";
type Drag = {
  target: Target;
  corner?: Corner;
  startX: number;
  startY: number;
  start: LayoutBox;
};

const MIN = 0.03;
const clamp01 = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// A stand-in attendee photo for previews.
function samplePhoto(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 1100;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#9cc7ff");
  g.addColorStop(1, "#dfe6d5");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#e8b48a";
  ctx.beginPath();
  ctx.arc(450, 420, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a4a63";
  ctx.beginPath();
  ctx.ellipse(450, 1100, 380, 360, 0, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

function Handles({
  onStart,
}: {
  onStart: (e: React.PointerEvent, corner: Corner) => void;
}) {
  return (["nw", "ne", "sw", "se"] as Corner[]).map((c) => (
    <span
      key={c}
      className={`pass-layout-handle ${c}`}
      onPointerDown={(e) => onStart(e, c)}
      aria-hidden="true"
    />
  ));
}

// Visual setup of where the attendee's photo and name go on a pass
// template: drag and resize the two boxes directly on the artwork.
export default function PassLayoutEditor({
  templateSrc,
  value,
  onChange,
  legacy,
}: {
  templateSrc: string;
  value?: PassLayout;
  onChange: (layout: PassLayout | undefined) => void;
  // The event's older number-based placement, used as the starting point
  // when an existing event is first given a visual layout.
  legacy?: LayoutSource;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [selected, setSelected] = useState<Target>("photo");
  const [sampleName, setSampleName] = useState("Muhammad Ali Khan");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!templateSrc) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (!cancelled) setError("Couldn't load the pass background.");
    };
    img.src = templateSrc;
    return () => {
      cancelled = true;
    };
  }, [templateSrc]);

  // Template width ÷ height: a box is pixel-square when h = w × aspect.
  const aspect = size ? size.w / size.h : 1;
  const locked = (shape: PhotoShape) => shape !== "rect";

  function start() {
    let layout = defaultLayout(aspect);
    if (size && legacy?.photoX !== undefined) {
      // Carry over the old number-based photo placement (in a canvas whose
      // long side is 1350) so a re-set-up event starts where it was.
      const s = 1350 / Math.max(size.w, size.h);
      const cw = size.w * s,
        ch = size.h * s;
      const { frame } = resolveLayout(legacy, null, cw, ch);
      layout = {
        ...layout,
        photo: {
          x: clamp01(frame.x / cw),
          y: clamp01(frame.y / ch),
          w: clamp01(frame.w / cw, MIN),
          h: clamp01(frame.h / ch, MIN),
          shape: frame.shape,
        },
      };
    }
    onChange(layout);
  }

  function setBox(target: Target, box: LayoutBox) {
    if (!value) return;
    onChange({ ...value, [target]: { ...value[target], ...box } });
  }

  function setShape(shape: PhotoShape) {
    if (!value) return;
    const p = value.photo;
    let { x, y, w, h } = p;
    if (locked(shape)) {
      // Keep the centre and make the frame pixel-square.
      const side = Math.min(w, h / aspect);
      const cx = x + w / 2,
        cy = y + h / 2;
      w = side;
      h = side * aspect;
      x = clamp01(cx - w / 2, 0, 1 - w);
      y = clamp01(cy - h / 2, 0, 1 - h);
    }
    onChange({ ...value, photo: { x, y, w, h, shape } });
  }

  function onPointerDown(
    e: React.PointerEvent,
    target: Target,
    corner?: Corner,
  ) {
    if (!value) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(target);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const b = value[target];
    dragRef.current = {
      target,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      start: { x: b.x, y: b.y, w: b.w, h: b.h },
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    const stage = stageRef.current;
    if (!d || !stage || !value) return;
    const rect = stage.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    const s = d.start;
    if (!d.corner) {
      setBox(d.target, {
        ...s,
        x: clamp01(s.x + dx, 0, 1 - s.w),
        y: clamp01(s.y + dy, 0, 1 - s.h),
      });
      return;
    }
    // Resize from the dragged corner; the opposite corner stays put.
    const west = d.corner.includes("w"),
      north = d.corner.includes("n");
    const right = s.x + s.w,
      bottom = s.y + s.h;
    let w = clamp01(west ? s.w - dx : s.w + dx, MIN, west ? right : 1 - s.x);
    let h = clamp01(north ? s.h - dy : s.h + dy, MIN, north ? bottom : 1 - s.y);
    if (d.target === "photo" && locked(value.photo.shape)) {
      // Square/circle: follow the larger movement, then fit inside.
      const side = Math.max(w, h / aspect);
      const maxW = west ? right : 1 - s.x;
      const maxH = north ? bottom : 1 - s.y;
      w = Math.min(side, maxW, maxH / aspect);
      h = w * aspect;
    }
    setBox(d.target, {
      w,
      h,
      x: west ? right - w : s.x,
      y: north ? bottom - h : s.y,
    });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function renderPreview() {
    if (!value || !size) return;
    setError("");
    try {
      const template = new Image();
      template.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        template.onload = resolve;
        template.onerror = reject;
        template.src = templateSrc;
      });
      const s = 1350 / Math.max(size.w, size.h);
      const c = document.createElement("canvas");
      c.width = Math.round(size.w * s);
      c.height = Math.round(size.h * s);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(template, 0, 0, c.width, c.height);
      const { frame, name } = resolveLayout(
        null,
        { passLayout: value },
        c.width,
        c.height,
      );
      const photo = samplePhoto();
      const scale = Math.max(frame.w / photo.width, frame.h / photo.height);
      ctx.save();
      clipToFrame(ctx, frame);
      ctx.drawImage(
        photo,
        frame.x + (frame.w - photo.width * scale) / 2,
        frame.y,
        photo.width * scale,
        photo.height * scale,
      );
      ctx.restore();
      if (name) drawNameInBox(ctx, sampleName, name);
      setPreview(c.toDataURL("image/png"));
    } catch {
      setError("Couldn't build the preview.");
    }
  }

  if (!templateSrc)
    return (
      <p className="pass-layout-note">
        Upload a pass background first, then place the photo and name on it.
      </p>
    );
  if (!value)
    return (
      <div className="pass-layout-empty">
        <p className="pass-layout-note">
          No visual layout yet — this pass uses the number-based placement
          below.
        </p>
        <button
          type="button"
          className="button"
          disabled={!size}
          onClick={start}
        >
          Set up photo &amp; name boxes
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );

  const box = (b: LayoutBox) => ({
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${b.w * 100}%`,
    height: `${b.h * 100}%`,
  });
  const p = value.photo,
    n = value.name;
  // Match the pass's corner rounding: in units where the template height is
  // 1, the frame is (p.w × aspect) wide and p.h tall.
  const r = cornerRadius({ x: 0, y: 0, w: p.w * aspect, h: p.h });
  const photoRadius =
    p.shape === "circle"
      ? "50%"
      : `${(r / (p.w * aspect)) * 100}% / ${(r / p.h) * 100}%`;
  return (
    <div className="pass-layout-editor">
      <div
        ref={stageRef}
        className="pass-layout-stage"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={templateSrc} alt="Pass background" draggable={false} />
        <div
          className={`pass-layout-box photo${selected === "photo" ? " selected" : ""}`}
          style={{ ...box(p), borderRadius: photoRadius }}
          onPointerDown={(e) => onPointerDown(e, "photo")}
          role="button"
          tabIndex={0}
          aria-label="Photo box — drag to move, drag corners to resize"
        >
          <span className="pass-layout-label">PHOTO</span>
          <Handles onStart={(e, c) => onPointerDown(e, "photo", c)} />
        </div>
        <div
          className={`pass-layout-box name${selected === "name" ? " selected" : ""}`}
          style={box(n)}
          onPointerDown={(e) => onPointerDown(e, "name")}
          role="button"
          tabIndex={0}
          aria-label="Name box — drag to move, drag corners to resize"
        >
          <span
            className="pass-layout-name-sample"
            style={{
              color: n.color,
              fontWeight: n.weight === "bold" ? 700 : 400,
              justifyContent: n.align === "center" ? "center" : "flex-start",
            }}
          >
            NAME
          </span>
          <Handles onStart={(e, c) => onPointerDown(e, "name", c)} />
        </div>
      </div>

      <div className="pass-layout-controls">
        <p className="pass-layout-note">
          Drag each box onto the matching spot on the artwork; drag a corner to
          resize. The attendee&apos;s photo fills the photo box and their name
          is fitted inside the name box.
        </p>
        <label>
          Photo shape
          <select
            value={p.shape}
            onChange={(e) => setShape(e.target.value as PhotoShape)}
          >
            {PHOTO_SHAPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="pass-layout-row">
          <label>
            Name colour
            <input
              type="color"
              value={n.color}
              onChange={(e) =>
                onChange({ ...value, name: { ...n, color: e.target.value } })
              }
            />
          </label>
          <label>
            Alignment
            <select
              value={n.align}
              onChange={(e) =>
                onChange({
                  ...value,
                  name: { ...n, align: e.target.value as "left" | "center" },
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Centre</option>
            </select>
          </label>
          <label>
            Weight
            <select
              value={n.weight}
              onChange={(e) =>
                onChange({
                  ...value,
                  name: { ...n, weight: e.target.value as "bold" | "normal" },
                })
              }
            >
              <option value="bold">Bold</option>
              <option value="normal">Regular</option>
            </select>
          </label>
        </div>
        <label>
          Sample name for preview
          <input
            type="text"
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
          />
        </label>
        <div className="pass-layout-row">
          <button type="button" className="button" onClick={renderPreview}>
            Preview with sample photo
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setPreview("");
              onChange(undefined);
            }}
          >
            Remove layout
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="pass-layout-preview"
            src={preview}
            alt="Pass preview with a sample photo and name"
          />
        )}
      </div>
    </div>
  );
}
