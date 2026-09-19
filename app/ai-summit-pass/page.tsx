"use client";
import PassGenerator from "../pass-generator";

export default function AISummitPassPage() {
  return (
    <PassGenerator
      eyebrow="AI SUMMIT 2026 · VISITOR PASS"
      heading="Make your pass."
      description="Upload your photo, position it inside the frame, and download your personal AI Summit 2026 Visitor Pass — entirely in your browser. Nothing you upload is sent anywhere."
      templateSrc="/media/ai-summit-2026-visitor-pass-frame.png"
      exportSize={1254}
      frame={{ shape: "circle", cx: 334, cy: 580, r: 250 }}
      filename="PAICONS-AI-Summit-2026-Visitor-Pass.png"
    />
  );
}
