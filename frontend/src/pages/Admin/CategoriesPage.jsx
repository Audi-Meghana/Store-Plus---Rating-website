import { useState, useEffect } from "react";
import {
  Plus, Edit3, Trash2, Loader2, AlertCircle,
  CheckCircle, RefreshCw, X, Tag, Store, Zap,
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

const spin = `@keyframes spin{to{transform:rotate(360deg)}}`;
const Spin = ({ s = 20 }) => (
  <><style>{spin}</style><Loader2 size={s} style={{ animation: "spin 0.8s linear infinite", color: "#6366F1" }} /></>
);
const Toast = ({ msg, type }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "success" ? "#166534" : "#991B1B", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
    {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg}
  </div>
);

const PRESET_ICONS  = ["🏪","🍽️","☕","🛒","👗","💻","💊","✂️","💪","📚","🔧","🎮","🎨","🏥","🚗","🌿","🍕","🧴","👟","🏠"];
const PRESET_COLORS = ["#6366F1","#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899","#14B8A6","#F97316","#06B6D4","#84CC16","#64748B"];

// ── Modal ─────────────────────────────────────────────────────────────────────
const CategoryModal = ({ cat, onClose, onSaved, showToast }) => {
  const isEdit = !!cat;
  const [f, setF] = useState({
    name:        cat?.name        ?? "",
    description: cat?.description ?? "",
    icon:        cat?.icon        ?? "🏪",
    color:       cat?.color       ?? "#6366F1",
    isActive:    cat?.isActive    ?? true,
  });
  const [saving, setSaving] = useState(false);
  const s = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) { showToast("Name is required", "error"); return; }
    try {
      setSaving(true);
      if (isEdit) {
        await api.patch(`/categories/${cat._id}`, f);
      } else {
        await api.post("/categories", f);
      }
      onSaved();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>
            {isEdit ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
        </div>

        {/* Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#F8F9FB", borderRadius: 14, padding: "14px 18px", marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            {f.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{f.name || "Category Name"}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{f.description || "No description"}</div>
          </div>
          <div style={{ marginLeft: "auto", width: 12, height: 12, borderRadius: "50%", background: f.isActive ? "#22C55E" : "#EF4444" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Name *</label>
            <input value={f.name} onChange={(e) => s("name")(e.target.value)} placeholder="e.g. Electronics"
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Description</label>
            <input value={f.description} onChange={(e) => s("description")(e.target.value)} placeholder="Short description…"
              style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 13px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
          </div>

          {/* Icon picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESET_ICONS.map((ic) => (
                <button key={ic} onClick={() => s("icon")(ic)}
                  style={{ width: 38, height: 38, borderRadius: 10, fontSize: 20, border: `2px solid ${f.icon === ic ? "#6366F1" : "#E5E7EB"}`, background: f.icon === ic ? "#EEF2FF" : "#fff", cursor: "pointer" }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Color</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => s("color")(c)}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${f.color === c ? "#0F172A" : "transparent"}`, cursor: "pointer" }} />
              ))}
              <input type="color" value={f.color} onChange={(e) => s("color")(e.target.value)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E5E7EB", cursor: "pointer", padding: 2 }} />
            </div>
          </div>

          {/* Active toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={f.isActive} onChange={(e) => s("isActive")(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#6366F1" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Active (visible to users)</span>
          </label>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button onClick={onClose} style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spin s={14} /> : null}
            {isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm ────────────────────────────────────────────────────────────
const DeleteModal = ({ cat, onClose, onConfirm, loading }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ width: 64, height: 64, background: "#FEE2E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Trash2 size={30} style={{ color: "#EF4444" }} />
      </div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#0F172A", marginBottom: 10 }}>Delete Category?</h2>
      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
        Delete <strong>"{cat.name}"</strong>? Shops using this category must be reassigned first.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onClose} style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7, opacity: loading ? 0.7 : 1 }}>
          {loading ? <Spin s={14} /> : <Trash2 size={14} />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
const CategoriesPage = () => {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showAll, setShowAll] = useState(true);

  const [toast,     setToast]     = useState(null);
  const [editCat,   setEditCat]   = useState(null);  // null = closed, {} = add, cat = edit
  const [delCat,    setDelCat]    = useState(null);
  const [delBusy,   setDelBusy]   = useState(false);
  const [seeding,   setSeeding]   = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      setLoading(true); setError("");
      const res  = await api.get(`/categories?all=${showAll}`);
      const root = res?.data ?? res;
      setCats(Array.isArray(root?.categories) ? root.categories : []);
    } catch (e) {
      setError(e.response?.data?.message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showAll]);

  const handleDelete = async () => {
    if (!delCat) return;
    try {
      setDelBusy(true);
      await api.delete(`/categories/${delCat._id}`);
      showToast(`"${delCat.name}" deleted`);
      setDelCat(null);
      load();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Failed to delete", "error");
    } finally {
      setDelBusy(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await api.post("/categories/seed");
      showToast("Default categories seeded");
      load();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Seed failed", "error");
    } finally {
      setSeeding(false);
    }
  };

  const totalShops = cats.reduce((a, c) => a + (c.shopCount ?? 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FB", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ${spin}
        .btn { display:inline-flex;align-items:center;gap:6px;border:none;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity .15s; }
        .btn:disabled { opacity:.5;cursor:not-allowed; }
        .btn:hover:not(:disabled) { opacity:.85; }
        .cat-card { background:#fff;border-radius:16px;border:1.5px solid #F1F5F9;padding:20px;transition:box-shadow .2s,transform .2s; }
        .cat-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.07);transform:translateY(-2px); }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, padding: "30px 26px", overflow: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.65rem", fontWeight: 800, color: "#0F172A" }}>Categories</h1>
            <p style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>{cats.length} categories · {totalShops} shops</p>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="btn" style={{ background: "#F1F5F9", color: "#374151" }} onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn" style={{ background: "#FEF9C3", color: "#854D0E" }} onClick={handleSeed} disabled={seeding}>
              {seeding ? <Spin s={13} /> : <Zap size={13} />} Seed Defaults
            </button>
            <button className="btn" style={{ background: "#6366F1", color: "#fff", padding: "8px 16px" }} onClick={() => setEditCat({})}>
              <Plus size={13} /> Add Category
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: "#6366F1" }} />
            Show inactive categories
          </label>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total",    val: cats.length,                             bg: "#EEF2FF", color: "#4338CA" },
            { label: "Active",   val: cats.filter(c => c.isActive).length,     bg: "#DCFCE7", color: "#166534" },
            { label: "Inactive", val: cats.filter(c => !c.isActive).length,    bg: "#FEE2E2", color: "#991B1B" },
            { label: "Shops",    val: totalShops,                              bg: "#FEF9C3", color: "#854D0E" },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne',sans-serif", color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, opacity: .75, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "11px 15px", color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ padding: 56, display: "flex", justifyContent: "center" }}><Spin s={32} /></div>
        ) : cats.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F1F5F9", padding: 56, textAlign: "center", color: "#9CA3AF" }}>
            <Tag size={44} style={{ margin: "0 auto 12px", opacity: .25 }} />
            <p style={{ fontSize: 14, marginBottom: 16 }}>No categories yet.</p>
            <button className="btn" style={{ background: "#6366F1", color: "#fff" }} onClick={handleSeed} disabled={seeding}>
              {seeding ? <Spin s={13} /> : <Zap size={13} />} Seed Default Categories
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
            {cats.map((cat) => {
              const maxCount = Math.max(...cats.map(c => c.shopCount ?? 0), 1);
              const pct      = Math.round(((cat.shopCount ?? 0) / maxCount) * 100);

              return (
                <div key={cat._id} className="cat-card" style={{ opacity: cat.isActive ? 1 : 0.6 }}>

                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                        {cat.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{cat.name}</div>
                        {cat.description && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{cat.description}</div>}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "2px 8px", background: cat.isActive ? "#DCFCE7" : "#FEE2E2", color: cat.isActive ? "#166534" : "#991B1B" }}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Shop count bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                        <Store size={11} /> {cat.shopCount ?? 0} shops
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cat.color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#F1F5F9", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: cat.color, borderRadius: 100, transition: "width .5s" }} />
                    </div>
                  </div>

                  {/* Color swatch */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: cat.color }} />
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{cat.color}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" style={{ flex: 1, background: "#EEF2FF", color: "#4338CA", justifyContent: "center" }} onClick={() => setEditCat(cat)}>
                      <Edit3 size={12} /> Edit
                    </button>
                    <button className="btn" style={{ flex: 1, background: "#FEE2E2", color: "#991B1B", justifyContent: "center" }} onClick={() => setDelCat(cat)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {editCat !== null && (
        <CategoryModal
          cat={editCat?._id ? editCat : null}
          onClose={() => setEditCat(null)}
          onSaved={() => { setEditCat(null); load(); showToast(editCat?._id ? "Category updated" : "Category added"); }}
          showToast={showToast}
        />
      )}
      {delCat && (
        <DeleteModal
          cat={delCat}
          onClose={() => setDelCat(null)}
          onConfirm={handleDelete}
          loading={delBusy}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default CategoriesPage;