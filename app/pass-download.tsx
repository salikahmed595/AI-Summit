"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "./platform";
import PhotoPositioner, { type PhotoFrame } from "./photo-positioner";
function image(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "Unable to load the photograph or pass template. Please retry.",
        ),
      );
    img.src = src;
  });
}
function fitted(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  size: number,
  color = "#f4f5eb",
) {
  ctx.fillStyle = color;
  while (size > 18 && ctx.measureText(text).width > max) {
    size -= 2;
    ctx.font = `bold ${size}px Arial`;
  }
  ctx.font = `bold ${size}px Arial`;
  while (ctx.measureText(text).width > max && size > 18) {
    size -= 2;
    ctx.font = `bold ${size}px Arial`;
  }
  ctx.fillText(text, x, y);
}
// The Fabric-based drag/zoom step (see getPassLayout + PhotoPositioner)
// produces `positionedBase`: the template and the visitor's own-positioned
// photo already flattened into one image at the exact export resolution.
// When it's supplied, this skips its own photo fetch/center-crop entirely
// and just draws that instead — text and the QR code still go on top the
// same as always.
export async function renderPass(
  data: any,
  key: string,
  social = false,
  positionedBase?: HTMLImageElement,
) {
  const { event: e, registration: r, ticket: t } = data;
  // Per-ticket pass settings win over the event's own defaults, so tiers
  // like Visitor vs Premium can ship completely different artwork.
  const templateSrc = t.template || e.template;
  const photoShape = t.photoShape || e.photoShape || "square";
  const skipBaseText = t.templateHasText ?? e.templateHasText ?? false;
  const c = document.createElement("canvas");
  let template: HTMLImageElement | null = null;
  if (!positionedBase && templateSrc) template = await image(templateSrc);
  // Match the canvas to the uploaded template's own aspect ratio instead of
  // forcing every design into a fixed 1080x1350 frame (which would stretch
  // and distort a square or differently-proportioned template).
  const sizeSource = positionedBase || template;
  if (sizeSource) {
    const maxSide = 1350;
    const scale = maxSide / Math.max(sizeSource.width, sizeSource.height);
    c.width = Math.round(sizeSource.width * scale);
    c.height = Math.round(sizeSource.height * scale);
  } else {
    c.width = 1080;
    c.height = 1350;
  }
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#10170e";
  ctx.fillRect(0, 0, c.width, c.height);
  if (positionedBase) ctx.drawImage(positionedBase, 0, 0, c.width, c.height);
  else if (template) ctx.drawImage(template, 0, 0, c.width, c.height);
  const accent = e.accent || "#b9f464";
  if (!skipBaseText) {
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, c.width, 12);
    ctx.font = "bold 68px Arial";
    ctx.fillText("PAICONS", 80, 115);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#ced7c7";
    ctx.fillText("Pakistan AI Collaboration & Opportunities Network", 80, 154);
    ctx.fillStyle = accent;
    ctx.font = "bold 25px Arial";
    ctx.fillText(social ? "I’M ATTENDING" : t.name.toUpperCase(), 80, 235);
    ctx.font = "bold 38px Arial";
    fitted(ctx, e.title, 80, 292, c.width - 160, 38);
  }
  if (!positionedBase) {
    // Fallback for when the visitor hasn't gone through the interactive
    // positioning step (or it's unavailable): the old fixed center-crop.
    const photoResponse = await fetch("/api/paicon/file/" + r.photo, {
      headers: { "x-pass-key": key },
    });
    if (!photoResponse.ok) throw new Error("Photograph unavailable");
    const photoUrl = URL.createObjectURL(await photoResponse.blob());
    let photo: HTMLImageElement;
    try {
      photo = await image(photoUrl);
    } finally {
      URL.revokeObjectURL(photoUrl);
    }
    const x = Number(t.photoX ?? e.photoX ?? 80),
      y = Number(t.photoY ?? e.photoY ?? 330),
      size = Number(t.photoSize ?? e.photoSize ?? 300);
    const crop = Math.min(photo.width, photo.height);
    ctx.save();
    ctx.beginPath();
    if (photoShape === "circle")
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    else ctx.roundRect(x, y, size, size, 12);
    ctx.clip();
    ctx.drawImage(
      photo,
      (photo.width - crop) / 2,
      (photo.height - crop) / 2,
      crop,
      crop,
      x,
      y,
      size,
      size,
    );
    ctx.restore();
  }
  if (!skipBaseText) {
    ctx.font = "bold 50px Arial";
    fitted(ctx, r.name, 80, Number(e.nameY ?? 710), c.width - 160, 50);
    ctx.font = "23px Arial";
    ctx.fillStyle = "#b4c1aa";
    ctx.fillText(
      [r.role, r.organization].filter(Boolean).join(" · ").slice(0, 70),
      80,
      Number(e.nameY ?? 710) + 44,
    );
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#f4f5eb";
    ctx.fillText(e.date + " · " + e.time, 80, 870);
    ctx.font = "24px Arial";
    fitted(ctx, e.venue + " · " + e.city, 80, 915, 650, 24);
  }
  if (!social) {
    const qrSize = Number(t.qrSize ?? e.qrSize ?? 250);
    const qrX = Number(t.qrX ?? e.qrX ?? c.width - qrSize - 80);
    const qrY = Number(t.qrY ?? e.qrY ?? c.height - qrSize - 130);
    const q = document.createElement("canvas");
    await QRCode.toCanvas(q, data.origin + "/verify/" + r.qr, {
      width: qrSize,
      margin: 3,
      errorCorrectionLevel: "M",
    });
    // A light backing keeps the QR scannable regardless of how dark or busy
    // the underlying template art is.
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 14);
    ctx.fill();
    ctx.drawImage(q, qrX, qrY, qrSize, qrSize);
    if (!skipBaseText) {
      ctx.font = "18px Arial";
      ctx.fillStyle = "#b4c1aa";
      ctx.fillText("TICKET ID", 80, 1050);
      ctx.fillText(r.id, 80, 1085);
      ctx.fillText("Present this QR code at the entrance.", 80, 1150);
    }
  } else if (!skipBaseText) {
    ctx.fillStyle = accent;
    ctx.font = "bold 45px Arial";
    ctx.fillText("See you there.", 80, 1090);
    ctx.font = "26px Arial";
    ctx.fillText("#PAICONS", 80, 1140);
  }
  if (!skipBaseText) {
    ctx.fillStyle = accent;
    ctx.font = "bold 23px Arial";
    ctx.fillText("LEARN. CONNECT. BUILD.", 80, 1270);
  }
  return c;
}
export default function PassDownload() {
  const [data, setData] = useState<any>(),
    [key, setKey] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [preview, setPreview] = useState(""),
    [notice, setNotice] = useState("");
  // Interactive positioning: let the visitor drag/zoom their own uploaded
  // photo into the frame themselves, instead of an automatic center-crop.
  const [photoUrl, setPhotoUrl] = useState(""),
    [frame, setFrame] = useState<PhotoFrame | null>(null),
    [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(
      null,
    ),
    [templateSrc, setTemplateSrc] = useState(""),
    [positionedImg, setPositionedImg] = useState<HTMLImageElement | null>(
      null,
    ),
    [repositioning, setRepositioning] = useState(false);
  async function refresh(k: string) {
    try {
      setData(await api("download", undefined, { "x-pass-key": k }));
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    const k = location.hash.slice(1);
    setKey(k);
    if (k) refresh(k);
    else setError("Open your private registration link to access your pass.");
  }, []);
  // Once the registration is active, work out this ticket's own pass frame
  // (template + where the photo goes) and fetch the visitor's own uploaded
  // photo so PhotoPositioner has something to position.
  useEffect(() => {
    if (data?.registration.status !== "active") return;
    let cancelled = false;
    let objectUrl = "";
    (async () => {
      try {
        const { event: e, ticket: t } = data;
        const src = t.template || e.template || "";
        let w = 1080,
          h = 1350;
        if (src) {
          const img = await image(src);
          const scale = 1350 / Math.max(img.width, img.height);
          w = Math.round(img.width * scale);
          h = Math.round(img.height * scale);
        }
        const res = await fetch(
          "/api/paicon/file/" + data.registration.photo,
          { headers: { "x-pass-key": key } },
        );
        if (!res.ok) throw new Error("Photograph unavailable");
        objectUrl = URL.createObjectURL(await res.blob());
        if (cancelled) return;
        setTemplateSrc(src);
        setCanvasSize({ w, h });
        setFrame({
          x: Number(t.photoX ?? e.photoX ?? 80),
          y: Number(t.photoY ?? e.photoY ?? 330),
          size: Number(t.photoSize ?? e.photoSize ?? 300),
          shape: t.photoShape || e.photoShape || "square",
        });
        setPhotoUrl(objectUrl);
      } catch (e: any) {
        setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data, key]);
  useEffect(() => {
    if (data?.registration.status === "active" && positionedImg)
      renderPass(data, key, false, positionedImg)
        .then((c) => setPreview(c.toDataURL("image/png")))
        .catch((e) => setError(e.message));
  }, [data, key, positionedImg]);
  async function download(social = false, pdf = false) {
    if (!positionedImg) return;
    setBusy(social ? "social" : pdf ? "pdf" : "png");
    try {
      const canvas = await renderPass(data, key, social, positionedImg);
      const png = canvas.toDataURL("image/png");
      if (pdf) {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({
          unit: "px",
          format: [canvas.width, canvas.height],
          hotfixes: ["px_scaling"],
          compress: true,
        });
        doc.setCreationDate(new Date(data.registration.created));
        doc.setFileId(data.registration.id.replaceAll("-", "").toUpperCase());
        doc.addImage(
          png,
          "PNG",
          0,
          0,
          canvas.width,
          canvas.height,
          undefined,
          "NONE",
        );
        doc.save("PAICONS-pass.pdf");
      } else {
        const a = document.createElement("a");
        a.href = png;
        a.download = social ? "PAICONS-social-card.png" : "PAICONS-pass.png";
        a.click();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  const r = data?.registration;
  return (
    <>
      <div className="eyebrow">YOUR PAICONS REGISTRATION</div>
      <h1>
        {r?.status === "active"
          ? "You’re in."
          : r?.status === "pending"
            ? "Payment pending."
            : "Your registration."}
      </h1>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {data && (
        <>
          <p>
            {r.name} · {data.event.title} · {data.ticket.name}
          </p>
          <div className="panel">
            <strong>Status: {r.status.toUpperCase()}</strong>
            <p>
              {r.status === "pending"
                ? "Your payment is awaiting a human review. Your pass will be available here after approval."
                : r.status === "rejected"
                  ? "Your payment was not approved. Please contact PAICONS for assistance."
                  : r.status === "cancelled"
                    ? "This ticket has been cancelled. Contact PAICONS for assistance."
                    : "Your pass is ready. Present its QR code at the event entrance."}
            </p>
            <p>
              Keep this private link safe. It is required to return to your
              registration.
            </p>
            <div className="row">
              <button
                className="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                    setNotice("Private link copied.");
                  } catch {
                    setNotice("Copy the address from your browser.");
                  }
                }}
              >
                Copy Private Link
              </button>
              <button className="text-button" onClick={() => refresh(key)}>
                Refresh Status
              </button>
            </div>
          </div>
          {r.status === "active" &&
            photoUrl &&
            frame &&
            canvasSize &&
            (!positionedImg || repositioning) && (
              <>
                <h2>Position your photo.</h2>
                <p>
                  This is the photograph you uploaded when registering — drag
                  and zoom it into place. This is exactly how it will look on
                  your pass.
                </p>
                <PhotoPositioner
                  key={photoUrl}
                  templateSrc={templateSrc}
                  photoUrl={photoUrl}
                  canvasWidth={canvasSize.w}
                  canvasHeight={canvasSize.h}
                  frame={frame}
                  onConfirm={async (dataUrl) => {
                    try {
                      const img = await image(dataUrl);
                      setPositionedImg(img);
                      setRepositioning(false);
                    } catch {
                      setError(
                        "Couldn't finish positioning your photo. Please retry.",
                      );
                    }
                  }}
                  onError={setError}
                />
              </>
            )}
          {r.status === "active" && positionedImg && !repositioning && (
            <div className="grid">
              <div>
                {preview && (
                  <img
                    src={preview}
                    alt="Your digital PAICONS pass"
                    style={{ width: "100%", maxWidth: 430, borderRadius: 10 }}
                  />
                )}
                <button
                  className="text-button"
                  onClick={() => setRepositioning(true)}
                >
                  Reposition Photo
                </button>
              </div>
              <div>
                <h2>Your pass. Your moment.</h2>
                <p>
                  Download your digital pass for entry and share your social
                  card with your community.
                </p>
                <div className="row">
                  <button
                    className="button"
                    disabled={!!busy}
                    onClick={() => download()}
                  >
                    Download PNG
                  </button>
                  <button
                    className="button"
                    disabled={!!busy}
                    onClick={() => download(false, true)}
                  >
                    Download PDF
                  </button>
                </div>
                <div className="panel">
                  <h3>Let them know you’re coming.</h3>
                  <button
                    className="button"
                    disabled={!!busy}
                    onClick={() => download(true)}
                  >
                    Download Social Card
                  </button>
                  <p style={{ whiteSpace: "pre-wrap" }}>{caption(data)}</p>
                  <button
                    className="text-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(caption(data));
                        setNotice("Caption copied.");
                      } catch {
                        setNotice("Select and copy the caption above.");
                      }
                    }}
                  >
                    Copy Caption
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <p role="status">{busy ? "Preparing download…" : notice}</p>
    </>
  );
}
export function caption(data: any) {
  const values: any = {
    NAME: data.registration.name,
    EVENT_NAME: data.event.title,
    DATE: data.event.date,
    VENUE: data.event.venue,
  };
  return (
    data.event.caption ||
    data.config.caption ||
    "Hello, my name is {NAME} and I'm attending {EVENT_NAME} at {VENUE} on {DATE}. #PAICONS"
  ).replace(
    /\{(NAME|EVENT_NAME|DATE|VENUE)\}/g,
    (_: string, k: string) => values[k],
  );
}
