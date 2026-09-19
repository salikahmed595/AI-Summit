"use client";
import { useEffect, useRef, useState } from "react";
import { Header } from "./platform";

// Shared engine behind the AI Summit 2026 pass generators. The uploaded
// template art is never modified — a precise transparent cut-out already
// exists in the template file at the given frame geometry, and this
// component only ever draws the visitor's photo underneath that cut-out
// and the template itself on top, unchanged.
export type PassFrame =
  | { shape: "circle"; cx: number; cy: number; r: number }
  | { shape: "rect"; x: number; y: number; width: number; height: number };

export default function PassGenerator({
  eyebrow,
  heading,
  description,
  templateSrc,
  exportSize,
  frame,
  filename,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  templateSrc: string;
  exportSize: number;
  frame: PassFrame;
  filename: string;
}) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const photoRef = useRef<any>(null);
  const baseScaleRef = useRef(1);
  const editSizeRef = useRef(exportSize);
  const [ready, setReady] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Edit on a smaller canvas for a smooth screen experience, then export
    // at full resolution via Fabric's own multiplier — this keeps Fabric's
    // internal coordinate space, the DOM canvas size and the visible size
    // all in agreement, instead of CSS-scaling its canvas after the fact.
    const editSize = Math.max(
      280,
      Math.min(480, (window.innerWidth || 480) - 64),
    );
    editSizeRef.current = editSize;
    let disposed = false;
    (async () => {
      const fabric = await import("fabric");
      if (disposed || !canvasElRef.current) return;
      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: editSize,
        height: editSize,
        selection: false,
      });
      fabricRef.current = { fabric, canvas };
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
        scaleX: editSize / (template.width || editSize),
        scaleY: editSize / (template.height || editSize),
      });
      canvas.add(template);
      canvas.renderAll();
      setReady(true);
    })();
    return () => {
      disposed = true;
      fabricRef.current?.canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSrc]);

  function scaledFrame(): PassFrame {
    const s = editSizeRef.current / exportSize;
    return frame.shape === "circle"
      ? { shape: "circle", cx: frame.cx * s, cy: frame.cy * s, r: frame.r * s }
      : {
          shape: "rect",
          x: frame.x * s,
          y: frame.y * s,
          width: frame.width * s,
          height: frame.height * s,
        };
  }

  function fitPhoto(img: any) {
    // Cover-fit the frame, but anchor to its top edge rather than centering
    // vertically, so a crop (if any) trims the bottom, never the top —
    // a face is never cut off.
    const f = scaledFrame();
    const targetW = f.shape === "circle" ? f.r * 2 : f.width;
    const targetH = f.shape === "circle" ? f.r * 2 : f.height;
    const targetLeft = f.shape === "circle" ? f.cx - f.r : f.x;
    const targetTop = f.shape === "circle" ? f.cy - f.r : f.y;
    const w = img.width || 1,
      h = img.height || 1;
    const scale = Math.max(targetW / w, targetH / h);
    baseScaleRef.current = scale;
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: targetLeft + (targetW - w * scale) / 2,
      top: targetTop,
    });
    setZoom(1);
  }

  async function onUpload(file: File) {
    setError("");
    const { fabric, canvas } = fabricRef.current;
    try {
      const url = URL.createObjectURL(file);
      const img = await fabric.FabricImage.fromURL(url, {
        crossOrigin: "anonymous",
      });
      URL.revokeObjectURL(url);
      if (photoRef.current) canvas.remove(photoRef.current);
      img.set({
        originX: "left",
        originY: "top",
        hasControls: false,
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      fitPhoto(img);
      canvas.insertAt(0, img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      photoRef.current = img;
      setHasPhoto(true);
    } catch {
      setError("Couldn't load that photo. Try a JPG or PNG file.");
    }
  }

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

  function onReset() {
    const img = photoRef.current;
    if (!img) return;
    fitPhoto(img);
    fabricRef.current.canvas.renderAll();
  }

  function download() {
    setBusy(true);
    try {
      const { canvas } = fabricRef.current;
      const url = canvas.toDataURL({
        format: "png",
        multiplier: exportSize / editSizeRef.current,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } catch {
      setError("Couldn't export the pass. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="page pass-generator">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{heading}</h1>
        <p>{description}</p>
        <div className="pass-generator-layout">
          <div className="pass-generator-canvas">
            <canvas ref={canvasElRef} />
            {!ready && <p role="status">Loading template…</p>}
          </div>
          <div className="pass-generator-controls">
            <label className="button" style={{ textAlign: "center" }}>
              {hasPhoto ? "Change Photo" : "Upload Your Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>
            {hasPhoto && (
              <>
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
                <div className="row">
                  <button className="text-button" onClick={onReset}>
                    Reset
                  </button>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={download}
                  >
                    {busy ? "Preparing…" : "Download My Pass"}
                  </button>
                </div>
              </>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
