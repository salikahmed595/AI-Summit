import { notFound } from "next/navigation";
import PhotoEditorPreview from "./preview";

// Local-only playground for the pass photo editor: lets you try any template
// and photo without a database, Blob storage or an approved registration.
// Never served in production builds.
export default function PhotoEditorDevPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PhotoEditorPreview />;
}
