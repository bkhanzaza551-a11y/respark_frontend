import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ value, onChange, children, className, style, disabled, required, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Extract options from children deeply
  const options = [];
  const processChildren = (kids) => {
    React.Children.forEach(kids, (child) => {
      if (!child) return;
      if (child.type === 'option') {
        options.push({ value: child.props.value, label: child.props.children, disabled: child.props.disabled });
      } else if (Array.isArray(child)) {
        processChildren(child);
      } else if (child.props && child.props.children) {
        processChildren(child.props.children);
      }
    });
  };
  
  processChildren(children);

  // Fallback to finding by strict equality first, then loose equality
  let selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value == value);
  
  // If still not found and value is undefined/empty, grab the first one
  if (!selectedOption && options.length > 0) {
      selectedOption = options.find(opt => opt.value === "") || options[0];
  } else if (!selectedOption) {
      selectedOption = { label: "Select..." };
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    setIsOpen(false);
    if (onChange) {
      // Create a mock event object mimicking standard select onChange
      onChange({ 
          target: { value: val, name: name },
          preventDefault: () => {},
          stopPropagation: () => {}
      });
    }
  };

  // Inherit padding/borders if passed via style but prefer our own if not
  const inheritedStyles = style || {};

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...inheritedStyles, padding: 0, border: 'none', background: 'transparent' }} className={className}>
      {/* Hidden native select for form submissions and required validation */}
      <select name={name} value={value} onChange={onChange} style={{ display: 'none' }} disabled={disabled} required={required}>
        {children}
      </select>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: inheritedStyles.padding || '10px 14px',
          borderRadius: inheritedStyles.borderRadius || 8,
          border: isOpen ? '1px solid #0ea5e9' : (inheritedStyles.border || '1px solid #cbd5e1'),
          background: disabled ? '#f1f5f9' : (inheritedStyles.background || '#fff'),
          fontSize: inheritedStyles.fontSize || 14,
          color: disabled ? '#94a3b8' : '#0f172a',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isOpen ? '0 0 0 2px rgba(14, 165, 233, 0.1)' : 'none',
          minHeight: 40,
          opacity: disabled ? 0.7 : 1
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption.label}
        </span>
        <ChevronDown size={16} color={isOpen ? "#0ea5e9" : "#64748b"} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 8 }} />
      </div>

      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          maxHeight: 250,
          overflowY: 'auto',
          padding: 6
        }}>
          {options.length > 0 ? options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (!opt.disabled) handleSelect(opt.value);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                cursor: opt.disabled ? 'not-allowed' : 'pointer',
                fontSize: 14,
                color: opt.value == value ? '#0ea5e9' : (opt.disabled ? '#94a3b8' : '#334155'),
                background: opt.value == value ? '#f0f9ff' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: opt.value == value ? 600 : 500,
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!opt.disabled && opt.value != value) {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!opt.disabled && opt.value != value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
              {opt.value == value && <Check size={16} color="#0ea5e9" style={{ flexShrink: 0, marginLeft: 8 }} />}
            </div>
          )) : (
             <div style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>No options available</div>
          )}
        </div>
      )}
    </div>
  );
}
