"use client";
import { useEffect, useState } from "react";
import PhotoPositioner from "../../photo-positioner";
import PassLayoutEditor from "../../pass-layout-editor";
import { renderPass } from "../../pass-download";
import { resolveLayout, type PassLayout } from "../../pass-layout";

const DEFAULT_TEMPLATE = "/media/ai-summit-2026-visitor-pass.png";

// Same sizing rule as the real pass page: the template's long side is 1350.
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

const image = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Local-only walkthrough of both sides of the pass flow: the admin's visual
// poster setup, then the attendee's photo step and the final rendered pass.
export default function PhotoEditorPreview() {
  const [templateSrc, setTemplateSrc] = useState(DEFAULT_TEMPLATE);
  const [layout, setLayout] = useState<PassLayout | undefined>();
  // Step 2 follows the layout once the admin stops dragging, rather than
  // restarting the photo editor on every pixel of movement.
  const [applied, setApplied] = useState<PassLayout | undefined>();
  const [hasText, setHasText] = useState(true);
  // The editor only mounts after the template size is known (client-side),
  // so building the sample photo here never causes a hydration mismatch.
  const [photoUrl, setPhotoUrl] = useState(() =>
    typeof document === "undefined" ? "" : samplePhoto(),
  );
  const [attendeeName, setAttendeeName] = useState("Salik Ahmed");
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setApplied(layout), 400);
    return () => clearTimeout(timer);
  }, [layout]);
  useEffect(() => {
    canvasSizeOf(templateSrc)
      .then(setSize)
      .catch(() => setError("Couldn't load that template image."));
  }, [templateSrc]);

  const pick = (set: (url: string) => void) => (file?: File) => {
    if (!file) return;
    setError("");
    setPass("");
    set(URL.createObjectURL(file));
  };
  const placed =
    size && resolveLayout(null, { passLayout: applied }, size.w, size.h);

  async function finish(dataUrl: string) {
    try {
      // The real pass renderer, fed the same settings an event would have.
      const canvas = await renderPass(
        {
          event: {
            title: "Sample Event",
            date: "2026-11-05",
            time: "16:00",
            venue: "Sample Venue",
            city: "Karachi",
            templateHasText: hasText,
            passLayout: applied,
          },
          ticket: { name: "Visitor", template: templateSrc },
          registration: { name: attendeeName, id: "SAMPLE-TICKET-ID" },
        },
        "",
        false,
        await image(dataUrl),
      );
      setPass(canvas.toDataURL("image/png"));
    } catch {
      setError("Couldn't render the pass.");
    }
  }

  return (
    <main className="page pass-generator">
      <div className="eyebrow">LOCAL PREVIEW · NOT LIVE</div>
      <h1>Pass setup test.</h1>
      <p>
        Step 1 is what an admin does once per event poster. Step 2 is what each
        attendee sees. Nothing is uploaded anywhere.
      </p>

      <h2>1. Admin: set up the poster</h2>
      <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
        <label className="button">
          Choose Poster
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              pick((url) => {
                setLayout(undefined);
                setTemplateSrc(url);
              })(e.target.files?.[0])
            }
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={hasText}
            onChange={(e) => setHasText(e.target.checked)}
          />
          Poster already includes the title, date and venue text
        </label>
      </div>
      <PassLayoutEditor
        templateSrc={templateSrc}
        value={layout}
        onChange={(v) => {
          setPass("");
          setLayout(v);
        }}
      />

      <h2>2. Attendee: position the photo</h2>
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
        <label>
          Registered name (set at registration — attendees can&apos;t edit it){" "}
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
          />
        </label>
      </div>
      {!applied && (
        <p className="pass-layout-note" style={{ marginTop: 12 }}>
          No layout set in step 1, so this uses the old default placement.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {photoUrl && size && placed && (
        <PhotoPositioner
          key={`${templateSrc}|${photoUrl}|${JSON.stringify(applied)}|${attendeeName}`}
          templateSrc={templateSrc}
          photoUrl={photoUrl}
          canvasWidth={size.w}
          canvasHeight={size.h}
          frame={placed.frame}
          name={attendeeName}
          nameBox={placed.name}
          onConfirm={finish}
          onError={setError}
        />
      )}
      {pass && (
        <>
          <h2>3. Final pass</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pass}
            alt="Final rendered pass"
            style={{ width: "100%", maxWidth: 430, borderRadius: 10 }}
          />
        </>
      )}
    </main>
  );
}
