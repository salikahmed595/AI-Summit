"use client";
import { useEffect, useState } from "react";
import { api, Field, Area, Choice, Upload } from "./platform";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
const names: any = {
  events: "Events",
  courses: "Courses",
  speakers: "Speakers",
  partners: "Partners",
  galleries: "Galleries",
  settings: "Website Content",
  membership: "Membership",
};
const eventKinds = [
  "AI Summit",
  "Networking Night",
  "AI Meetup",
  "Workshop",
  "Hackathon",
  "Founder Meetup",
  "University Event",
];
export default function Admin() {
  const [data, setData] = useState<any>(),
    [error, setError] = useState(""),
    [tab, setTab] = useState("overview"),
    [edit, setEdit] = useState<any>(null),
    [decision, setDecision] = useState<any>(null),
    [filter, setFilter] = useState("all"),
    [eventFilter, setEventFilter] = useState("all");
  const refresh = () =>
    api("admin")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    refresh();
  }, []);
  if (!data) return <p role="status">{error || "Loading your dashboard…"}</p>;
  const events = data.records.filter((r: any) =>
    ["events", "courses"].includes(r.kind),
  );
  const regs = data.registrations.filter(
    (r: any) =>
      (eventFilter === "all" || r.event_id === eventFilter) &&
      (filter === "all" ||
        r.status === filter ||
        (filter === "checked-in" && r.checked_at)),
  );
  const activeRegistrations = data.registrations.filter(
    (r: any) => r.status === "active",
  );
  const ticketSold = (ticketId: string) =>
    activeRegistrations.filter((r: any) => r.ticket_id === ticketId).length;
  async function recordAction(id: string, operation: string) {
    try {
      await api("record-action", { id, operation });
      await refresh();
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }
  function csv() {
    const rows = [
      [
        "Name",
        "Email",
        "WhatsApp",
        "Event",
        "Ticket",
        "Amount PKR",
        "Status",
        "Check-in",
        "Registered",
      ],
      ...regs.map((r: any) => [
        r.name,
        r.email,
        r.whatsapp,
        events.find((e: any) => e.id === r.event_id)?.title,
        data.tickets.find((t: any) => t.id === r.ticket_id)?.name,
        r.amount,
        r.status,
        r.checked_at || "",
        r.created,
      ]),
    ];
    const text = rows
      .map((row) =>
        row
          .map(
            (c: any) =>
              '"' +
              String(c ?? "")
                .replace(/^[=+@-]/, "'$&")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "paicon-registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow">PAICON / ORGANIZER WORKSPACE</div>
          <h1>Make it happen.</h1>
        </div>
        <a className="text-button" href="/signout-with-chatgpt?return_to=/">
          Sign out
        </a>
      </div>
      <p>Signed in as {data.user}</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setEdit(null);
          setError("");
        }}
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          {[
            "overview",
            ...Object.keys(names),
            "registrations",
            "payments",
            "messages",
            "audit",
            "check-in",
          ].map((k) => (
            <TabsTrigger key={k} value={k}>
              {names[k] || k.charAt(0).toUpperCase() + k.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <div className="grid">
            {[
              [
                "Published events",
                events.filter((e: any) => e.status === "published").length,
              ],
              ["Registrations", data.registrations.length],
              [
                "Pending payments",
                data.registrations.filter((r: any) => r.status === "pending")
                  .length,
              ],
              [
                "Approved ticket sales · PKR",
                activeRegistrations.reduce(
                  (n: number, r: any) => n + r.amount,
                  0,
                ),
              ],
              ["Tickets sold", activeRegistrations.length],
              [
                "Tickets remaining",
                data.tickets.reduce(
                  (n: number, ticket: any) =>
                    n + Math.max(0, ticket.capacity - ticketSold(ticket.id)),
                  0,
                ),
              ],
              [
                "Check-ins",
                data.registrations.filter((r: any) => r.checked_at).length,
              ],
              [
                "Partnership requests",
                data.messages.filter((r: any) => r.kind === "partner").length,
              ],
            ].map(([label, value]) => (
              <div className="panel" key={label}>
                <div className="eyebrow">{label}</div>
                <h2>{Number(value).toLocaleString()}</h2>
              </div>
            ))}
          </div>
          <section className="panel">
            <h2>Ticket breakdown</h2>
            <div className="scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tickets.map((ticket: any) => {
                    const sold = ticketSold(ticket.id);
                    const revenue = activeRegistrations
                      .filter((r: any) => r.ticket_id === ticket.id)
                      .reduce((sum: number, r: any) => sum + r.amount, 0);
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell>{sold}</TableCell>
                        <TableCell>
                          {Math.max(0, ticket.capacity - sold)}
                        </TableCell>
                        <TableCell>PKR {revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
          <section className="panel">
            <h2>Recent purchases</h2>
            {data.registrations.slice(0, 8).map((registration: any) => (
              <p key={registration.id}>
                {registration.name} ·{" "}
                {
                  data.tickets.find(
                    (ticket: any) => ticket.id === registration.ticket_id,
                  )?.name
                }{" "}
                · {registration.status}
              </p>
            ))}
            {!data.registrations.length && <p>No purchases yet.</p>}
          </section>
          <button
            className="button"
            onClick={() => {
              setTab("events");
              setEdit({ kind: "events" });
            }}
          >
            Create Event ↗
          </button>
        </TabsContent>
        {Object.keys(names).map((kind) => (
          <TabsContent value={kind} key={kind}>
            {edit ? (
              <RecordEditor
                key={edit.id || "new-" + kind}
                record={edit}
                data={data}
                onSave={async () => {
                  await refresh();
                  setEdit(null);
                }}
                onCancel={() => setEdit(null)}
              />
            ) : (
              <>
                <div className="section-heading">
                  <h2>{names[kind]}</h2>
                  <button
                    className="button"
                    onClick={() =>
                      setEdit(
                        kind === "settings"
                          ? data.records.find(
                              (r: any) => r.kind === "settings",
                            ) || { kind }
                          : { kind },
                      )
                    }
                  >
                    {kind === "settings"
                      ? "Edit Website Content"
                      : "Create " +
                        (kind === "galleries" ? "Gallery" : kind.slice(0, -1))}
                  </button>
                </div>
                {data.records
                  .filter((r: any) => r.kind === kind)
                  .map((r: any) => (
                    <div
                      className="panel row"
                      key={r.id}
                      style={{ justifyContent: "space-between" }}
                    >
                      <div>
                        <h3>{r.title}</h3>
                        <span className="pill">{r.status}</span>
                        <p>
                          {r.date} {r.venue}
                        </p>
                      </div>
                      <div className="row">
                        <button className="button" onClick={() => setEdit(r)}>
                          Edit
                        </button>
                        {["events", "courses"].includes(kind) && (
                          <>
                            <button
                              onClick={() => recordAction(r.id, "duplicate")}
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() =>
                                recordAction(
                                  r.id,
                                  r.status === "published"
                                    ? "unpublish"
                                    : "publish",
                                )
                              }
                            >
                              {r.status === "published"
                                ? "Unpublish"
                                : "Publish"}
                            </button>
                            <button
                              className="danger-button"
                              onClick={() =>
                                setDecision({
                                  id: r.id,
                                  name: r.title,
                                  decision: "delete-record",
                                })
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                {!data.records.some((r: any) => r.kind === kind) && (
                  <p>
                    No {names[kind].toLowerCase()} yet. Create your first entry
                    above.
                  </p>
                )}
              </>
            )}
          </TabsContent>
        ))}
        {["registrations", "payments"].map((view) => (
          <TabsContent value={view} key={view}>
            <h2>{view === "payments" ? "Payment review" : "Registrations"}</h2>
            <div className="grid">
              <Choice
                label="Event"
                value={eventFilter}
                onChange={setEventFilter}
                options={[
                  { value: "all", label: "All events" },
                  ...events.map((e: any) => ({ value: e.id, label: e.title })),
                ]}
              />
              <Choice
                label="Status"
                value={filter}
                onChange={setFilter}
                options={[
                  "all",
                  "pending",
                  "active",
                  "rejected",
                  "cancelled",
                  "checked-in",
                ]}
              />
            </div>
            <button className="text-button" onClick={csv}>
              Export filtered registrations as CSV ↓
            </button>
            <div className="scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Attendee",
                      "Event / Pass",
                      "Payment",
                      "Status",
                      "Action",
                    ].map((x) => (
                      <TableHead key={x}>{x}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regs
                    .filter((r: any) => view !== "payments" || r.amount > 0)
                    .map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="row">
                            <img
                              width={45}
                              height={45}
                              style={{ borderRadius: 6 }}
                              src={"/api/paicon/file/" + r.photo}
                              alt=""
                            />
                            <div>
                              {r.name}
                              <br />
                              {r.email}
                              <br />
                              {r.whatsapp}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {events.find((e: any) => e.id === r.event_id)?.title}
                          <br />
                          {
                            data.tickets.find((t: any) => t.id === r.ticket_id)
                              ?.name
                          }
                        </TableCell>
                        <TableCell>
                          PKR {r.amount.toLocaleString()}
                          <br />
                          {r.method}
                          <br />
                          {r.reference}
                          {r.receipt && (
                            <>
                              <br />
                              <a
                                className="success"
                                href={"/api/paicon/file/" + r.receipt}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View Receipt ↗
                              </a>
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {r.status}
                          <br />
                          {r.checked_at ? "Checked in" : "Not checked in"}
                          <br />
                          {new Date(r.created).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {r.status === "pending" ? (
                            <div className="row">
                              <button
                                className="button small"
                                onClick={() =>
                                  setDecision({
                                    id: r.id,
                                    name: r.name,
                                    decision: "approve",
                                  })
                                }
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setDecision({
                                    id: r.id,
                                    name: r.name,
                                    decision: "reject",
                                  })
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : r.status === "active" ? (
                            <button
                              onClick={() =>
                                setDecision({
                                  id: r.id,
                                  name: r.name,
                                  decision: "cancel",
                                })
                              }
                            >
                              Cancel ticket
                            </button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {regs.length === 0 && <p>No registrations match these filters.</p>}
          </TabsContent>
        ))}
        <TabsContent value="messages">
          <h2>Inbox</h2>
          {data.messages.length === 0 && <p>No inquiries yet.</p>}
          {data.messages.map((m: any) => (
            <article className="panel" key={m.id}>
              <span className="pill">{m.kind}</span>
              <h3>
                {m.name} · {m.organization}
              </h3>
              <p>
                {m.email} · {m.phone}
              </p>
              <p>
                {m.type} · {m.website} · {m.budget}
              </p>
              <p>{m.objective}</p>
              <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
              <small>{new Date(m.created).toLocaleString()}</small>
            </article>
          ))}
        </TabsContent>
        <TabsContent value="audit">
          <h2>Audit log</h2>
          <div className="scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.audit.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.created}</TableCell>
                    <TableCell>{a.actor}</TableCell>
                    <TableCell>{a.action}</TableCell>
                    <TableCell>{a.target}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="check-in">
          <h2>Welcome them in.</h2>
          <p>
            Scan the ticket QR with your phone’s camera to open verification.
            Sign in with your authorized staff account and select Check In
            Attendee.
          </p>
          <Field
            label="Or paste a ticket verification link"
            value={filter === "all" ? "" : filter}
            onChange={setFilter}
          />
          <button
            className="button"
            onClick={() => {
              try {
                const u = new URL(filter);
                const match = u.pathname.match(/^\/verify\/([a-f0-9]{64})$/);
                if (!match) throw new Error();
                location.href = "/verify/" + match[1];
              } catch {
                setError("Enter a valid PAICON verification link");
              }
            }}
          >
            Open Verification
          </button>
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={!!decision}
        onOpenChange={(v) => !v && setDecision(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decision?.decision === "approve"
                ? "Approve payment?"
                : decision?.decision === "reject"
                  ? "Reject payment?"
                  : decision?.decision === "delete-record"
                    ? "Delete this item?"
                    : "Cancel ticket?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decision?.name}.{" "}
              {decision?.decision === "approve"
                ? "Confirm that you have verified the transaction against the receiving payment account. A screenshot alone is not proof of payment."
                : decision?.decision === "delete-record"
                  ? "This permanently removes the item and its ticket types. Items with registrations cannot be deleted; unpublish them instead."
                  : "This will prevent the attendee from using this registration for entry."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (decision.decision === "delete-record") {
                    await api("record-action", {
                      id: decision.id,
                      operation: "delete",
                    });
                  } else {
                    await api("payment", {
                      id: decision.id,
                      decision: decision.decision,
                    });
                  }
                  await refresh();
                  setError("");
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setDecision(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function RecordEditor({ record, data, onSave, onCancel }: any) {
  const kind = record.kind;
  const [form, setForm] = useState<any>({
    title: kind === "settings" ? "PAICON" : "",
    slug: kind === "settings" ? "website" : "",
    status: "draft",
    city: "Karachi",
    category: kind === "courses" ? "Workshop" : "AI Summit",
    capacity: 100,
    fields: [],
    accent: "#b9f464",
    photoX: 80,
    photoY: 330,
    photoSize: 300,
    nameY: 710,
    ...record,
  });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [savedId, setSavedId] = useState(record.id);
  const set = (key: string) => (value: any) =>
    setForm((p: any) => ({ ...p, [key]: value }));
  const isEvent = ["events", "courses"].includes(kind);
  async function save(status: string, close = true) {
    setBusy(true);
    setError("");
    try {
      const r = await api("record", {
        id: savedId,
        kind,
        title: form.title,
        slug: form.slug,
        status,
        details: form,
      });
      setSavedId(r.id);
      if (close) await onSave();
      return r.id;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="text-button" onClick={onCancel}>
        ← Back to {names[kind]}
      </button>
      <h2>
        {record.id ? "Edit" : "Create"} {names[kind]}
      </h2>
      <div className="panel">
        <Field
          label="Title / name"
          value={form.title}
          onChange={(v: string) =>
            setForm((p: any) => ({
              ...p,
              title: v,
              slug: !record.id
                ? v
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                : p.slug,
            }))
          }
          required
        />
        <Field
          label="Page address"
          value={form.slug}
          onChange={set("slug")}
          required
        />
        <Upload
          label={
            kind === "speakers"
              ? "Speaker photo"
              : kind === "partners"
                ? "Partner logo"
                : "Cover image"
          }
          value={form.banner}
          onChange={set("banner")}
        />
        <Area
          label="Description"
          value={form.description}
          onChange={set("description")}
        />
        {isEvent && (
          <>
            <div className="grid">
              <Choice
                label="Category"
                value={form.category}
                onChange={set("category")}
                options={eventKinds}
              />
              <Field
                label="Capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(v: string) => set("capacity")(Number(v))}
              />
              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={set("date")}
              />
              <Field
                label="Time (Pakistan time)"
                type="time"
                value={form.time}
                onChange={set("time")}
              />
              <Field
                label="Venue / online meeting location"
                value={form.venue}
                onChange={set("venue")}
              />
              <Field label="City" value={form.city} onChange={set("city")} />
              <Field
                label="Full address"
                value={form.address}
                onChange={set("address")}
              />
              <Field
                label="Map URL"
                type="url"
                value={form.mapUrl}
                onChange={set("mapUrl")}
              />
              <Field
                label="Organizer"
                value={form.organizer}
                onChange={set("organizer")}
              />
              <Upload
                label="Video"
                accept="video/mp4"
                value={form.video}
                onChange={set("video")}
              />
              <Field
                label="Registration starts (Pakistan time)"
                type="datetime-local"
                value={form.registrationStart?.slice(0, 16)}
                onChange={(v: string) =>
                  set("registrationStart")(v ? v + ":00+05:00" : "")
                }
              />
              <Field
                label="Registration ends (Pakistan time)"
                type="datetime-local"
                value={form.registrationEnd?.slice(0, 16)}
                onChange={(v: string) =>
                  set("registrationEnd")(v ? v + ":00+05:00" : "")
                }
              />
            </div>
            <div className="row">
              <label className="row">
                <Checkbox
                  checked={Boolean(form.featuredEvent)}
                  onCheckedChange={(v) => set("featuredEvent")(v === true)}
                />
                Featured event
              </label>
              <label className="row">
                <Checkbox
                  checked={form.showSocialProof !== false}
                  onCheckedChange={(v) => set("showSocialProof")(v === true)}
                />
                Show real registration and scarcity signals
              </label>
            </div>
            {[
              ["outcomes", "Event outcomes"],
              ["agenda", "Agenda"],
              ["faqs", "Frequently asked questions"],
              ["testimonials", "Testimonials (verified only)"],
              ["cancellation", "Cancellation / refund information"],
              ["benefits", "Event or course benefits"],
            ].map(([k, l]) => (
              <Area key={k} label={l} value={form[k]} onChange={set(k)} />
            ))}
            <h3>Optional registration fields</h3>
            <div className="row">
              {[
                "organization",
                "role",
                "city",
                "linkedin",
                "instagram",
                "source",
              ].map((f) => (
                <label className="row" key={f}>
                  <Checkbox
                    checked={form.fields.includes(f)}
                    onCheckedChange={(v) =>
                      set("fields")(
                        v
                          ? [...form.fields, f]
                          : form.fields.filter((x: string) => x !== f),
                      )
                    }
                  />
                  {f}
                </label>
              ))}
            </div>
            {kind === "courses" && (
              <>
                <div className="grid">
                  {[
                    ["instructor", "Instructor"],
                    ["duration", "Duration"],
                    ["level", "Level"],
                    ["format", "Online / Physical"],
                    ["courseLocation", "Location"],
                    ["courseLink", "Online course link"],
                  ].map(([k, l]) => (
                    <Field
                      key={k}
                      label={l}
                      value={form[k]}
                      onChange={set(k)}
                    />
                  ))}
                </div>
                <div className="grid">
                  <Field
                    label="Price (PKR)"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(v: string) => set("price")(Number(v))}
                  />
                  <Field
                    label="Discount price (PKR)"
                    type="number"
                    min="0"
                    value={form.discountPrice}
                    onChange={(v: string) => set("discountPrice")(Number(v))}
                  />
                </div>
                {[
                  ["curriculum", "Curriculum"],
                  ["requirements", "Requirements"],
                  ["certificate", "Certificate information"],
                ].map(([k, l]) => (
                  <Area key={k} label={l} value={form[k]} onChange={set(k)} />
                ))}
              </>
            )}
            <h3>Pass template</h3>
            <p>
              The PAICON layout is included. Upload an optional background and
              configure photo placement. All outputs use standard rendering.
            </p>
            <Upload
              label="Pass background (1080 × 1350 recommended)"
              value={form.template}
              onChange={set("template")}
            />
            <div className="grid">
              {[
                ["accent", "Accent color", "color"],
                ["photoX", "Photo left position", "number"],
                ["photoY", "Photo top position", "number"],
                ["photoSize", "Photo size", "number"],
                ["nameY", "Attendee name position", "number"],
              ].map(([k, l, t]) => (
                <Field
                  key={k}
                  label={l}
                  type={t}
                  value={form[k]}
                  onChange={(v: string) =>
                    set(k)(t === "number" ? Number(v) : v)
                  }
                />
              ))}
            </div>
            <Area
              label="Social caption — use {NAME}, {EVENT_NAME}, {DATE}, {VENUE}"
              value={form.caption}
              onChange={set("caption")}
            />
            <Field label="Primary CTA" value={form.cta} onChange={set("cta")} />
            <h3>Gallery</h3>
            <Upload
              label="Add event photograph"
              onChange={(v: string) =>
                set("gallery")([form.gallery, v].filter(Boolean).join("\n"))
              }
            />
            <Area
              label="Gallery photographs (one uploaded link per line)"
              value={form.gallery}
              onChange={set("gallery")}
            />
          </>
        )}
        {["speakers", "partners", "galleries"].includes(kind) && (
          <>
            <Choice
              label="Associated event"
              value={form.event || "none"}
              onChange={set("event")}
              options={[
                { value: "none", label: "All PAICON" },
                ...data.records
                  .filter((e: any) => e.kind === "events")
                  .map((e: any) => ({ value: e.id, label: e.title })),
              ]}
            />
            {kind === "speakers" ? (
              <>
                {[
                  ["role", "Role"],
                  ["organization", "Organization"],
                  ["linkedin", "LinkedIn URL"],
                ].map(([k, l]) => (
                  <Field key={k} label={l} value={form[k]} onChange={set(k)} />
                ))}
                <Area
                  label="Biography"
                  value={form.bio}
                  onChange={set("bio")}
                />
              </>
            ) : kind === "partners" ? (
              <>
                <Choice
                  label="Partnership category"
                  value={form.category}
                  onChange={set("category")}
                  options={[
                    "Title Sponsor",
                    "Corporate Partner",
                    "University Partner",
                    "Venue Partner",
                    "Technology Partner",
                    "Media Partner",
                    "Community Partner",
                    "Education Partner",
                  ]}
                />
                <Field
                  label="Website"
                  type="url"
                  value={form.website}
                  onChange={set("website")}
                />
              </>
            ) : (
              <>
                <Upload
                  label="Add photograph"
                  onChange={(v: string) =>
                    set("gallery")([form.gallery, v].filter(Boolean).join("\n"))
                  }
                />
                <Area
                  label="Photographs"
                  value={form.gallery}
                  onChange={set("gallery")}
                />
              </>
            )}
          </>
        )}
        {kind === "settings" && (
          <>
            <Field
              label="Homepage headline"
              value={form.hero}
              onChange={set("hero")}
            />
            <Area
              label="About PAICON"
              value={form.about}
              onChange={set("about")}
            />
            <Choice
              label="Featured event"
              value={form.featured || "none"}
              onChange={set("featured")}
              options={[
                { value: "none", label: "No featured event" },
                ...data.records
                  .filter((r: any) => r.kind === "events")
                  .map((r: any) => ({ value: r.id, label: r.title })),
              ]}
            />
            <Area
              label="Community statistics (one Label: Number per line; only verified figures)"
              value={form.stats}
              onChange={set("stats")}
            />
            <Field
              label="Community link"
              type="url"
              value={form.community}
              onChange={set("community")}
            />
            <Area
              label="Social links (one Label: https://address per line)"
              value={form.socials}
              onChange={set("socials")}
            />
            <Field
              label="Contact email / phone"
              value={form.contact}
              onChange={set("contact")}
            />
            <Field
              label="Announcement"
              value={form.announcement}
              onChange={set("announcement")}
            />
            <Area
              label="Payment instructions — Easypaisa, JazzCash and bank account details"
              value={form.payment}
              onChange={set("payment")}
            />
            <Area
              label="Default social caption"
              value={form.caption}
              onChange={set("caption")}
            />
            {[
              ["privacy", "Privacy Policy"],
              ["terms", "Terms"],
              ["refund", "Refund Policy"],
            ].map(([k, l]) => (
              <Area key={k} label={l} value={form[k]} onChange={set(k)} />
            ))}
          </>
        )}
        <Field
          label="SEO title"
          value={form.seoTitle}
          onChange={set("seoTitle")}
        />
        <Area
          label="SEO description"
          value={form.seoDescription}
          onChange={set("seoDescription")}
        />
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="row">
        <button
          className="button"
          disabled={busy}
          onClick={() => save("published")}
        >
          {busy ? "Saving…" : "Publish"}
        </button>
        <button
          className="text-button"
          disabled={busy}
          onClick={() => save("draft")}
        >
          Save Draft
        </button>
      </div>
      {isEvent && (
        <section className="panel">
          <h2>Ticket types</h2>
          {!savedId ? (
            <>
              <p>Save this event as a draft to add ticket types.</p>
              <button
                className="button"
                disabled={busy}
                onClick={() => save("draft", false)}
              >
                Save & Add Tickets
              </button>
            </>
          ) : (
            <TicketEditor
              eventId={savedId}
              initial={data.tickets.filter((t: any) => t.event_id === savedId)}
            />
          )}
        </section>
      )}
    </>
  );
}
function TicketEditor({ eventId, initial }: any) {
  const [tickets, setTickets] = useState(initial),
    [form, setForm] = useState<any>({
      name: "General Pass",
      price: 0,
      capacity: 100,
      status: "active",
      earlyBirdPrice: 0,
      earlyBirdDeadline: "",
      soldOut: false,
      premium: false,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (k: string) => (v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <>
      <div className="row">
        {tickets.map((t: any) => (
          <button className="pill" key={t.id} onClick={() => setForm(t)}>
            {t.name} · PKR {t.price}
          </button>
        ))}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const r = await api("ticket", { ...form, eventId });
            setTickets((prev: any) => [
              ...prev.filter((t: any) => t.id !== r.id),
              { ...form, id: r.id },
            ]);
            setForm({ name: "", price: 0, capacity: 100, status: "active" });
            setError("Ticket saved.");
          } catch (err: any) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid">
          <Field
            label="Pass name"
            value={form.name}
            onChange={set("name")}
            required
          />
          <Field
            label="Price (PKR; 0 for free)"
            type="number"
            min="0"
            value={form.price}
            onChange={(v: string) => set("price")(Number(v))}
            required
          />
          <Field
            label="Ticket capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(v: string) => set("capacity")(Number(v))}
            required
          />
          <Choice
            label="Status"
            value={form.status}
            onChange={set("status")}
            options={["active", "closed"]}
          />
          <Field
            label="Sale starts (Pakistan time)"
            type="datetime-local"
            value={form.saleStart?.slice(0, 16)}
            onChange={(v: string) => set("saleStart")(v ? v + ":00+05:00" : "")}
          />
          <Field
            label="Sale ends (Pakistan time)"
            type="datetime-local"
            value={form.saleEnd?.slice(0, 16)}
            onChange={(v: string) => set("saleEnd")(v ? v + ":00+05:00" : "")}
          />
          <Field
            label="Early-bird price (PKR)"
            type="number"
            min="0"
            value={form.earlyBirdPrice}
            onChange={(v: string) => set("earlyBirdPrice")(Number(v))}
          />
          <Field
            label="Early-bird deadline (Pakistan time)"
            type="datetime-local"
            value={form.earlyBirdDeadline?.slice(0, 16)}
            onChange={(v: string) =>
              set("earlyBirdDeadline")(v ? v + ":00+05:00" : "")
            }
          />
        </div>
        <div className="row">
          <label className="row">
            <Checkbox
              checked={Boolean(form.soldOut)}
              onCheckedChange={(v) => set("soldOut")(v === true)}
            />
            Mark SOLD OUT
          </label>
          <label className="row">
            <Checkbox
              checked={Boolean(form.premium)}
              onCheckedChange={(v) => set("premium")(v === true)}
            />
            Premium / VIP presentation
          </label>
        </div>
        <Area
          label="Description"
          value={form.description}
          onChange={set("description")}
        />
        <Area
          label="Benefits (one per line)"
          value={form.benefits}
          onChange={set("benefits")}
        />
        <p role="status">{error}</p>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : form.id ? "Update Ticket" : "Add Ticket"}
        </button>
      </form>
    </>
  );
}
