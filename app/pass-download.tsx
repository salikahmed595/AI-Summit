"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "./platform";
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
export async function renderPass(data: any, key: string, social = false) {
  const { event: e, registration: r, ticket: t } = data;
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1350;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#10170e";
  ctx.fillRect(0, 0, 1080, 1350);
  if (e.template) {
    const template = await image(e.template);
    ctx.drawImage(template, 0, 0, 1080, 1350);
  }
  const accent = e.accent || "#b9f464";
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 1080, 12);
  ctx.font = "bold 68px Arial";
  ctx.fillText("PAICONS", 80, 115);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#ced7c7";
  ctx.fillText("Pakistan AI Collaboration & Opportunities Network", 80, 154);
  ctx.fillStyle = accent;
  ctx.font = "bold 25px Arial";
  ctx.fillText(social ? "I’M ATTENDING" : t.name.toUpperCase(), 80, 235);
  ctx.font = "bold 38px Arial";
  fitted(ctx, e.title, 80, 292, 920, 38);
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
  const x = Number(e.photoX ?? 80),
    y = Number(e.photoY ?? 330),
    size = Number(e.photoSize ?? 300);
  const crop = Math.min(photo.width, photo.height);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 12);
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
  ctx.font = "bold 50px Arial";
  fitted(ctx, r.name, 80, Number(e.nameY ?? 710), 920, 50);
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
  if (!social) {
    const q = document.createElement("canvas");
    await QRCode.toCanvas(q, data.origin + "/verify/" + r.qr, {
      width: 250,
      margin: 3,
      errorCorrectionLevel: "M",
    });
    ctx.drawImage(q, 750, 985, 250, 250);
    ctx.font = "18px Arial";
    ctx.fillStyle = "#b4c1aa";
    ctx.fillText("TICKET ID", 80, 1050);
    ctx.fillText(r.id, 80, 1085);
    ctx.fillText("Present this QR code at the entrance.", 80, 1150);
  } else {
    ctx.fillStyle = accent;
    ctx.font = "bold 45px Arial";
    ctx.fillText("See you there.", 80, 1090);
    ctx.font = "26px Arial";
    ctx.fillText("#PAICONS", 80, 1140);
  }
  ctx.fillStyle = accent;
  ctx.font = "bold 23px Arial";
  ctx.fillText("LEARN. CONNECT. BUILD.", 80, 1270);
  return c;
}
export default function PassDownload() {
  const [data, setData] = useState<any>(),
    [key, setKey] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [preview, setPreview] = useState(""),
    [notice, setNotice] = useState("");
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
  useEffect(() => {
    if (data?.registration.status === "active")
      renderPass(data, key)
        .then((c) => setPreview(c.toDataURL("image/png")))
        .catch((e) => setError(e.message));
  }, [data, key]);
  async function download(social = false, pdf = false) {
    setBusy(social ? "social" : pdf ? "pdf" : "png");
    try {
      const canvas = await renderPass(data, key, social);
      const png = canvas.toDataURL("image/png");
      if (pdf) {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({
          unit: "px",
          format: [1080, 1350],
          hotfixes: ["px_scaling"],
          compress: true,
        });
        doc.setCreationDate(new Date(data.registration.created));
        doc.setFileId(data.registration.id.replaceAll("-", "").toUpperCase());
        doc.addImage(png, "PNG", 0, 0, 1080, 1350, undefined, "NONE");
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
          {r.status === "active" && (
            <div className="grid">
              <div>
                {preview && (
                  <img
                    src={preview}
                    alt="Your digital PAICONS pass"
                    style={{ width: "100%", maxWidth: 430, borderRadius: 10 }}
                  />
                )}
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
