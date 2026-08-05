import React from 'react';

export default function ToggleSwitch({ checked, onChange, label, color = "#0ea5e9", labelColor = "#334155", style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...style }}>
      {label && <span style={{ fontSize: 14, fontWeight: 500, color: labelColor }}>{label}</span>}
      <button 
        type="button" 
        onClick={(e) => {
          // Pass mock event to maintain compatibility
          onChange({ target: { checked: !checked } });
        }}
        style={{ 
          width: 44, 
          height: 24, 
          borderRadius: 12, 
          border: "none", 
          background: checked ? color : "#cbd5e1", 
          position: "relative", 
          cursor: "pointer", 
          transition: "background 0.2s",
          flexShrink: 0
        }}
      >
        <div style={{ 
          width: 20, 
          height: 20, 
          borderRadius: "50%", 
          background: "#fff", 
          position: "absolute", 
          top: 2, 
          left: checked ? 22 : 2, 
          transition: "left 0.2s", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)" 
        }} />
      </button>
    </div>
  );
}
