"use client";
import { useEffect, useState } from "react";
import { api } from "./platform";
import { ClaimCertificate } from "./certificate";
export default function CourseAccess() {
  const [data, setData] = useState<any>(),
    [key, setKey] = useState(""),
    [error, setError] = useState(""),
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
    else setError("Open your private course link to access your course.");
  }, []);
  const r = data?.registration,
    e = data?.event;
  return (
    <>
      <div className="eyebrow">YOUR PAICONS COURSE</div>
      <h1>
        {r?.status === "active"
          ? "You're in."
          : r?.status === "pending"
            ? "Payment pending."
            : "Your course access."}
      </h1>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {data && (
        <>
          <p>
            {r.name} · {e.title}
          </p>
          <div className="panel">
            <strong>Status: {r.status.toUpperCase()}</strong>
            <p>
              {r.status === "pending"
                ? "Your payment is awaiting a human review. Your course link will unlock here once it's approved."
                : r.status === "rejected"
                  ? "Your payment was not approved. Please contact PAICONS for assistance."
                  : r.status === "cancelled"
                    ? "This access has been cancelled. Contact PAICONS for assistance."
                    : "Your course is unlocked below."}
            </p>
            <p>
              Keep this private link safe. It is required to return to your
              course access.
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
            <div className="panel">
              <h2>Start learning.</h2>
              {e.video && (
                <video
                  className="card-img"
                  src={e.video}
                  controls
                  preload="metadata"
                  style={{ marginBottom: 20 }}
                />
              )}
              {e.venue && (
                <p>
                  Live session:{" "}
                  {/^https?:\/\//.test(e.venue) ? (
                    <a href={e.venue} target="_blank" rel="noreferrer">
                      {e.venue}
                    </a>
                  ) : (
                    e.venue
                  )}
                </p>
              )}
              {e.courseLink && (
                <a
                  className="button"
                  href={e.courseLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Your Course ↗
                </a>
              )}
            </div>
          )}
          {r.status === "active" && e.certificate && (
            <ClaimCertificate
              courseTitle={e.title}
              category={e.category}
              accessKey={key}
              defaultName={r.name}
              origin={data.origin}
              existing={
                r.certificateCode
                  ? {
                      code: r.certificateCode,
                      name: r.certificateName,
                      date: r.certificateDate,
                    }
                  : undefined
              }
            />
          )}
          {r.status === "active" && (
            <div className="panel">
              <h2>Know someone learning AI?</h2>
              <p>
                This course is free — share it and they can start today too.
              </p>
              <div className="row">
                <button
                  className="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${data.origin}/courses/${e.slug}`,
                      );
                      setNotice("Course link copied.");
                    } catch {
                      setNotice("Copy the link from your browser.");
                    }
                  }}
                >
                  Copy Course Link
                </button>
                <a
                  className="text-button"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Free course: "${e.title}" by PAICONS. I just took it — worth a look: ${data.origin}/courses/${e.slug}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          )}
        </>
      )}
      <p role="status">{notice}</p>
    </>
  );
}
