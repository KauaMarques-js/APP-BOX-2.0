import React from "react";

function FileUploadField({ label, onChange, error }) {
  return (
    <div className="file-upload-field">
      <label>{label}</label>
      <input type="file" accept="image/*" onChange={onChange} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

export default FileUploadField;
