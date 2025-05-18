import React from "react";
import '../../styles/global.css';

function SelectField({ id, value, onChange, options, placeholder, error }) {
  return (
    <>
      <select
        id={id}          // <- aqui
        className="select-field"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </>
  );
}

export default SelectField;
