import { useState, useEffect, useRef } from "react";
import {
  Save, CheckCircle2, AlertCircle, X, User, MapPin, Clock,
  Image as ImageIcon, Upload, Trash2, Globe, Phone,
  Instagram, Facebook, Plus, ToggleLeft, ToggleRight, Menu, Store,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../services/api";
import Sidebar, { useSidebar, MobileMenuButton } from "../../components/common/Sidebar";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "").replace(/\/$/, "");
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const TABS = [
  { id:"profile",  label:"Profile",  icon:User      },
  { id:"images",   label:"Images",   icon:ImageIcon  },
  { id:"location", label:"Location", icon:MapPin     },
  { id:"hours",    label:"Hours",    icon:Clock      },
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CATEGORIES = ["Restaurant","Cafe","Bakery","Grocery","Pharmacy","Clothing","Electronics","Salon","Gym","Bookstore","Hardware","Other"];
const unwrap = (res, fb) => res?.data?.data ?? res?.data ?? fb;

/* ── Shared UI ── */
const Toast = ({ message, type, onClose }) => (
  <div style={{ position:"fixed", bottom:20, right:16, left:16, zIndex:50, display:"flex", alignItems:"center", gap:10, padding:"13px 16px", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", background: type==="success" ? "#16A34A" : "#DC2626", color:"#fff", fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
  {type==="success" ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
  <span style={{flex:1}}>{message}</span>
  <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.8)"}}><X size={14}/></button>
  </div>
);

const SaveBtn = ({ onClick, saving, label = "Save Changes" }) => (
  <button onClick={onClick} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, background: saving ? "#86EFAC" : "#16A34A", color:"#fff", border:"none", borderRadius:12, padding:"11px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%" }}>
    {saving ? <><svg style={{animation:"spin 0.8s linear infinite",width:14,height:14}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</> : <><Save size={14}/>{label}</>}
  </button>
);

const Field = ({ label, children, hint }) => (
  <div>
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize:10, color:"#9CA3AF", marginTop:3 }}>{hint}</p>}
  </div>
);

const inp = (extra={}) => ({ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 14px", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", color:"#0F172A", ...extra });
const inpIcon = (extra={}) => ({ ...inp(extra), paddingLeft:36 });

const Input = ({ icon:Icon, value, onChange, placeholder, type="text" }) => (
  <div style={{ position:"relative" }}>
    {Icon && <Icon size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={Icon ? inpIcon() : inp()} />
  </div>
);

/* ── Profile Tab ── */
const ProfileTab = ({ data, onChange, onSave, saving }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <Card title="Basic Info" icon={<Store size={15} style={{color:"#16A34A"}}/>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:14 }}>
        <Field label="Shop Name *"><Input value={data.name} onChange={e => onChange("name", e.target.value)} placeholder="Your shop name" /></Field>
        <Field label="Category">
          <select value={data.category} onChange={e => onChange("category", e.target.value)} style={inp()}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description" hint={`${(data.description||"").length}/500`}>
          <textarea value={data.description} onChange={e => onChange("description", e.target.value)} placeholder="Tell customers about your shop…" maxLength={500} rows={3} style={{ ...inp(), resize:"none" }} />
        </Field>
      </div>
    </Card>
    <Card title="Contact & Social" icon={<Phone size={15} style={{color:"#16A34A"}}/>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:14 }}>
        <Field label="Phone"><Input icon={Phone} value={data.phone} onChange={e => onChange("phone", e.target.value)} placeholder="+91 98765 43210" /></Field>
        <Field label="Website"><Input icon={Globe} value={data.website} onChange={e => onChange("website", e.target.value)} placeholder="https://yourshop.com" /></Field>
        <Field label="Instagram"><Input icon={Instagram} value={data.instagram} onChange={e => onChange("instagram", e.target.value)} placeholder="@yourshop" /></Field>
        <Field label="Facebook"><Input icon={Facebook} value={data.facebook} onChange={e => onChange("facebook", e.target.value)} placeholder="facebook.com/yourshop" /></Field>
      </div>
    </Card>
    <SaveBtn onClick={onSave} saving={saving} label="Save Profile" />
  </div>
);

/* ── Images Tab ── */
const ImageBox = ({ label, hint, current, onUpload, onDelete, tall, uploading }) => {
  const ref = useRef();
  const url = getImageUrl(current?.url);
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:7 }}>{label}</p>
      {url ? (
        <div style={{ position:"relative", borderRadius:14, overflow:"hidden", border:"1.5px solid #E5E7EB", height: tall ? 160 : 120 }}>
          <img src={url} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => e.target.style.display="none"} />
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", transition:"background 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(0,0,0,0.45)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(0,0,0,0)"}>
            <button onClick={() => ref.current.click()} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", backdropFilter:"blur(4px)" }}><Upload size={14}/></button>
            <button onClick={onDelete} style={{ width:34, height:34, borderRadius:10, background:"rgba(220,38,38,0.8)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><Trash2 size={14}/></button>
          </div>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} disabled={uploading} style={{ width:"100%", height: tall ? 160 : 120, borderRadius:14, border:"2px dashed #E5E7EB", background:"#F8FAFC", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, color:"#9CA3AF", fontFamily:"'DM Sans',sans-serif" }}>
          {uploading ? <svg style={{animation:"spin 0.8s linear infinite",width:20,height:20}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          : <><Upload size={18}/><span style={{fontSize:12,fontWeight:600}}>Upload {label}</span><span style={{fontSize:10}}>{hint}</span></>}
        </button>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
    </div>
  );
};

const ImagesTab = ({ images, onUpload, onDelete }) => {
  const [uploading, setUploading] = useState({});
  const galleryRef = useRef();
  const handle = async (type, file) => { setUploading(u => ({...u,[type]:true})); await onUpload(type, file); setUploading(u => ({...u,[type]:false})); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card title="Logo & Cover Photo" icon={<ImageIcon size={15} style={{color:"#16A34A"}}/>}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14, alignItems:"start" }}>
          <ImageBox label="Logo" hint="400×400px" current={images.logo} onUpload={f => handle("logo",f)} onDelete={() => onDelete("logo")} uploading={uploading.logo} />
          <ImageBox label="Cover Photo" hint="1200×400px" current={images.cover} onUpload={f => handle("cover",f)} onDelete={() => onDelete("cover")} tall uploading={uploading.cover} />
        </div>
      </Card>
      <Card title={`Gallery (${images.gallery?.length??0}/10)`} icon={<ImageIcon size={15} style={{color:"#16A34A"}}/>}>
        {images.gallery?.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {images.gallery.map(img => {
              const url = getImageUrl(img.url);
              return (
                <div key={img._id} style={{ position:"relative", borderRadius:12, overflow:"hidden", aspectRatio:"1", background:"#F3F4F6", border:"1.5px solid #F1F5F9" }}>
                  <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => e.target.style.display="none"} />
                  <button onClick={() => onDelete(img._id)} style={{ position:"absolute", top:5, right:5, width:26, height:26, borderRadius:8, background:"rgba(220,38,38,0.85)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><Trash2 size={11}/></button>
                </div>
              );
            })}
            {(images.gallery?.length??0) < 10 && (
              <button onClick={() => galleryRef.current.click()} style={{ aspectRatio:"1", borderRadius:12, border:"2px dashed #E5E7EB", background:"#F8FAFC", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, color:"#9CA3AF", fontFamily:"'DM Sans',sans-serif" }}>
                <Plus size={18}/><span style={{fontSize:10,fontWeight:600}}>Add</span>
              </button>
            )}
          </div>
        ) : (
          <button onClick={() => galleryRef.current.click()} style={{ width:"100%", height:100, borderRadius:12, border:"2px dashed #E5E7EB", background:"#F8FAFC", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, color:"#9CA3AF", fontFamily:"inherit" }}>
            <ImageIcon size={22}/><span style={{fontSize:12,fontWeight:600}}>Upload first photo</span>
          </button>
        )}
        <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={e => e.target.files[0] && handle("gallery", e.target.files[0])} />
      </Card>
    </div>
  );
};

/* ── Location Tab ── */
const MapPicker = ({ lat, lng, onChange }) => {
  const def = [lat||20.5937, lng||78.9629];
  const Click = () => { useMapEvents({ click(e){ onChange(e.latlng.lat, e.latlng.lng); } }); return null; };
  return (
    <div style={{ borderRadius:14, overflow:"hidden", border:"1.5px solid #E5E7EB", height:220 }}>
      <MapContainer center={def} zoom={lat?13:5} style={{height:"100%",width:"100%"}} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Click />
        {lat && lng && <Marker position={[lat,lng]} />}
      </MapContainer>
    </div>
  );
};

const LocationTab = ({ data, onChange, onSave, saving }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <Card title="Pin on Map" icon={<MapPin size={15} style={{color:"#16A34A"}}/>}>
      <p style={{ fontSize:11, color:"#9CA3AF", marginBottom:10 }}>Tap anywhere on the map to set location.</p>
      <MapPicker lat={parseFloat(data.lat)||null} lng={parseFloat(data.lng)||null} onChange={(la,ln) => { onChange("lat", la.toFixed(6)); onChange("lng", ln.toFixed(6)); }} />
      {data.lat && data.lng && <p style={{ fontSize:11, color:"#16A34A", marginTop:8, display:"flex", alignItems:"center", gap:4 }}><CheckCircle2 size={11}/>Pinned at {parseFloat(data.lat).toFixed(4)}, {parseFloat(data.lng).toFixed(4)}</p>}
    </Card>
    <Card title="Address" icon={<MapPin size={15} style={{color:"#16A34A"}}/>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
        <Field label="Street Address"><Input value={data.address} onChange={e => onChange("address", e.target.value)} placeholder="123 Main Street" /></Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="City"><Input value={data.city} onChange={e => onChange("city", e.target.value)} placeholder="Mumbai" /></Field>
          <Field label="State"><Input value={data.state} onChange={e => onChange("state", e.target.value)} placeholder="Maharashtra" /></Field>
          <Field label="Pincode"><Input value={data.pincode} onChange={e => onChange("pincode", e.target.value)} placeholder="400001" /></Field>
          <Field label="Landmark"><Input value={data.landmark} onChange={e => onChange("landmark", e.target.value)} placeholder="Near City Mall" /></Field>
        </div>
      </div>
    </Card>
    <SaveBtn onClick={onSave} saving={saving} label="Save Location" />
  </div>
);

/* ── Hours Tab ── */
const HoursTab = ({ hours, onToggle, onTimeChange, onSave, saving }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <Card title="Operating Hours" icon={<Clock size={15} style={{color:"#16A34A"}}/>}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {DAYS.map(day => {
          const d = hours[day] ?? { open:true, from:"09:00", to:"21:00" };
          return (
            <div key={day} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, background: d.open ? "#F0FDF4" : "#F8FAFC", border:`1.5px solid ${d.open ? "#BBF7D0" : "#F1F5F9"}`, opacity: d.open ? 1 : 0.6, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#374151", width:76, flexShrink:0 }}>{day}</span>
              <button onClick={() => onToggle(day)} style={{ background:"none", border:"none", cursor:"pointer", color: d.open ? "#16A34A" : "#9CA3AF", flexShrink:0 }}>
                {d.open ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
              </button>
              {d.open && (
                <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
                  <input type="time" value={d.from} onChange={e => onTimeChange(day,"from",e.target.value)} style={{ border:"1.5px solid #E5E7EB", borderRadius:9, padding:"6px 8px", fontSize:12, fontFamily:"inherit", outline:"none", width:90 }} />
                  <span style={{ color:"#9CA3AF", fontSize:12 }}>–</span>
                  <input type="time" value={d.to}   onChange={e => onTimeChange(day,"to",e.target.value)}   style={{ border:"1.5px solid #E5E7EB", borderRadius:9, padding:"6px 8px", fontSize:12, fontFamily:"inherit", outline:"none", width:90 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
    <SaveBtn onClick={onSave} saving={saving} label="Save Hours" />
  </div>
);

/* ── Card wrapper ── */
const Card = ({ title, icon, children }) => (
  <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"16px 16px", fontFamily:"'DM Sans',sans-serif" }}>
    <h3 style={{ fontSize:13, fontWeight:800, color:"#0F172A", marginBottom:16, display:"flex", alignItems:"center", gap:7 }}>{icon}{title}</h3>
    {children}
  </div>
);

/* ── Main Page ── */
const ManageStorePage = () => {
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [shop,      setShop]      = useState(null);
  const [profile,   setProfile]   = useState({ name:"", category:"", description:"", phone:"", website:"", instagram:"", facebook:"" });
  const [images,    setImages]    = useState({ logo:null, cover:null, gallery:[] });
  const [location,  setLocation]  = useState({ address:"", city:"", state:"", pincode:"", landmark:"", lat:"", lng:"" });
  const [hours,     setHours]     = useState({});

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    api.get("/shops/me").then(res => {
      const s = unwrap(res, {});
      setShop(s);
      setProfile({ name:s.name??"", category:s.category??"", description:s.description??"", phone:s.phone??"", website:s.website??"", instagram:s.instagram??"", facebook:s.facebook??"" });
      setImages({ logo:s.logo??null, cover:s.cover??null, gallery:s.gallery??[] });
      setLocation({ address:s.location?.address??"", city:s.location?.city??"", state:s.location?.state??"", pincode:s.location?.pincode??"", landmark:s.location?.landmark??"", lat:s.location?.lat??"", lng:s.location?.lng??"" });
      setHours(s.hours??{});
    }).catch(() => showToast("Failed to load store", "error")).finally(() => setLoading(false));
  }, []);

  const saveProfile  = async () => { if (!profile.name.trim()) { showToast("Shop name required","error"); return; } setSaving(true); try { await api.put("/shops/owner/profile", profile); showToast("Profile saved"); } catch(e){ showToast(e?.response?.data?.message||"Failed","error"); } finally { setSaving(false); } };
  const saveLocation = async () => { setSaving(true); try { await api.put("/shops/owner/location", location); showToast("Location saved"); } catch(e){ showToast(e?.response?.data?.message||"Failed","error"); } finally { setSaving(false); } };
  const saveHours    = async () => { setSaving(true); try { await api.put("/shops/owner/hours", hours); showToast("Hours saved"); } catch(e){ showToast(e?.response?.data?.message||"Failed","error"); } finally { setSaving(false); } };

  const uploadImage = async (type, file) => {
    const form = new FormData();
    if (type==="logo") form.append("logo",file); else if (type==="cover") form.append("cover",file); else form.append("images",file);
    try {
      const res = await (type==="logo" ? api.post("/shops/owner/images/logo",form) : type==="cover" ? api.post("/shops/owner/images/cover",form) : api.post("/shops/owner/images/gallery",form));
      const s   = unwrap(res,{});
      setImages({ logo:s.logo, cover:s.cover, gallery:s.gallery??[] });
      showToast("Uploaded");
    } catch(e){ showToast(e?.response?.data?.message||"Upload failed","error"); }
  };

  const deleteImage = async (typeOrId) => {
    try {
      const res = /^[a-f\d]{24}$/i.test(String(typeOrId)) ? await api.delete(`/shops/owner/images/gallery/${typeOrId}`) : await api.delete(`/shops/owner/images/${typeOrId}`);
      const s   = unwrap(res,{});
      setImages({ logo:s.logo, cover:s.cover, gallery:s.gallery??[] });
      showToast("Removed");
    } catch{ showToast("Failed to delete","error"); }
  };

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"#F8F9FB", flexDirection:"column", gap:12 }}>
      <svg style={{animation:"spin 0.8s linear infinite",width:26,height:26,color:"#16A34A"}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      <p style={{fontSize:12,color:"#9CA3AF"}}>Loading store…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F8F9FB", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileClose={closeMobile} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <header style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <MobileMenuButton onClick={openMobile} role="shop_owner" />
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontSize:17, fontWeight:800, color:"#0F172A", margin:0 }}>Manage Store</h1>
            <p style={{ fontSize:11, color:"#9CA3AF", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.name||"Your shop"}</p>
          </div>
        </header>

        {/* Tab bar — scrollable on mobile */}
        <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", overflowX:"auto", scrollbarWidth:"none" }}>
          <div style={{ display:"flex", padding:"0 16px", minWidth:"max-content" }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display:"flex", alignItems:"center", gap:6, padding:"13px 14px",
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

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 40px" }}>
          {activeTab === "profile"  && <ProfileTab  data={profile}  onChange={(k,v) => setProfile(p => ({...p,[k]:v}))  } onSave={saveProfile}  saving={saving} />}
          {activeTab === "images"   && <ImagesTab   images={images}  onUpload={uploadImage} onDelete={deleteImage} />}
          {activeTab === "location" && <LocationTab data={location} onChange={(k,v) => setLocation(l => ({...l,[k]:v}))} onSave={saveLocation} saving={saving} />}
          {activeTab === "hours"    && <HoursTab    hours={hours}   onToggle={day => setHours(h => ({...h,[day]:{...h[day],open:!h[day]?.open}}))} onTimeChange={(day,key,val) => setHours(h => ({...h,[day]:{...h[day],[key]:val}}))} onSave={saveHours} saving={saving} />}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ManageStorePage;