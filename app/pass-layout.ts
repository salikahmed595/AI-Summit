// Where the attendee's photo and name go on a pass template. Set visually
// in /admin for each event (and optionally per ticket), stored as fractions
// of the template's width/height so it holds at any image resolution.
export type PhotoShape = "circle" | "square" | "rect";
export type LayoutBox = { x: number; y: number; w: number; h: number };
export type NameStyle = {
  color: string;
  align: "left" | "center";
  weight: "bold" | "normal";
};
export type PassLayout = {
  photo: LayoutBox & { shape: PhotoShape };
  name: LayoutBox & NameStyle;
};

// The same box in pass-canvas pixels.
export type PhotoFrame = LayoutBox & { shape: PhotoShape };
export type NameBox = LayoutBox & NameStyle;

export const PHOTO_SHAPES: { value: PhotoShape; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "square", label: "Rounded square" },
  { value: "rect", label: "Portrait rectangle" },
];

// Corner radius for the rounded shapes, relative to the frame's short side.
export const cornerRadius = (f: LayoutBox) => Math.min(f.w, f.h) * 0.05;

export function defaultLayout(aspect: number): PassLayout {
  // A centred-left square photo with the name underneath — a sensible
  // starting point that the admin then drags onto the real artwork.
  const w = 0.32;
  return {
    photo: { x: 0.08, y: 0.3, w, h: w * aspect, shape: "square" },
    name: {
      x: 0.08,
      y: 0.3 + w * aspect + 0.03,
      w: 0.5,
      h: 0.06,
      color: "#ffffff",
      align: "left",
      weight: "bold",
    },
  };
}

// The pass settings an event or ticket record may carry.
export type LayoutSource = {
  passLayout?: PassLayout;
  photoX?: number | string;
  photoY?: number | string;
  photoSize?: number | string;
  photoShape?: PhotoShape;
} | null;

// Works out the photo frame and name box in canvas pixels for a ticket,
// preferring the visual layout (ticket's own, then the event's) and falling
// back to the older number-based settings for events set up before it.
export function resolveLayout(
  event: LayoutSource,
  ticket: LayoutSource,
  canvasW: number,
  canvasH: number,
): { frame: PhotoFrame; name: NameBox | null } {
  const layout: PassLayout | undefined =
    ticket?.passLayout || event?.passLayout;
  if (layout) {
    const px = (b: LayoutBox) => ({
      x: b.x * canvasW,
      y: b.y * canvasH,
      w: b.w * canvasW,
      h: b.h * canvasH,
    });
    return {
      frame: { ...px(layout.photo), shape: layout.photo.shape },
      name: {
        ...px(layout.name),
        color: layout.name.color,
        align: layout.name.align,
        weight: layout.name.weight,
      },
    };
  }
  const size = Number(ticket?.photoSize ?? event?.photoSize ?? 300);
  return {
    frame: {
      x: Number(ticket?.photoX ?? event?.photoX ?? 80),
      y: Number(ticket?.photoY ?? event?.photoY ?? 330),
      w: size,
      h: size,
      shape: ticket?.photoShape || event?.photoShape || "square",
    },
    name: null,
  };
}

// Draws `text` as large as fits inside `box` (one line, vertically centred).
// Used for both the editor preview and the final pass, so they always match.
export function drawNameInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: NameBox,
) {
  const value = text.trim();
  if (!value) return;
  const font = (size: number) =>
    `${box.weight === "bold" ? "bold " : ""}${size}px Arial`;
  let size = Math.max(8, box.h * 0.8);
  ctx.font = font(size);
  while (size > 8 && ctx.measureText(value).width > box.w) {
    size -= 1;
    ctx.font = font(size);
  }
  ctx.save();
  ctx.fillStyle = box.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = box.align === "center" ? "center" : "left";
  ctx.fillText(
    value,
    box.align === "center" ? box.x + box.w / 2 : box.x,
    box.y + box.h / 2,
    box.w,
  );
  ctx.restore();
}

// Clips `ctx` to the photo frame's shape.
export function clipToFrame(ctx: CanvasRenderingContext2D, f: PhotoFrame) {
  ctx.beginPath();
  if (f.shape === "circle")
    ctx.ellipse(
      f.x + f.w / 2,
      f.y + f.h / 2,
      f.w / 2,
      f.h / 2,
      0,
      0,
      Math.PI * 2,
    );
  else ctx.roundRect(f.x, f.y, f.w, f.h, cornerRadius(f));
  ctx.clip();
}
