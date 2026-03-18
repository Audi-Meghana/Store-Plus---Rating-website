import { useState, useRef } from "react";
import { Camera, X, Upload, AlertCircle } from "lucide-react";

/**
 * ReviewPhotoUpload
 * Props:
 *   photos     — array of { file, previewUrl }
 *   onChange   — callback(updatedPhotos)
 *   maxPhotos  — default 5
 *   compact    — smaller layout
 */
const ReviewPhotoUpload = ({ photos = [], onChange, maxPhotos = 5, compact = false }) => {
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFiles = (e) => {
    setError("");
    const files = Array.from(e.target.files);

    // Validate
    const invalid = files.filter((f) => !["image/jpeg","image/jpg","image/png","image/webp"].includes(f.type));
    if (invalid.length > 0) { setError("Only JPEG, PNG and WebP images are allowed"); return; }

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) { setError("Each image must be under 5 MB"); return; }

    const remaining = maxPhotos - photos.length;
    const toAdd     = files.slice(0, remaining).map((f) => ({
      file:       f,
      previewUrl: URL.createObjectURL(f),
    }));

    onChange([...photos, ...toAdd]);

    // Reset input so same file can be re-added
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    URL.revokeObjectURL(photos[idx].previewUrl);
    onChange(photos.filter((_, i) => i !== idx));
    setError("");
  };

  const canAdd = photos.length < maxPhotos;

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600">
          Photos{" "}
          <span className="text-gray-400 font-normal">(optional, up to {maxPhotos})</span>
        </label>
        <span className="text-xs text-gray-400">{photos.length}/{maxPhotos}</span>
      </div>

      <div className={`flex gap-3 flex-wrap ${compact ? "" : ""}`}>

        {/* Existing previews */}
        {photos.map((p, i) => (
          <div key={i} className={`relative group flex-shrink-0 ${compact ? "w-16 h-16" : "w-20 h-20"}`}>
            <img src={p.previewUrl} alt=""
              className="w-full h-full object-cover rounded-xl border border-gray-100" />
            <button type="button" onClick={() => removePhoto(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <X size={11} style={{ color: "#fff" }} />
            </button>
            {/* Size indicator */}
            <div className="absolute bottom-1 left-1 right-1 bg-black/40 rounded-lg py-0.5 text-center text-white text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {(p.file.size / 1024).toFixed(0)} KB
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canAdd && (
          <button type="button" onClick={() => inputRef.current.click()}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all text-gray-400 hover:text-green-600 ${compact ? "w-16 h-16" : "w-20 h-20"}`}>
            <Camera size={compact ? 16 : 20} />
            {!compact && <span className="text-[10px] font-semibold">Add Photo</span>}
          </button>
        )}

        {/* Drop zone — only show when no photos yet */}
        {photos.length === 0 && (
          <div
            className="flex-1 min-w-[180px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-xl py-6 cursor-pointer transition-all text-gray-400 hover:text-green-600"
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dt = e.dataTransfer;
              if (dt.files?.length) {
                inputRef.current.files = dt.files;
                handleFiles({ target: { files: dt.files, value: "" } });
              }
            }}
          >
            <Upload size={22} />
            <div className="text-center">
              <p className="text-xs font-semibold">Drop photos here or click to upload</p>
              <p className="text-xs opacity-60 mt-0.5">JPEG, PNG, WebP · Max 5 MB each</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        hidden
        onChange={handleFiles}
      />
    </div>
  );
};

export default ReviewPhotoUpload;