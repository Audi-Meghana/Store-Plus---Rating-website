import { useState, useEffect, useCallback } from "react";
import {
  Search, Trash2, Edit3, Shield, User, Mail, Phone,
  MapPin, Loader2, AlertCircle, CheckCircle, RefreshCw, X,
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

const spin = `@keyframes spin{to{transform:rotate(360deg)}}`;
const Spinner = ({ size=24 }) => (<><style>{spin}</style><Loader2 size={size} style={{ color:"#1D4ED8", animation:"spin 0.8s linear infinite" }} /></>);

const Toast = ({ msg, type }) => (
  <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background: type==="success" ? "#065F46" : "#991B1B", color:"#fff", borderRadius:12, padding:"12px 20px", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }}>
    {type==="success" ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} {msg}
  </div>
);

const ROLES = ["all","user","shop_owner","admin"];
const ROLE_COLORS = { user:"#1D4ED8", shop_owner:"#059669", admin:"#7C3AED" };
const ROLE_BG     = { user:"#EFF6FF", shop_owner:"#D1FAE5", admin:"#EDE9FE" };

const ManageUsersPage = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("all");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 10;

  const [actionLoading, setActionLoading] = useState({});
  const [toast,         setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editUser,      setEditUser]      = useState(null);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const params = new URLSearchParams({ page, limit:LIMIT, ...(search && { search }), ...(role !== "all" && { role }) });
      const res  = await api.get(`/admin/users?${params}`);
      const root = res?.data ?? res;
      setUsers(Array.isArray(root?.users) ? root.users : []);
      setTotal(root?.total ?? 0);
    } catch(e) { setError(e.response?.data?.message ?? "Failed to load users"); }
    finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, role]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading((p) => ({ ...p, [confirmDelete._id]: "deleting" }));
    try {
      await api.delete(`/admin/users/${confirmDelete._id}`);
      showToast(`"${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
      fetchUsers();
    } catch(e) { showToast(e.response?.data?.message ?? "Failed to delete", "error"); }
    finally { setActionLoading((p) => ({ ...p, [confirmDelete._id]: null })); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;} ${spin}
        .mup-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;}
        .mup-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .mup-input{width:100%;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s;background:#fff;}
        .mup-input:focus{border-color:#1D4ED8;}
        .mup-select{border:1.5px solid #E5E7EB;border-radius:10px;padding:9px 12px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;background:#fff;cursor:pointer;}
        .mup-row{display:grid;grid-template-columns:2fr 1.5fr 1fr 1fr;align-items:center;gap:16px;padding:14px 20px;border-bottom:1px solid #F8F9FB;transition:background 0.15s;}
        .mup-row:hover{background:#FAFBFF;}
        .mup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;}
        .mup-modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:440px;}
      `}</style>

      <Sidebar />

      <div style={{ flex:1, padding:"32px 28px", overflow:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.7rem", fontWeight:800, color:"#0F172A" }}>Manage Users</h1>
            <p style={{ color:"#6B7280", fontSize:14, marginTop:4 }}>{total} users total</p>
          </div>
          <button className="mup-btn" style={{ background:"#F1F5F9", color:"#374151" }} onClick={fetchUsers}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14, marginBottom:24 }}>
          {[
            { label:"Total",       value:total,                                              color:"#1D4ED8", bg:"#EFF6FF" },
            { label:"Users",       value:users.filter(u=>u.role==="user").length,             color:"#1D4ED8", bg:"#EFF6FF" },
            { label:"Shop Owners", value:users.filter(u=>u.role==="shop_owner").length,       color:"#059669", bg:"#D1FAE5" },
            { label:"Admins",      value:users.filter(u=>u.role==="admin").length,            color:"#7C3AED", bg:"#EDE9FE" },
          ].map((s) => (
            <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:"14px 16px" }}>
              <div style={{ fontSize:"1.4rem", fontWeight:800, fontFamily:"'Syne',sans-serif", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:s.color, opacity:0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />
            <input className="mup-input" style={{ paddingLeft:36 }} placeholder="Search by name, email, city…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="mup-select" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r==="all" ? "All Roles" : r.replace("_"," ")}</option>)}
          </select>
        </div>

        {error && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13, marginBottom:16 }}><AlertCircle size={16}/> {error}</div>}

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          <div className="mup-row" style={{ background:"#F8F9FB" }}>
            {["User","Contact","Role","Actions"].map((h) => (
              <span key={h} style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
            ))}
          </div>

          {loading ? <div style={{ padding:48, display:"flex", justifyContent:"center" }}><Spinner size={32}/></div>
          : users.length === 0 ? <div style={{ padding:48, textAlign:"center", color:"#9CA3AF", fontSize:14 }}>No users found.</div>
          : users.map((user) => {
            const uid = user._id ?? user.id;
            return (
              <div key={uid} className="mup-row">
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"#1D4ED8", color:"#fff", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{user.name}</div>
                    {user.city && <div style={{ fontSize:11, color:"#9CA3AF", display:"flex", alignItems:"center", gap:3 }}><MapPin size={9}/> {user.city}</div>}
                  </div>
                </div>
                <div style={{ fontSize:13 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:"#374151" }}><Mail size={11}/> {user.email}</div>
                  {user.phone && <div style={{ display:"flex", alignItems:"center", gap:5, color:"#6B7280", marginTop:3 }}><Phone size={11}/> {user.phone}</div>}
                </div>
                <span style={{ fontSize:12, fontWeight:700, background:ROLE_BG[user.role]??"#F1F5F9", color:ROLE_COLORS[user.role]??"#374151", borderRadius:100, padding:"3px 10px" }}>
                  {user.role?.replace("_"," ")}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  {actionLoading[uid] ? <Spinner size={18}/> : (
                    <>
                      <button className="mup-btn" style={{ background:"#F1F5F9", color:"#374151", padding:"6px 10px" }} onClick={() => setEditUser(user)}>
                        <Edit3 size={12}/> Edit
                      </button>
                      {user.role !== "admin" && (
                        <button className="mup-btn" style={{ background:"#FEE2E2", color:"#991B1B", padding:"6px 10px" }} onClick={() => setConfirmDelete(user)}>
                          <Trash2 size={12}/> Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:24 }}>
            <button className="mup-btn" style={{ background:"#F1F5F9", color:"#374151" }} disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            {Array.from({ length:totalPages }, (_,i)=>i+1).map((p) => (
              <button key={p} className="mup-btn" onClick={() => setPage(p)} style={{ padding:"8px 14px", background:p===page?"#1D4ED8":"#F1F5F9", color:p===page?"#fff":"#374151" }}>{p}</button>
            ))}
            <button className="mup-btn" style={{ background:"#F1F5F9", color:"#374151" }} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="mup-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="mup-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ width:60, height:60, background:"#FEE2E2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Trash2 size={28} style={{ color:"#EF4444" }}/>
              </div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#0F172A", fontSize:"1.2rem", marginBottom:8 }}>Delete User?</h2>
              <p style={{ color:"#6B7280", fontSize:14 }}>Delete <strong>"{confirmDelete.name}"</strong>? This cannot be undone.</p>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="mup-btn" style={{ background:"#F1F5F9", color:"#374151" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="mup-btn" style={{ background:"#EF4444", color:"#fff" }} onClick={handleDelete}>
                {actionLoading[confirmDelete._id] ? <Spinner size={14}/> : <Trash2 size={14}/>} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); fetchUsers(); showToast("User updated"); }}
          showToast={showToast} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSaved, showToast }) => {
  const [form,   setForm]   = useState({ name:user.name??"", email:user.email??"", phone:user.phone??"", city:user.city??"", role:user.role??"user" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(`/admin/users/${user._id ?? user.id}`, form);
      onSaved();
    } catch(e) { showToast(e.response?.data?.message ?? "Failed to update", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:440 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#0F172A", fontSize:"1.2rem", marginBottom:20 }}>Edit User — {user.name}</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[["Name","name"],["Email","email"],["Phone","phone"],["City","city"]].map(([label,key]) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>{label}</label>
              <input style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"10px 14px", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }}
                value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Role</label>
            <select style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"10px 14px", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }}
              value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="user">User</option>
              <option value="shop_owner">Shop Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
          <button style={{ background:"#F1F5F9", color:"#374151", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }} onClick={onClose}>Cancel</button>
          <button style={{ background:"#1D4ED8", color:"#fff", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : null} Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;