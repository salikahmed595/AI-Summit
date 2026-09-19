"use client";
import { useEffect, useRef, useState } from "react";
import { Header } from "../platform";

// The Visitor Pass artwork is fixed at 1254x1254. The photo sits behind the
// template, visible only through the transparent circle already cut into
// `ai-summit-2026-visitor-pass-frame.png` at this exact center/radius, so
// nothing about the template's own design, text, colours or layout changes.
const EXPORT_SIZE = 1254;
const CIRCLE = { cx: 334, cy: 580, r: 250 };
const TEMPLATE_SRC = "/media/ai-summit-2026-visitor-pass-frame.png";

export default function AISummitPassPage() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const photoRef = useRef<any>(null);
  const baseScaleRef = useRef(1);
  const editSizeRef = useRef(EXPORT_SIZE);
  const [ready, setReady] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Edit on a smaller canvas for a smooth screen experience, then export
    // at full resolution via Fabric's own multiplier — this keeps Fabric's
    // internal coordinate space, the DOM canvas size and the visible size
    // all in agreement, instead of fighting Fabric by CSS-scaling its
    // canvas element after the fact.
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
      const template = await fabric.FabricImage.fromURL(TEMPLATE_SRC, {
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
  }, []);

  function scaledCircle() {
    const s = editSizeRef.current / EXPORT_SIZE;
    return { cx: CIRCLE.cx * s, cy: CIRCLE.cy * s, r: CIRCLE.r * s };
  }

  function fitPhoto(img: any) {
    // Cover-fit the circle, but anchor to the top of the frame rather than
    // centering vertically, so a crop (if any) trims the bottom, never the
    // top of the face.
    const { cx, cy, r } = scaledCircle();
    const w = img.width || 1,
      h = img.height || 1;
    const scale = Math.max((r * 2) / w, (r * 2) / h);
    baseScaleRef.current = scale;
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: cx - (w * scale) / 2,
      top: cy - r,
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
        multiplier: EXPORT_SIZE / editSizeRef.current,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = "PAICONS-AI-Summit-2026-Pass.png";
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
        <div className="eyebrow">AI SUMMIT 2026 · VISITOR PASS</div>
        <h1>Make your pass.</h1>
        <p>
          Upload your photo, position it inside the frame, and download your
          personal AI Summit 2026 pass — entirely in your browser. Nothing you
          upload is sent anywhere.
        </p>
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
                  Drag your photo inside the circle to reposition it.
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
