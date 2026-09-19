"use client";
import { useEffect, useRef, useState } from "react";

export type PhotoFrame = {
  x: number;
  y: number;
  size: number;
  shape: "circle" | "square";
};

// Interactive drag/zoom step used before a registrant's pass is finalized.
// The event/ticket's own template and photo-frame settings (already
// configurable in /admin) drive this — no per-event code changes needed.
export default function PhotoPositioner({
  templateSrc,
  photoUrl,
  canvasWidth,
  canvasHeight,
  frame,
  onConfirm,
  onError,
}: {
  templateSrc: string;
  photoUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  frame: PhotoFrame;
  onConfirm: (dataUrl: string) => void;
  onError: (message: string) => void;
}) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const photoRef = useRef<any>(null);
  const baseScaleRef = useRef(1);
  const editSizeRef = useRef({ w: canvasWidth, h: canvasHeight, scale: 1 });
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);

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
        const photo = await fabric.FabricImage.fromURL(photoUrl, {
          crossOrigin: "anonymous",
        });
        const fx = frame.x * scale,
          fy = frame.y * scale,
          fsize = frame.size * scale;
        const clip =
          frame.shape === "circle"
            ? new fabric.Circle({
                left: fx + fsize / 2,
                top: fy + fsize / 2,
                radius: fsize / 2,
                originX: "center",
                originY: "center",
                absolutePositioned: true,
              })
            : new fabric.Rect({
                left: fx,
                top: fy,
                width: fsize,
                height: fsize,
                rx: 8,
                ry: 8,
                originX: "left",
                originY: "top",
                absolutePositioned: true,
              });
        const w = photo.width || 1,
          h = photo.height || 1;
        // Cover-fit the frame, anchored to its top edge so a crop (if any)
        // trims the bottom, never the top — a face is never cut off.
        const photoScale = Math.max(fsize / w, fsize / h);
        baseScaleRef.current = photoScale;
        photo.set({
          originX: "left",
          originY: "top",
          left: fx + (fsize - w * photoScale) / 2,
          top: fy,
          scaleX: photoScale,
          scaleY: photoScale,
          clipPath: clip,
          hasControls: false,
          hasBorders: false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });
        canvas.add(photo);
        canvas.setActiveObject(photo);
        canvas.renderAll();
        photoRef.current = photo;
        setReady(true);
      } catch {
        onError("Couldn't load the pass template or photo. Please retry.");
      }
    })();
    return () => {
      disposed = true;
      fabricRef.current?.canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSrc, photoUrl]);

  function onZoom(value: number) {
    setZoom(value);
    const img = photoRef.current;
    if (!img) return;
    const { canvas } = fabricRef.current;
    const scale = baseScaleRef.current * value;
    const centerX = img.left + (img.getScaledWidth() || 0) / 2;
    const centerY = img.top + (img.getScaledHeight() || 0) / 2;
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: centerX - (img.width * scale) / 2,
      top: centerY - (img.height * scale) / 2,
    });
    canvas.renderAll();
  }

  async function confirm() {
    setBusy(true);
    try {
      const { canvas } = fabricRef.current;
      const url = canvas.toDataURL({
        format: "png",
        multiplier: 1 / editSizeRef.current.scale,
      });
      onConfirm(url);
    } catch {
      onError("Couldn't finish positioning your photo. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pass-generator-layout">
      <div className="pass-generator-canvas">
        <canvas ref={canvasElRef} />
        {!ready && <p role="status">Loading…</p>}
      </div>
      <div className="pass-generator-controls">
        <label>
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoom(Number(e.target.value))}
          />
        </label>
        <p style={{ fontSize: 13 }}>
          Drag your photo inside the frame to reposition it.
        </p>
        <button className="button" disabled={!ready || busy} onClick={confirm}>
          {busy ? "Preparing…" : "Use This Photo"}
        </button>
      </div>
    </div>
  );
}
