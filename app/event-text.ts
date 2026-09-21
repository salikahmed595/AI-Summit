// Small pure helpers shared by the event page, homepage cards and SEO
// metadata, so every event is presented the same way.

/** Organisers often type a "Description:" label into the description box;
 *  the page already labels the section, so drop it. */
export function cleanDescription(value?: string | null): string {
  return String(value ?? "")
    .replace(/^\s*description\s*:\s*/i, "")
    .trim();
}

/** Where the event's map card should send people: the exact Google Maps
 *  link the organiser pasted, or a Google Maps search for venue + address +
 *  city. Returns "" for online events / events with no location. */
export function mapsHref(e: {
  mapUrl?: string;
  venue?: string;
  address?: string;
  city?: string;
}): string {
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
