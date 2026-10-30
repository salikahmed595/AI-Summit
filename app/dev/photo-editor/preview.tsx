"use client";
import { useEffect, useState } from "react";
import PhotoPositioner, { type PhotoFrame } from "../../photo-positioner";

const DEFAULT_TEMPLATE = "/media/ai-summit-2026-visitor-pass.png";

// Same sizing rule as the real pass page: the template's long side becomes
// 1350, and the frame numbers are in that space — exactly the units of the
// "Photo left/top position" and "Photo size" fields in /admin.
function canvasSizeOf(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 1350 / Math.max(img.width, img.height);
      resolve({
        w: Math.round(img.width * scale),
        h: Math.round(img.height * scale),
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

// A simple stand-in photo so the editor works before you pick your own.
function samplePhoto() {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 900;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, "#7fb6ff");
  g.addColorStop(1, "#dfe6d5");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1200, 900);
  ctx.fillStyle = "#e8b48a";
  ctx.beginPath();
  ctx.arc(600, 360, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1d2318";
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SAMPLE PHOTO", 600, 110);
  return c.toDataURL("image/png");
}

export default function PhotoEditorPreview() {
  const [templateSrc, setTemplateSrc] = useState(DEFAULT_TEMPLATE);
  // The editor only mounts after the template size is known (client-side),
  // so building the sample photo here never causes a hydration mismatch.
  const [photoUrl, setPhotoUrl] = useState(() =>
    typeof document === "undefined" ? "" : samplePhoto(),
  );
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<PhotoFrame>({
    x: 90,
    y: 355,
    size: 538,
    shape: "circle",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    canvasSizeOf(templateSrc)
      .then(setSize)
      .catch(() => setError("Couldn't load that template image."));
  }, [templateSrc]);

  const pick = (set: (url: string) => void) => (file?: File) => {
    if (!file) return;
    setError("");
    setResult("");
    set(URL.createObjectURL(file));
  };
  const num =
    (k: "x" | "y" | "size") => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFrame((f) => ({ ...f, [k]: Number(e.target.value) || 0 }));

  return (
    <main className="page pass-generator">
      <div className="eyebrow">LOCAL PREVIEW · NOT LIVE</div>
      <h1>Photo editor test.</h1>
      <p>
        Try the pass photo step with any template and photo from your computer.
        Nothing is uploaded anywhere.
      </p>
      <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
        <label className="button">
          Choose Photo
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => pick(setPhotoUrl)(e.target.files?.[0])}
          />
        </label>
        <label className="button">
          Choose Template
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => pick(setTemplateSrc)(e.target.files?.[0])}
          />
        </label>
      </div>
      <fieldset className="photo-editor-group" style={{ marginTop: 20 }}>
        <legend>Frame (same units as /admin)</legend>
        <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
          <label>
            Photo left position{" "}
            <input type="number" value={frame.x} onChange={num("x")} />
          </label>
          <label>
            Photo top position{" "}
            <input type="number" value={frame.y} onChange={num("y")} />
          </label>
          <label>
            Photo size{" "}
            <input type="number" value={frame.size} onChange={num("size")} />
          </label>
          <label>
            Shape{" "}
            <select
              value={frame.shape}
              onChange={(e) =>
                setFrame((f) => ({
                  ...f,
                  shape: e.target.value as PhotoFrame["shape"],
                }))
              }
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </label>
        </div>
        {size && (
          <p style={{ fontSize: 13, margin: 0 }}>
            Template canvas: {size.w} × {size.h}
          </p>
        )}
      </fieldset>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {photoUrl && size && (
        <PhotoPositioner
          key={`${templateSrc}|${photoUrl}|${frame.x}|${frame.y}|${frame.size}|${frame.shape}`}
          templateSrc={templateSrc}
          photoUrl={photoUrl}
          canvasWidth={size.w}
          canvasHeight={size.h}
          frame={frame}
          name="Your Name"
          onConfirm={setResult}
          onError={setError}
        />
      )}
      {result && (
        <>
          <h2>Exported pass image</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result}
            alt="Exported pass preview"
            style={{ width: "100%", maxWidth: 430, borderRadius: 10 }}
          />
        </>
      )}
    </main>
  );
}
