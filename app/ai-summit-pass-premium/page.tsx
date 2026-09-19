"use client";
import PassGenerator from "../pass-generator";

export default function AISummitPremiumPassPage() {
  return (
    <PassGenerator
      eyebrow="AI SUMMIT 2026 · PREMIUM PASS"
      heading="Make your Premium Pass."
      description="Upload your photo, position it inside the frame, and download your personal AI Summit 2026 Premium Pass — entirely in your browser. Nothing you upload is sent anywhere."
      templateSrc="/media/ai-summit-2026-premium-pass-frame.png"
      exportSize={1254}
      frame={{ shape: "rect", x: 692, y: 214, width: 445, height: 545 }}
      filename="PAICONS-AI-Summit-2026-Premium-Pass.png"
    />
  );
}
