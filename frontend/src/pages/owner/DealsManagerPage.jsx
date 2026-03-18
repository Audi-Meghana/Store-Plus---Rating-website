import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Edit3, CheckCircle2, X, Save, Calendar,
  AlertCircle, ToggleLeft, ToggleRight, Percent,
  Gift, ShoppingBag, Package, Tag, Menu,
} from "lucide-react";
import api from "../../services/api";
import Sidebar, { useSidebar, MobileMenuButton } from "../../components/common/Sidebar";

const DEAL_TYPES = [
  { value:"Discount %",  label:"Discount %",  icon:Percent,     bg:"#EFF6FF", color:"#2563EB", border:"#BFDBFE" },
  { value:"Flat Off ₹",  label:"Flat Off ₹",  icon:Tag,         bg:"#F0FDF4", color:"#16A34A", border:"#BBF7D0" },
  { value:"Buy 1 Get 1", label:"Buy 1 Get 1", icon:Gift,        bg:"#F5F3FF", color:"#7C3AED", border:"#DDD6FE" },
  { value:"Free Item",   label:"Free Item",   icon:ShoppingBag, bg:"#FDF2F8", color:"#DB2777", border:"#FBCFE8" },
  { value:"Combo Offer", label:"Combo Offer", icon:Package,     bg:"#FFF7ED", color:"#EA580C", border:"#FED7AA" },
];

const EMPTY_FORM = { title:"", type:"Discount %", value:"", description:"", expiry:"", active:true };
const dealTypeConfig = (type) => DEAL_TYPES.find(d => d.value === type) ?? DEAL_TYPES[0];
const formatExpiry   = (d)    => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "No expiry";
const isExpired      = (d)    => d && new Date(d) < new Date();

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position:"fixed", bottom:20, right:16, left:16, zIndex:50,
    display:"flex", alignItems:"center", gap:10,
    padding:"13px 16px", borderRadius:16,
    boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
    background: type === "success" ? "#16A34A" : "#DC2626",
    color:"#fff", fontSize:13, fontWeight:600,
    fontFamily:"'DM Sans',sans-serif",
  }}>
    {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
    <span style={{ flex:1 }}>{message}</span>
    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.8)", padding:2 }}><X size={14} /></button>
  </div>
);

/* ── Deal Modal ── */
const DealModal = ({ deal, onSave, onClose, saving }) => {
  const [form,   setForm]   = useState(deal ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]:"" })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.value.trim()) e.value = "Value is required";
    if (form.expiry && new Date(form.expiry) < new Date()) e.expiry = "Expiry must be in the future";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const s = { fontFamily:"'DM Sans',sans-serif" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:40, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)", ...s }}>

        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
          <div style={{ width:40, height:4, borderRadius:100, background:"#E5E7EB" }} />
        </div>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px 14px", borderBottom:"1px solid #F1F5F9" }}>
          <div>
            <h2 style={{ fontSize:16, fontWeight:800, color:"#0F172A", margin:0 }}>{deal ? "Edit Deal" : "Create Deal"}</h2>
            <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{deal ? "Update your promotion" : "Add a new promotion"}</p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:"#F3F4F6", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6B7280" }}><X size={15} /></button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Title */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Deal Title</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Weekend Special 20% Off"
              style={{ width:"100%", border:`1.5px solid ${errors.title ? "#FCA5A5" : "#E5E7EB"}`, borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background: errors.title ? "#FEF2F2" : "#fff" }} />
            {errors.title && <p style={{ fontSize:11, color:"#DC2626", marginTop:4, display:"flex", alignItems:"center", gap:4 }}><AlertCircle size={10} />{errors.title}</p>}
          </div>

          {/* Deal type */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>Deal Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7 }}>
              {DEAL_TYPES.map(t => {
                const Icon     = t.icon;
                const selected = form.type === t.value;
                return (
                  <button key={t.value} onClick={() => set("type", t.value)} style={{
                    display:"flex", alignItems:"center", gap:7, padding:"10px 12px", borderRadius:12, cursor:"pointer",
                    border:`1.5px solid ${selected ? t.border : "#E5E7EB"}`,
                    background: selected ? t.bg : "#fff",
                    color:      selected ? t.color : "#6B7280",
                    fontSize:12, fontWeight:700, fontFamily:"inherit",
                    boxShadow: selected ? `0 0 0 2px ${t.border}` : "none",
                  }}>
                    <Icon size={13} />{t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
              Value <span style={{ fontWeight:400, color:"#9CA3AF" }}>{form.type === "Discount %" ? "(e.g. 20)" : form.type === "Flat Off ₹" ? "(e.g. 100)" : "(e.g. Free coffee)"}</span>
            </label>
            <div style={{ position:"relative" }}>
              {(form.type === "Discount %" || form.type === "Flat Off ₹") && (
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", fontSize:13 }}>
                  {form.type === "Discount %" ? "%" : "₹"}
                </span>
              )}
              <input value={form.value} onChange={e => set("value", e.target.value)} placeholder="Enter value"
                style={{ width:"100%", border:`1.5px solid ${errors.value ? "#FCA5A5" : "#E5E7EB"}`, borderRadius:12, padding:"10px 14px", paddingLeft:(form.type === "Discount %" || form.type === "Flat Off ₹") ? 30 : 14, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
            </div>
            {errors.value && <p style={{ fontSize:11, color:"#DC2626", marginTop:4, display:"flex", alignItems:"center", gap:4 }}><AlertCircle size={10} />{errors.value}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Description <span style={{ fontWeight:400, color:"#9CA3AF" }}>(optional)</span></label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Terms or conditions…" rows={3}
              style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"inherit", outline:"none", resize:"none", boxSizing:"border-box" }} />
          </div>

          {/* Expiry */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Expiry Date <span style={{ fontWeight:400, color:"#9CA3AF" }}>(optional)</span></label>
            <div style={{ position:"relative" }}>
              <Calendar size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />
              <input type="date" value={form.expiry} min={new Date().toISOString().split("T")[0]} onChange={e => set("expiry", e.target.value)}
                style={{ width:"100%", border:`1.5px solid ${errors.expiry ? "#FCA5A5" : "#E5E7EB"}`, borderRadius:12, padding:"10px 14px 10px 34px", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
            </div>
            {errors.expiry && <p style={{ fontSize:11, color:"#DC2626", marginTop:4 }}>{errors.expiry}</p>}
          </div>

          {/* Active toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F8FAFC", borderRadius:12, padding:"12px 14px" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#374151", margin:0 }}>Active</p>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>Customers see this immediately</p>
            </div>
            <button onClick={() => set("active", !form.active)} style={{ background:"none", border:"none", cursor:"pointer", color: form.active ? "#16A34A" : "#9CA3AF" }}>
              {form.active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", gap:10, padding:"14px 18px 20px", borderTop:"1px solid #F1F5F9" }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"#374151" }}>Cancel</button>
          <button onClick={() => validate() && onSave(form)} disabled={saving} style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"12px", borderRadius:12, border:"none", background: saving ? "#86EFAC" : "#16A34A", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {saving ? <><svg style={{animation:"spin 0.8s linear infinite",width:14,height:14}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</> : <><Save size={14} />{deal ? "Update Deal" : "Create Deal"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Deal Card ── */
const DealCard = ({ deal, onToggle, onEdit, onDelete }) => {
  const expired  = isExpired(deal.expiry);
  const config   = dealTypeConfig(deal.type);
  const TypeIcon = config.icon;

  return (
    <div style={{
      background:"#fff", borderRadius:16,
      border:`1.5px solid ${expired ? "#FECACA" : "#F1F5F9"}`,
      padding:"14px 14px", opacity: !deal.active ? 0.65 : 1,
      transition:"box-shadow 0.2s",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:config.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1.5px solid ${config.border}` }}>
          <TypeIcon size={16} style={{ color:config.color }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:4 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{deal.title}</span>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, background:config.bg, color:config.color, border:`1px solid ${config.border}` }}>{deal.type}</span>
            {expired && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA" }}>Expired</span>}
            {!deal.active && !expired && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, background:"#F3F4F6", color:"#6B7280" }}>Paused</span>}
          </div>
          {deal.description && <p style={{ fontSize:12, color:"#6B7280", margin:"0 0 6px", lineHeight:1.5 }}>{deal.description}</p>}
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            {deal.value && <span style={{ fontSize:13, fontWeight:800, color:"#0F172A" }}>{deal.type === "Discount %" ? `${deal.value}% off` : deal.type === "Flat Off ₹" ? `₹${deal.value} off` : deal.value}</span>}
            <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#9CA3AF" }}><Calendar size={10} />{formatExpiry(deal.expiry)}</span>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
          <button onClick={() => onToggle(deal._id)} style={{ width:30, height:30, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:"#F3F4F6", color: deal.active ? "#16A34A" : "#9CA3AF" }} title={deal.active ? "Pause" : "Activate"}>
            {deal.active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
          </button>
          <button onClick={() => onEdit(deal)} style={{ width:30, height:30, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:"#F3F4F6", color:"#6B7280" }}><Edit3 size={13} /></button>
          <button onClick={() => onDelete(deal._id)} style={{ width:30, height:30, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:"#FEF2F2", color:"#DC2626" }}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const DealsManagerPage = () => {
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();
  const [deals,   setDeals]   = useState([]);
  const [modal,   setModal]   = useState(null);
  const [toast,   setToast]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    api.get("/deals")
      .then(res => setDeals(Array.isArray(res?.data?.data ?? res?.data) ? (res?.data?.data ?? res?.data) : []))
      .catch(() => showToast("Failed to load deals", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form._id) {
        const res = await api.put(`/deals/${form._id}`, form);
        setDeals(p => p.map(d => d._id === form._id ? (res?.data?.data ?? res?.data) : d));
        showToast("Deal updated");
      } else {
        const res = await api.post("/deals", form);
        setDeals(p => [...p, res?.data?.data ?? res?.data]);
        showToast("Deal created");
      }
      setModal(null);
    } catch (err) { showToast(err?.response?.data?.message || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try { await api.delete(`/deals/${id}`); setDeals(p => p.filter(d => d._id !== id)); showToast("Deleted", "error"); }
    catch { showToast("Failed to delete", "error"); }
  };

  const handleToggle = async (id) => {
    const deal    = deals.find(d => d._id === id);
    const updated = { ...deal, active: !deal.active };
    setDeals(p => p.map(d => d._id === id ? updated : d));
    try { await api.put(`/deals/${id}`, updated); showToast(updated.active ? "Activated" : "Paused"); }
    catch { setDeals(p => p.map(d => d._id === id ? deal : d)); showToast("Update failed", "error"); }
  };

  const activeDeals  = deals.filter(d => d.active && !isExpired(d.expiry));
  const pausedDeals  = deals.filter(d => !d.active);
  const expiredDeals = deals.filter(d =>  isExpired(d.expiry));

  const Section = ({ title, dotColor, list }) => list.length === 0 ? null : (
    <section style={{ marginBottom:4 }}>
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#9CA3AF", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:dotColor, display:"inline-block" }} /> {title} ({list.length})
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {list.map(deal => <DealCard key={deal._id} deal={deal} onToggle={handleToggle} onEdit={setModal} onDelete={handleDelete} />)}
      </div>
    </section>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F8F9FB", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <header style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <MobileMenuButton onClick={openMobile} role="shop_owner" />
            <div>
              <h1 style={{ fontSize:17, fontWeight:800, color:"#0F172A", margin:0 }}>Deals & Promotions</h1>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{activeDeals.length} active · {pausedDeals.length} paused · {expiredDeals.length} expired</p>
            </div>
          </div>
          <button onClick={() => setModal("create")} style={{ display:"flex", alignItems:"center", gap:6, background:"#16A34A", color:"#fff", border:"none", borderRadius:12, padding:"9px 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(22,163,74,0.3)" }}>
            <Plus size={15} /> New Deal
          </button>
        </header>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 40px" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:180, gap:10 }}>
              <svg style={{ animation:"spin 0.8s linear infinite", width:24, height:24, color:"#16A34A" }} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <p style={{ fontSize:12, color:"#9CA3AF" }}>Loading deals…</p>
            </div>
          ) : deals.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:240, textAlign:"center", gap:12 }}>
              <div style={{ width:56, height:56, background:"#F0FDF4", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}><Tag size={24} style={{ color:"#16A34A" }} /></div>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:"#0F172A", margin:"0 0 4px" }}>No deals yet</p>
                <p style={{ fontSize:12, color:"#9CA3AF", margin:0 }}>Create your first promotion to attract customers.</p>
              </div>
              <button onClick={() => setModal("create")} style={{ display:"flex", alignItems:"center", gap:6, background:"#16A34A", color:"#fff", border:"none", borderRadius:12, padding:"11px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                <Plus size={14} /> Create First Deal
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <Section title="Active"  dotColor="#22C55E" list={activeDeals}  />
              <Section title="Paused"  dotColor="#9CA3AF" list={pausedDeals}  />
              <Section title="Expired" dotColor="#EF4444" list={expiredDeals} />
            </div>
          )}
        </div>
      </div>

      {modal && <DealModal deal={modal === "create" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DealsManagerPage;