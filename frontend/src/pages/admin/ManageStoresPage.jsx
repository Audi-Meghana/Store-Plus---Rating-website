import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, CheckCircle, XCircle, Trash2, Edit3, Store,
  Star, MessageSquare, User, Phone, MapPin, Plus,
  AlertCircle, Loader2, Eye, RefreshCw, X,
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const spin  = `@keyframes spin{to{transform:rotate(360deg)}}`;
const Spin  = ({ s = 20 }) => <Loader2 size={s} style={{ animation: "spin 0.8s linear infinite", color: "#6366F1" }} />;
const Toast = ({ msg, type }) => (
  <div style={{
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    background: type === "success" ? "#166534" : "#991B1B",
    color: "#fff", borderRadius: 12, padding: "12px 20px",
    fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
    display: "flex", alignItems: "center", gap: 8,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  }}>
    {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
    {msg}
  </div>
);

const CATEGORIES = [
  "all","Restaurant","Cafe","Grocery","Clothing","Electronics",
  "Pharmacy","Salon","Gym","Bookstore","Hardware","Other",
];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "").replace(/\/$/, "");
const imgSrc   = (url) => !url ? null : url.startsWith("http") ? url : `${API_BASE}${url}`;

// ── status badge ──────────────────────────────────────────────────────────────
const Badge = ({ shop }) => {
  const active  = shop.isActive && shop.isVerified;
  const pending = shop.isActive && !shop.isVerified;
  const [bg, color, dot, label] = active
    ? ["#DCFCE7","#166534","#22C55E","Active"]
    : pending
    ? ["#FEF9C3","#854D0E","#EAB308","Pending"]
    : ["#FEE2E2","#991B1B","#EF4444","Inactive"];
  return (
    <span style={{ background: bg, color, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
      {label}
    </span>
  );
};

// ── field wrapper used in modals ──────────────────────────────────────────────
const MField = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);
const MInput = ({ value, onChange, placeholder = "", type = "text" }) => (
  <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border-color .2s" }}
    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
    onBlur={(e)  => (e.target.style.borderColor = "#E5E7EB")}
  />
);
const MSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", background: "#fff", cursor: "pointer" }}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

// ════════════════════════════════════════════════════════════════════
// EDIT MODAL
// ════════════════════════════════════════════════════════════════════
const EditModal = ({ shop, onClose, onSaved, toast }) => {
  const [f, setF] = useState({
    name:        shop.name              ?? "",
    category:    shop.category          ?? "",
    phone:       shop.phone             ?? "",
    website:     shop.website           ?? "",
    description: shop.description       ?? "",
    address:     shop.location?.address ?? "",
    city:        shop.location?.city    ?? "",
    isVerified:  shop.isVerified        ?? false,
    isActive:    shop.isActive          ?? true,
  });
  const [saving, setSaving] = useState(false);
  const s = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.name) { toast("Name is required", "error"); return; }
    try {
      setSaving(true);
      await api.patch(`/admin/shops/${shop._id}`, {
        name: f.name, category: f.category, phone: f.phone,
        website: f.website, description: f.description,
        isVerified: f.isVerified, isActive: f.isActive,
        location: { address: f.address, city: f.city },
      });
      onSaved();
    } catch (e) { toast(e.response?.data?.message ?? "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>Edit Shop</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <MField label="Shop Name *"><MInput value={f.name} onChange={s("name")} /></MField>
          <MField label="Category">
            <MSelect value={f.category} onChange={s("category")} options={CATEGORIES.filter(c => c !== "all").map(c => [c, c])} />
          </MField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MField label="Phone"><MInput value={f.phone} onChange={s("phone")} /></MField>
            <MField label="Website"><MInput value={f.website} onChange={s("website")} /></MField>
            <MField label="City"><MInput value={f.city} onChange={s("city")} /></MField>
            <MField label="Address"><MInput value={f.address} onChange={s("address")} /></MField>
          </div>
          <MField label="Description">
            <textarea value={f.description} onChange={(e) => s("description")(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }} />
          </MField>
          <div style={{ display: "flex", gap: 20 }}>
            {[["isVerified", "Verified"], ["isActive", "Active"]].map(([key, lbl]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <input type="checkbox" checked={f[key]} onChange={(e) => s(key)(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#6366F1" }} />
                {lbl}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spin s={14} /> : null} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADD MODAL
// ════════════════════════════════════════════════════════════════════
const AddModal = ({ onClose, onSaved, toast }) => {
  const [f, setF] = useState({ name: "", category: "", phone: "", website: "", description: "", address: "", city: "", ownerEmail: "" });
  const [saving, setSaving] = useState(false);
  const s = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.name || !f.category) { toast("Name and category are required", "error"); return; }
    try {
      setSaving(true);
      await api.post("/admin/shops", {
        name: f.name, category: f.category, phone: f.phone,
        website: f.website, description: f.description,
        ownerEmail: f.ownerEmail || undefined,
        location: { address: f.address, city: f.city },
      });
      onSaved();
    } catch (e) { toast(e.response?.data?.message ?? "Failed to add shop", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>Add New Shop</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <MField label="Shop Name *"><MInput value={f.name} onChange={s("name")} placeholder="e.g. The Coffee House" /></MField>
          <MField label="Category *">
            <MSelect value={f.category} onChange={s("category")} options={[["", "Select category…"], ...CATEGORIES.filter(c => c !== "all").map(c => [c, c])]} />
          </MField>
          <MField label="Owner Email (optional)"><MInput value={f.ownerEmail} onChange={s("ownerEmail")} placeholder="owner@email.com" type="email" /></MField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MField label="Phone"><MInput value={f.phone} onChange={s("phone")} /></MField>
            <MField label="Website"><MInput value={f.website} onChange={s("website")} /></MField>
            <MField label="City"><MInput value={f.city} onChange={s("city")} /></MField>
            <MField label="Address"><MInput value={f.address} onChange={s("address")} /></MField>
          </div>
          <MField label="Description">
            <textarea value={f.description} onChange={(e) => s("description")(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }} />
          </MField>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spin s={14} /> : <Plus size={14} />} Add Shop
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// DELETE CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════
const DeleteModal = ({ shop, onClose, onConfirm, loading }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 420, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ width: 64, height: 64, background: "#FEE2E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Trash2 size={30} style={{ color: "#EF4444" }} />
      </div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#0F172A", marginBottom: 10 }}>Delete Shop?</h2>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
        <strong>"{shop.name}"</strong> and all its reviews will be permanently deleted. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onClose} style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, opacity: loading ? 0.7 : 1 }}>
          {loading ? <Spin s={14} /> : <Trash2 size={14} />} Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
const ManageStoresPage = () => {
  const navigate = useNavigate();

  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("all");
  const [category, setCategory] = useState("all");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 10;

  const [busy,    setBusy]    = useState({});  // { [shopId]: true }
  const [toast,   setToast]   = useState(null);
  const [delShop, setDelShop] = useState(null);
  const [editShop,setEditShop]= useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── fetch ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const p = new URLSearchParams({ page, limit: LIMIT });
      if (search)            p.set("search",   search);
      if (status   !== "all") p.set("status",   status);
      if (category !== "all") p.set("category", category);

      const res  = await api.get(`/admin/shops?${p}`);
      const root = res?.data ?? res;
      setShops(Array.isArray(root?.shops) ? root.shops : []);
      setTotal(root?.total ?? 0);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load shops");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, category]);

  // ── actions ───────────────────────────────────────────────────────
  const mark = (id, val) => setBusy((b) => ({ ...b, [id]: val }));

  const approve = async (shop) => {
    mark(shop._id, true);
    try {
      await api.patch(`/admin/shops/${shop._id}/approve`);
      showToast(`"${shop.name}" approved and live`);
      load();
    } catch (e) { showToast(e.response?.data?.message ?? "Failed", "error"); }
    finally { mark(shop._id, false); }
  };

  const reject = async (shop) => {
    mark(shop._id, true);
    try {
      await api.patch(`/admin/shops/${shop._id}/reject`);
      showToast(`"${shop.name}" rejected`);
      load();
    } catch (e) { showToast(e.response?.data?.message ?? "Failed", "error"); }
    finally { mark(shop._id, false); }
  };

  const confirmDelete = async () => {
    if (!delShop) return;
    mark(delShop._id, true);
    try {
      await api.delete(`/admin/shops/${delShop._id}`);
      showToast(`"${delShop.name}" deleted`);
      setDelShop(null);
      load();
    } catch (e) { showToast(e.response?.data?.message ?? "Failed", "error"); }
    finally { mark(delShop._id, false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // ── stat counts from current page (approximate) ───────────────────
  const counts = {
    total,
    pending:  shops.filter((s) =>  s.isActive && !s.isVerified).length,
    active:   shops.filter((s) =>  s.isActive &&  s.isVerified).length,
    inactive: shops.filter((s) => !s.isActive).length,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FB", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ${spin}
        .btn { display:inline-flex;align-items:center;gap:5px;border:none;border-radius:9px;padding:6px 11px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity .15s; }
        .btn:disabled { opacity:.5;cursor:not-allowed; }
        .btn:hover:not(:disabled) { opacity:.85; }
        .row { display:grid;grid-template-columns:2fr 1.3fr 0.9fr 0.9fr 1.7fr;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid #F1F5F9;transition:background .15s; }
        .row:hover { background:#FAFBFF; }
        .row:last-child { border-bottom:none; }
        .th { font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em; }
        input:focus,select:focus { outline:none; }
        @media(max-width:860px){ .row{ grid-template-columns:1fr; } }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, padding: "30px 26px", overflow: "auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.65rem", fontWeight: 800, color: "#0F172A" }}>Manage Shops</h1>
            <p style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>{total} shops total</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn" style={{ background: "#F1F5F9", color: "#374151", padding: "9px 15px", fontSize: 13 }} onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn" style={{ background: "#6366F1", color: "#fff", padding: "9px 15px", fontSize: 13 }} onClick={() => setAddOpen(true)}>
              <Plus size={13} /> Add Shop
            </button>
          </div>
        </div>

        {/* ── Stat pills ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            { label: "Total",    val: counts.total,    bg: "#EEF2FF", color: "#4338CA" },
            { label: "Pending",  val: counts.pending,  bg: "#FEF9C3", color: "#854D0E" },
            { label: "Active",   val: counts.active,   bg: "#DCFCE7", color: "#166534" },
            { label: "Inactive", val: counts.inactive, bg: "#FEE2E2", color: "#991B1B" },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, opacity: .75, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, city, owner…"
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px 9px 34px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: "#fff" }} />
          </div>
          {[
            { val: status,   set: setStatus,   opts: [["all","All Status"],["pending","Pending"],["active","Active"],["inactive","Inactive"]] },
            { val: category, set: setCategory, opts: CATEGORIES.map((c) => [c, c === "all" ? "All Categories" : c]) },
          ].map((sel, i) => (
            <select key={i} value={sel.val} onChange={(e) => sel.set(e.target.value)}
              style={{ border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: "#fff", cursor: "pointer" }}>
              {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "11px 15px", color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── Table ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F1F5F9", overflow: "hidden" }}>

          {/* Header row */}
          <div className="row" style={{ background: "#F8F9FB", borderBottom: "1.5px solid #F1F5F9" }}>
            {["Shop", "Owner / Contact", "Stats", "Status", "Actions"].map((h) => (
              <span key={h} className="th">{h}</span>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ padding: 56, display: "flex", justifyContent: "center" }}><Spin s={32} /></div>
          ) : shops.length === 0 ? (
            <div style={{ padding: 56, textAlign: "center", color: "#9CA3AF" }}>
              <Store size={44} style={{ margin: "0 auto 12px", opacity: .25 }} />
              <p style={{ fontSize: 14 }}>No shops found.</p>
            </div>
          ) : shops.map((shop) => {
            const id  = shop._id ?? shop.id;
            const img = imgSrc(shop.cover?.url ?? shop.logo?.url);
            const isBusy = busy[id];

            return (
              <div key={id} className="row">

                {/* Shop info */}
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, overflow: "hidden", background: "#F1F5F9", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {img
                      ? <img src={img} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                      : <Store size={18} style={{ color: "#CBD5E1" }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{shop.name}</div>
                    {shop.location?.city && (
                      <div style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                        <MapPin size={9} /> {shop.location.city}
                      </div>
                    )}
                    {shop.category && (
                      <span style={{ fontSize: 10, background: "#EEF2FF", color: "#4338CA", borderRadius: 5, padding: "1px 7px", fontWeight: 700, marginTop: 3, display: "inline-block" }}>
                        {shop.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Owner */}
                <div style={{ fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, color: "#374151" }}>
                    <User size={11} /> {shop.owner?.name ?? "—"}
                  </div>
                  {shop.owner?.email && <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{shop.owner.email}</div>}
                  {shop.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>
                      <Phone size={9} /> {shop.phone}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#0F172A" }}>
                    <Star size={12} style={{ fill: "#FBBF24", color: "#FBBF24" }} />
                    {Number(shop.avgRating ?? 0).toFixed(1)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF", marginTop: 3 }}>
                    <MessageSquare size={10} /> {shop.reviewCount ?? 0}
                  </div>
                </div>

                {/* Status */}
                <div><Badge shop={shop} /></div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {isBusy ? <Spin s={18} /> : (
                    <>
                      {/* Approve — show when pending */}
                      {shop.isActive && !shop.isVerified && (
                        <button className="btn" style={{ background: "#DCFCE7", color: "#166534" }} onClick={() => approve(shop)}>
                          <CheckCircle size={11} /> Approve
                        </button>
                      )}
                      {/* Reject — show when active */}
                      {shop.isActive && shop.isVerified && (
                        <button className="btn" style={{ background: "#FEF9C3", color: "#854D0E" }} onClick={() => reject(shop)}>
                          <XCircle size={11} /> Reject
                        </button>
                      )}
                      {/* Re-activate — show when inactive */}
                      {!shop.isActive && (
                        <button className="btn" style={{ background: "#DCFCE7", color: "#166534" }} onClick={() => approve(shop)}>
                          <CheckCircle size={11} /> Activate
                        </button>
                      )}
                      <button className="btn" style={{ background: "#F1F5F9", color: "#374151" }} onClick={() => navigate(`/store/${id}`)}>
                        <Eye size={11} /> View
                      </button>
                      <button className="btn" style={{ background: "#EEF2FF", color: "#4338CA" }} onClick={() => setEditShop(shop)}>
                        <Edit3 size={11} /> Edit
                      </button>
                      <button className="btn" style={{ background: "#FEE2E2", color: "#991B1B" }} onClick={() => setDelShop(shop)}>
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 22 }}>
            <button className="btn" style={{ background: "#F1F5F9", color: "#374151", padding: "8px 14px" }} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className="btn" onClick={() => setPage(p)}
                style={{ padding: "8px 13px", background: p === page ? "#6366F1" : "#F1F5F9", color: p === page ? "#fff" : "#374151" }}>
                {p}
              </button>
            ))}
            <button className="btn" style={{ background: "#F1F5F9", color: "#374151", padding: "8px 14px" }} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {delShop  && <DeleteModal shop={delShop}  onClose={() => setDelShop(null)}  onConfirm={confirmDelete} loading={!!busy[delShop._id]} />}
      {editShop && <EditModal   shop={editShop} onClose={() => setEditShop(null)} onSaved={() => { setEditShop(null); load(); showToast("Shop updated"); }} toast={showToast} />}
      {addOpen  && <AddModal    onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); load(); showToast("Shop added"); }} toast={showToast} />}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default ManageStoresPage;