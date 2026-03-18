import { useState, useEffect, useRef } from "react";
import {
  User, Lock, Save, CheckCircle2, AlertCircle, X,
  Eye, EyeOff, Shield, BellRing, Phone, Mail,
  Camera, ToggleLeft, ToggleRight,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";
import Sidebar, { useSidebar, MobileMenuButton } from "../../components/common/Sidebar";

const TABS = [
  { id:"account",  label:"Account",  icon:User    },
  { id:"security", label:"Security", icon:Shield  },
  { id:"notifs",   label:"Notifs",   icon:BellRing },
];

const NOTIF_KEYS = [
  { key:"newReview",     label:"New Review",       desc:"When a customer leaves a new review"    },
  { key:"replyReceived", label:"Reply Received",   desc:"When someone replies to your response"  },
  { key:"dealExpiry",    label:"Deal Expiry Alert", desc:"24hr before a deal expires"            },
  { key:"weeklyReport",  label:"Weekly Report",    desc:"Weekly performance summary email"       },
  { key:"tipAlerts",     label:"Improvement Tips", desc:"Tips to improve your shop rating"       },
  { key:"marketing",     label:"Marketing Emails", desc:"StorePulse news and feature updates"    },
];

const unwrap = (res, fb) => res?.data?.data ?? res?.data ?? fb;

const inp = {
  width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12,
  padding:"10px 14px", fontSize:13, fontFamily:"'DM Sans',sans-serif",
  outline:"none", boxSizing:"border-box", color:"#0F172A",
};

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div style={{ position:"fixed", bottom:20, right:16, left:16, zIndex:50, display:"flex", alignItems:"center", gap:10, padding:"13px 16px", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", background: type==="success" ? "#16A34A" : "#DC2626", color:"#fff", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
    {type==="success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
    <span style={{flex:1}}>{message}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.8)"}}><X size={14}/></button>
  </div>
);

const SaveBtn = ({ onClick, saving, label="Save Changes" }) => (
  <button onClick={onClick} disabled={saving} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, background: saving ? "#86EFAC" : "#16A34A", color:"#fff", border:"none", borderRadius:12, padding:"12px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%" }}>
    {saving
      ? <><svg style={{animation:"spin 0.8s linear infinite",width:14,height:14}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
      : <><Save size={14}/>{label}</>}
  </button>
);

const Card = ({ title, icon, children }) => (
  <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"16px", fontFamily:"'DM Sans',sans-serif" }}>
    <h3 style={{ fontSize:13, fontWeight:800, color:"#0F172A", marginBottom:16, display:"flex", alignItems:"center", gap:7 }}>{icon}{title}</h3>
    {children}
  </div>
);

/* ── PwField at MODULE level — prevents re-mount on every keystroke ── */
const PwField = ({ label, value, onChange, show, onToggle, error }) => (
  <div>
    <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>{label}</label>
    <div style={{ position:"relative" }}>
      <Lock size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={{ ...inp, paddingLeft:32, paddingRight:36, border:`1.5px solid ${error ? "#FCA5A5" : "#E5E7EB"}`, background: error ? "#FEF2F2" : "#fff" }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF" }}
      >
        {show ? <EyeOff size={14}/> : <Eye size={14}/>}
      </button>
    </div>
    {error && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{error}</p>}
  </div>
);

/* ── Account Tab ── */
const AccountTab = ({ user, onSave, saving }) => {
  const [form,    setForm]    = useState({ name:"", email:"", phone:"" });
  const [avatar,  setAvatar]  = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors,  setErrors]  = useState({});
  const fileRef = useRef();

  useEffect(() => {
    if (user) {
      setForm({ name:user.name??"", email:user.email??"", phone:user.phone??"" });
      setPreview(user.avatar??null);
    }
  }, [user]);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); if (errors[k]) setErrors(e => ({...e,[k]:""})); };
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card title="Profile Photo" icon={<User size={15} style={{color:"#16A34A"}}/>}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:68, height:68, borderRadius:18, background:"linear-gradient(135deg,#22c55e,#0d9488)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:24, fontWeight:800, overflow:"hidden" }}>
              {preview
                ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : (user?.name?.charAt(0).toUpperCase()||"O")}
            </div>
            <button type="button" onClick={() => fileRef.current.click()} style={{ position:"absolute", bottom:-4, right:-4, width:26, height:26, borderRadius:9, background:"#16A34A", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", cursor:"pointer" }}>
              <Camera size={12}/>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => { const f=e.target.files[0]; if(f){ setAvatar(f); setPreview(URL.createObjectURL(f)); } }} />
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#0F172A", margin:0 }}>{user?.name}</p>
            <p style={{ fontSize:11, color:"#9CA3AF", margin:"2px 0 6px" }}>{user?.email}</p>
            <button type="button" onClick={() => fileRef.current.click()} style={{ fontSize:11, fontWeight:700, color:"#16A34A", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0 }}>Change photo</button>
          </div>
        </div>
      </Card>

      <Card title="Personal Info" icon={<User size={15} style={{color:"#16A34A"}}/>}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { key:"name",  label:"Full Name",    icon:User,  type:"text",  placeholder:"Your name"       },
            { key:"email", label:"Email Address", icon:Mail,  type:"email", placeholder:"you@email.com"   },
            { key:"phone", label:"Phone Number",  icon:Phone, type:"tel",   placeholder:"+91 98765 43210" },
          ].map(({ key, label, icon:Icon, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>{label}</label>
              <div style={{ position:"relative" }}>
                <Icon size={13} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  style={{ ...inp, paddingLeft:32, border:`1.5px solid ${errors[key] ? "#FCA5A5" : "#E5E7EB"}`, background: errors[key] ? "#FEF2F2" : "#fff" }}
                />
              </div>
              {errors[key] && <p style={{ fontSize:11, color:"#DC2626", marginTop:3 }}>{errors[key]}</p>}
            </div>
          ))}
        </div>
      </Card>

      <SaveBtn onClick={() => validate() && onSave("account", form, avatar)} saving={saving} label="Save Account" />
    </div>
  );
};

/* ── Security Tab ── */
const SecurityTab = ({ onSave, saving }) => {
  const [form,   setForm]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [show,   setShow]   = useState({ currentPassword:false, newPassword:false, confirmPassword:false });
  const [errors, setErrors] = useState({});

  const set    = (k, v) => { setForm(f => ({...f,[k]:v})); if (errors[k]) setErrors(e => ({...e,[k]:""})); };
  const toggle = (k)    => setShow(s => ({...s,[k]:!s[k]}));

  const strength = (pwd) => {
    if (!pwd) return { score:0, label:"", color:"" };
    let s = 0;
    if (pwd.length>=8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return [
      { label:"Weak",        color:"#EF4444" },
      { label:"Fair",        color:"#F97316" },
      { label:"Good",        color:"#EAB308" },
      { label:"Strong",      color:"#22C55E" },
      { label:"Very Strong", color:"#16A34A" },
    ][s] ?? { score:s, label:"", color:"" };
  };

  const pw = strength(form.newPassword);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Current password required";
    if (form.newPassword.length < 8) e.newPassword = "Min 8 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card title="Change Password" icon={<Shield size={15} style={{color:"#16A34A"}}/>}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          <PwField
            label="Current Password"
            value={form.currentPassword}
            onChange={e => set("currentPassword", e.target.value)}
            show={show.currentPassword}
            onToggle={() => toggle("currentPassword")}
            error={errors.currentPassword}
          />

          <div>
            <PwField
              label="New Password"
              value={form.newPassword}
              onChange={e => set("newPassword", e.target.value)}
              show={show.newPassword}
              onToggle={() => toggle("newPassword")}
              error={errors.newPassword}
            />
            {form.newPassword && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height:4, flex:1, borderRadius:100, background: i <= (pw.score||0) ? pw.color : "#E5E7EB", transition:"background 0.3s" }} />
                  ))}
                </div>
                <p style={{ fontSize:10, color:"#9CA3AF" }}>Strength: <span style={{ fontWeight:700, color:pw.color }}>{pw.label}</span></p>
              </div>
            )}
          </div>

          <PwField
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={e => set("confirmPassword", e.target.value)}
            show={show.confirmPassword}
            onToggle={() => toggle("confirmPassword")}
            error={errors.confirmPassword}
          />

        </div>
      </Card>

      <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A", borderRadius:14, padding:"14px 16px" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#92400E", marginBottom:6 }}>Security Tips</p>
        <ul style={{ fontSize:11, color:"#B45309", lineHeight:1.8, paddingLeft:14 }}>
          <li>Use at least 8 characters with uppercase, numbers and symbols</li>
          <li>Never reuse passwords across multiple sites</li>
          <li>Change your password every 3–6 months</li>
        </ul>
      </div>

      <SaveBtn onClick={() => validate() && onSave("security", form)} saving={saving} label="Update Password" />
    </div>
  );
};

/* ── Notifications Tab ── */
const NotificationsTab = ({ prefs, onToggle, onSave, saving }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
    <Card title="Notification Preferences" icon={<BellRing size={15} style={{color:"#16A34A"}}/>}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {NOTIF_KEYS.map(({ key, label, desc }) => (
          <div key={key} onClick={() => onToggle(key)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 12px", background:"#F8FAFC", borderRadius:12, cursor:"pointer", transition:"background 0.15s", gap:10 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#0F172A", margin:0 }}>{label}</p>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{desc}</p>
            </div>
            <div style={{ flexShrink:0, color: prefs[key] ? "#16A34A" : "#9CA3AF" }}>
              {prefs[key] ? <ToggleRight size={26}/> : <ToggleLeft size={26}/>}
            </div>
          </div>
        ))}
      </div>
    </Card>
    <SaveBtn onClick={onSave} saving={saving} label="Save Preferences" />
  </div>
);

/* ── Main Page ── */
const OwnerProfilePage = () => {
  const { updateUser } = useAuthStore();
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();

  const [user,       setUser]       = useState(null);
  const [shop,       setShop]       = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({ newReview:true, replyReceived:true, dealExpiry:true, weeklyReport:false, tipAlerts:true, marketing:false });
  const [activeTab,  setActiveTab]  = useState("account");
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.allSettled([api.get("/users/me"), api.get("/shops/me")]).then(([u, s]) => {
      if (u.status === "fulfilled") { const d = unwrap(u.value,{}); setUser(d); if (d.notifPrefs) setNotifPrefs(d.notifPrefs); }
      if (s.status === "fulfilled") setShop(unwrap(s.value,{}));
    });
  }, []);

  const handleSave = async (section, data, file) => {
    setSaving(true);
    try {
      if (section === "account") {
        const payload = { name: data.name, phone: data.phone };
        if (file) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          payload.avatar = base64;
        }
        const res     = await api.patch("/users/me", payload);
        const upd     = unwrap(res, {});
        const updated = upd?.user ?? upd;
        setUser(updated);
        updateUser(updated);
        showToast("Account updated successfully");
      }

      if (section === "security") {
        await api.patch("/users/me/password", {
          currentPassword: data.currentPassword,
          newPassword:     data.newPassword,
        });
        showToast("Password changed successfully");
      }

      if (section === "notifs") {
        const res     = await api.patch("/users/me", { notifPrefs });
        const upd     = unwrap(res, {});
        const updated = upd?.user ?? upd;
        setUser(updated);
        updateUser(updated);
        showToast("Notification preferences saved");
      }
    } catch(e) {
      showToast(e?.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F8F9FB", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileClose={closeMobile} shopStats={{ rating:shop?.avgRating, reviewCount:shop?.reviewCount }} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        <header style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <MobileMenuButton onClick={openMobile} role="shop_owner" />
          <div>
            <h1 style={{ fontSize:17, fontWeight:800, color:"#0F172A", margin:0 }}>Account Settings</h1>
            <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>Profile, security and notifications</p>
          </div>
        </header>

        <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", overflowX:"auto", scrollbarWidth:"none" }}>
          <div style={{ display:"flex", padding:"0 16px", minWidth:"max-content" }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display:"flex", alignItems:"center", gap:6, padding:"13px 16px",
                  fontSize:12, fontWeight:700, border:"none", cursor:"pointer",
                  background:"transparent", fontFamily:"inherit", whiteSpace:"nowrap",
                  borderBottom:`2px solid ${activeTab===tab.id ? "#16A34A" : "transparent"}`,
                  color: activeTab===tab.id ? "#16A34A" : "#9CA3AF",
                  transition:"all 0.2s",
                }}>
                  <Icon size={13}/>{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 40px" }}>
          {activeTab === "account"  && <AccountTab user={user} onSave={handleSave} saving={saving} />}
          {activeTab === "security" && <SecurityTab onSave={handleSave} saving={saving} />}
          {activeTab === "notifs"   && <NotificationsTab prefs={notifPrefs} onToggle={key => setNotifPrefs(p => ({...p,[key]:!p[key]}))} onSave={() => handleSave("notifs")} saving={saving} />}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OwnerProfilePage;