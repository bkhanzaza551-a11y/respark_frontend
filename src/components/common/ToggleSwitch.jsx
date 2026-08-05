import React from 'react';

export default function ToggleSwitch({ checked, onChange, label, color = "#0ea5e9", labelColor = "#475569", style = {} }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", ...style }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        style={{ display: "none" }} 
      />
      <div style={{ position: "relative", width: 40, height: 22, background: checked ? color : "#cbd5e1", borderRadius: 20, transition: "background 0.25s ease", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: checked ? 20 : 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.25s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: checked ? color : labelColor, transition: "color 0.2s" }}>{label}</span>}
    </label>
  );
}
