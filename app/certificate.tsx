"use client";
import { useEffect, useState } from "react";
import { api, Field } from "./platform";

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineHeight));
  return lines.length;
}

function drawSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.fillStyle = "#12160f";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b9f464";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#b9f464";
  ctx.textAlign = "center";
  ctx.font = "bold 20px Arial";
  ctx.fillText("PAICONS", cx, cy - 4);
  ctx.font = "11px Arial";
  ctx.fillStyle = "#eef2e6";
  ctx.fillText("LEARN · BUILD · GROW", cx, cy + 16);
  ctx.restore();
}

export async function renderCertificate(data: {
  name: string;
  date: string;
  code: string;
  courseTitle: string;
  category?: string;
}) {
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 1132;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fbfbf7";
  ctx.fillRect(0, 0, c.width, c.height);
  // Dark corner wedges with a green accent edge, echoing the site's palette.
  ctx.fillStyle = "#12160f";
  [
    [0, 0, 260, 0, 0, 260],
    [c.width, c.height, c.width - 260, c.height, c.width, c.height - 260],
  ].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  });
  ctx.strokeStyle = "#b9f464";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 268);
  ctx.lineTo(268, 0);
  ctx.moveTo(c.width, c.height - 268);
  ctx.lineTo(c.width - 268, c.height);
  ctx.stroke();
  ctx.strokeStyle = "#d8dccf";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, c.width - 68, c.height - 68);

  ctx.fillStyle = "#12160f";
  ctx.textAlign = "left";
  ctx.font = "900 44px Arial";
  ctx.fillText("PAICONS", 300, 130);
  ctx.font = "bold 14px Arial";
  ctx.fillStyle = "#7c8570";
  ctx.fillText("PAKISTAN'S AI COMMUNITY — LEARN. CONNECT. USE AI.", 300, 155);

  ctx.textAlign = "center";
  ctx.fillStyle = "#7c8570";
  ctx.font = "bold 20px Arial";
  ctx.fillText("C E R T I F I C A T E   O F   C O M P L E T I O N", c.width / 2, 250);
  if (data.category) {
    ctx.fillStyle = "#12160f";
    ctx.font = "bold 15px Arial";
    const label = data.category.toUpperCase();
    const w = ctx.measureText(label).width + 44;
    ctx.strokeStyle = "#b9f464";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(c.width / 2 - w / 2, 275, w, 34);
    ctx.fillText(label, c.width / 2, 297);
  }

  ctx.fillStyle = "#12160f";
  ctx.font = "bold 54px Arial";
  wrapCenteredText(ctx, data.courseTitle, c.width / 2, 400, c.width - 560, 60);

  ctx.font = "18px Arial";
  ctx.fillStyle = "#5b6455";
  ctx.fillText("T H I S   C E R T I F I E S   T H A T", c.width / 2, 495);

  ctx.font = "italic bold 56px Georgia";
  ctx.fillStyle = "#12160f";
  ctx.fillText(data.name, c.width / 2, 570);
  ctx.strokeStyle = "#12160f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c.width / 2 - 280, 592);
  ctx.lineTo(c.width / 2 + 280, 592);
  ctx.stroke();

  ctx.font = "17px Arial";
  ctx.fillStyle = "#5b6455";
  wrapCenteredText(
    ctx,
    `has successfully completed the "${data.courseTitle}" course conducted by PAICONS — Pakistan's AI Community.`,
    c.width / 2,
    635,
    c.width - 560,
    26,
  );

  drawSeal(ctx, c.width / 2, 830, 88);

  ctx.textAlign = "left";
  ctx.font = "italic 30px Georgia";
  ctx.fillStyle = "#12160f";
  ctx.fillText("Salik Ahmed", 230, 905);
  ctx.strokeStyle = "#12160f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(230, 920);
  ctx.lineTo(500, 920);
  ctx.stroke();
  ctx.font = "bold 13px Arial";
  ctx.fillText("SALIK AHMED", 230, 942);
  ctx.fillStyle = "#7c8570";
  ctx.font = "11px Arial";
  ctx.fillText("FOUNDER, PAICONS", 230, 958);

  ctx.textAlign = "right";
  ctx.font = "italic 30px Georgia";
  ctx.fillStyle = "#12160f";
  ctx.fillText("PAICONS", c.width - 230, 905);
  ctx.strokeStyle = "#12160f";
  ctx.beginPath();
  ctx.moveTo(c.width - 500, 920);
  ctx.lineTo(c.width - 230, 920);
  ctx.stroke();
  ctx.font = "bold 13px Arial";
  ctx.fillText("PAICONS", c.width - 230, 942);
  ctx.fillStyle = "#7c8570";
  ctx.font = "11px Arial";
  ctx.fillText("PAKISTAN'S AI COMMUNITY", c.width - 230, 958);

  ctx.textAlign = "left";
  ctx.font = "11px Arial";
  ctx.fillStyle = "#7c8570";
  ctx.fillText("DATE OF COMPLETION", 300, 1050);
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#12160f";
  ctx.fillText(
    new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    300,
    1073,
  );
  ctx.textAlign = "right";
  ctx.font = "11px Arial";
  ctx.fillStyle = "#7c8570";
  ctx.fillText("CERTIFICATE ID", c.width - 300, 1050);
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#12160f";
  ctx.fillText(data.code, c.width - 300, 1073);

  return c;
}

export function certificateShareCaption(courseTitle: string, verifyUrl: string) {
  return `Today I completed the "${courseTitle}" course from www.paicons.com 🎉\n\nGrateful to PAICONS — Pakistan's AI Community — for making this free and accessible.\n\nVerify my certificate: ${verifyUrl}\n\n#PAICONS #AI #PromptEngineering #LearnAI`;
}

// Shown on the /course-access page once a course registration is active.
// Handles both the first claim (name + completion date) and returning to
// an already-issued certificate (just re-renders it from the saved code).
export function ClaimCertificate({
  courseTitle,
  category,
  accessKey,
  defaultName,
  existing,
  origin,
}: {
  courseTitle: string;
  category?: string;
  accessKey: string;
  defaultName: string;
  existing?: { code: string; name: string; date: string };
  origin: string;
}) {
  const [claimed, setClaimed] = useState(existing || null);
  const [name, setName] = useState(defaultName);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!claimed) return;
    renderCertificate({ ...claimed, courseTitle, category }).then((c) =>
      setPreview(c.toDataURL("image/png")),
    );
  }, [claimed, courseTitle, category]);
  const verifyUrl = claimed ? `${origin}/certificate/${claimed.code}` : "";
  async function claim() {
    setBusy(true);
    setError("");
    try {
      const r = await api(
        "claim-certificate",
        { name, date },
        { "x-pass-key": accessKey },
      );
      setClaimed(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    const canvas = await renderCertificate({ ...claimed!, courseTitle, category });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "PAICONS-certificate.png";
    a.click();
  }
  if (!claimed)
    return (
      <div className="panel">
        <h2>Claim your certificate.</h2>
        <p>
          Enter your name exactly as you&apos;d like it to appear, and the date
          you finished the course. This creates a permanent, verifiable
          certificate under your name.
        </p>
        <Field label="Full name" value={name} onChange={setName} required />
        <Field
          label="Completion date"
          type="date"
          value={date}
          onChange={setDate}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={busy || !name} onClick={claim}>
          {busy ? "Issuing…" : "Claim Certificate"}
        </button>
      </div>
    );
  return (
    <div className="panel">
      <h2>Your certificate is ready.</h2>
      {preview && (
        <img
          src={preview}
          alt="Your PAICONS certificate of completion"
          style={{ width: "100%", maxWidth: 620, borderRadius: 8, marginBottom: 16 }}
        />
      )}
      <div className="row">
        <button className="button" onClick={download}>
          Download Certificate
        </button>
        <a
          className="button"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on LinkedIn
        </a>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        Verification link: <a href={verifyUrl}>{verifyUrl}</a>
      </p>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Suggested caption</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {certificateShareCaption(courseTitle, verifyUrl)}
        </p>
        <button
          type="button"
          className="text-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                certificateShareCaption(courseTitle, verifyUrl),
              );
              setNotice("Caption copied.");
            } catch {
              setNotice("Select and copy the caption above.");
            }
          }}
        >
          Copy Caption
        </button>
      </div>
      <p role="status">{notice}</p>
    </div>
  );
}

export function CertificateVerify({ code }: { code: string }) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("certificate/" + code)
      .then((d) => setData(d.certificate))
      .catch((e) => setError(e.message));
  }, [code]);
  return (
    <>
      <div className="eyebrow">PAICONS CERTIFICATE VERIFICATION</div>
      <h1 className={data ? "success" : ""}>
        {data ? "Certificate verified." : error ? "Not found." : "Checking…"}
      </h1>
      {data ? (
        <div className="panel">
          <h2>{data.name}</h2>
          <p>
            Completed <strong>{data.courseTitle}</strong>
          </p>
          <p>
            Issued{" "}
            {new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · Certificate ID {data.code}
          </p>
          <p className="muted">
            This certificate was issued by PAICONS — Pakistan&apos;s AI
            Community — and can always be re-verified at this link.
          </p>
        </div>
      ) : (
        error && (
          <p className="error" role="alert">
            This certificate ID couldn&apos;t be verified. Double-check the link.
          </p>
        )
      )}
    </>
  );
}
