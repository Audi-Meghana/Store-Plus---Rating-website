import { MapPin, Phone, Globe, Instagram, Facebook, Clock, Navigation, CheckCircle, ExternalLink } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const getHoursLabel = (hrs) => {
  if (!hrs) return { label: "Closed", open: false };
  if (typeof hrs === "string") return { label: hrs || "Closed", open: hrs.toLowerCase() !== "closed" };
  if (hrs.open === false || hrs.open === "false") return { label: "Closed", open: false };
  if (hrs.from && hrs.to) return { label: `${hrs.from} – ${hrs.to}`, open: true };
  if (hrs.open) return { label: "Open", open: true };
  return { label: "Closed", open: false };
};

const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

/* ── StoreInfo ── */
const StoreInfo = ({ shop }) => {
  if (!shop) return null;

  const { location, phone, website, instagram, facebook, hours, isVerified, isOpen } = shop;
  const hasLocation = location?.address || location?.city;
  const hasHours    = hours && typeof hours === "object" && Object.keys(hours).length > 0;
  const mapsUrl     = location?.lat && location?.lng
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : location?.address
    ? `https://www.google.com/maps/search/${encodeURIComponent(location.address)}`
    : null;

  const cleanUrl = (url) => url?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Contact & Location ── */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F1F5F9", padding: "18px 18px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          Store Info
          {isVerified && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "#DCFCE7", color: "#15803D" }}><CheckCircle size={9} /> Verified</span>}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Status */}
          <InfoRow icon={Clock} iconColor="#4F46E5">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: isOpen ? "#DCFCE7" : "#FEE2E2", color: isOpen ? "#15803D" : "#DC2626" }}>
              ● {isOpen ? "Open Now" : "Closed"}
            </span>
          </InfoRow>

          {/* Address */}
          {hasLocation && (
            <InfoRow icon={MapPin} iconColor="#EF4444">
              <span style={{ fontSize: 13, color: "#374151" }}>
                {[location.address, location.city, location.state, location.pincode].filter(Boolean).join(", ")}
              </span>
            </InfoRow>
          )}

          {/* Landmark */}
          {location?.landmark && (
            <InfoRow icon={Navigation} iconColor="#F59E0B">
              <span style={{ fontSize: 12, color: "#6B7280" }}>Near {location.landmark}</span>
            </InfoRow>
          )}

          {/* Phone */}
          {phone && (
            <InfoRow icon={Phone} iconColor="#16A34A">
              <a href={`tel:${phone}`} style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>{phone}</a>
            </InfoRow>
          )}

          {/* Website */}
          {website && (
            <InfoRow icon={Globe} iconColor="#2563EB">
              <a href={website} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                {cleanUrl(website)} <ExternalLink size={11} />
              </a>
            </InfoRow>
          )}

          {/* Instagram */}
          {instagram && (
            <InfoRow icon={Instagram} iconColor="#E1306C">
              <a href={`https://instagram.com/${instagram.replace("@","")}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#E1306C", textDecoration: "none" }}>
                @{instagram.replace("@","")}
              </a>
            </InfoRow>
          )}

          {/* Facebook */}
          {facebook && (
            <InfoRow icon={Facebook} iconColor="#1877F2">
              <a href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#1877F2", textDecoration: "none" }}>
                {cleanUrl(facebook)}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Directions button */}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            marginTop: 14, padding: "11px 0", borderRadius: 12,
            background: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
            color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 12px rgba(29,78,216,0.28)",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Navigation size={14} /> Get Directions
          </a>
        )}
      </div>

      {/* ── Opening Hours ── */}
      {hasHours && (
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F1F5F9", padding: "18px 18px" }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} style={{ color: "#4F46E5" }} /> Opening Hours
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {DAYS.map(day => {
              const { label, open } = getHoursLabel(hours[day]);
              const isToday = day === today;
              return (
                <div key={day} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 9, marginBottom: 2,
                  background: isToday ? "#EFF6FF" : "transparent",
                  border: isToday ? "1px solid #BFDBFE" : "1px solid transparent",
                }}>
                  <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 600, color: isToday ? "#1D4ED8" : "#374151" }}>
                    {day.slice(0,3)}
                    {isToday && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 5, color: "#2563EB", background: "#BFDBFE", padding: "1px 5px", borderRadius: 100 }}>Today</span>}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: open ? "#16A34A" : "#DC2626" }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── InfoRow helper ── */
const InfoRow = ({ icon: Icon, iconColor, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
    <div style={{ width: 30, height: 30, borderRadius: 9, background: `${iconColor}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
      <Icon size={13} style={{ color: iconColor }} />
    </div>
    <div style={{ flex: 1, paddingTop: 5 }}>{children}</div>
  </div>
);

export default StoreInfo;