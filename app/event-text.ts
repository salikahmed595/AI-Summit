// Small pure helpers shared by the event page, homepage cards and SEO
// metadata, so every event is presented the same way.

/** Organisers often type a "Description:" label into the description box;
 *  the page already labels the section, so drop it. */
export function cleanDescription(value?: string | null): string {
  return String(value ?? "")
    .replace(/^\s*description\s*:\s*/i, "")
    .trim();
}

/** Whether an event is upcoming or past — an organiser's manual "stage"
 *  choice wins, otherwise it's derived from today's date vs. the event
 *  date. Events with no date yet are treated as upcoming. */
export function eventStage(e: { date?: string; stage?: string }): "upcoming" | "past" {
  if (e.stage === "upcoming" || e.stage === "past") return e.stage;
  const today = new Date().toISOString().slice(0, 10);
  return e.date && e.date < today ? "past" : "upcoming";
}

/** Where the event's map card should send people: the exact Google Maps
 *  link the organiser pasted, or a Google Maps search for venue + address +
 *  city. Returns "" for online events / events with no location. */
export function mapsHref(e: {
  mapUrl?: string;
  venue?: string;
  address?: string;
  city?: string;
  locationType?: string;
}): string {
  if (e.locationType === "online") return "";
  if (/^https:\/\//.test(e.mapUrl || "")) return e.mapUrl as string;
  if (/online|zoom|virtual|webinar|google meet|teams/i.test(e.venue || ""))
    return "";
  // Don't repeat the city when the address already ends with it.
  const city =
    e.city && (e.address || "").toLowerCase().includes(e.city.toLowerCase())
      ? ""
      : e.city;
  const query = [e.venue, e.address, city].filter(Boolean).join(", ");
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : "";
}
