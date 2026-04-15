import React, { useState } from 'react';

const PAGE_SIZES = [
  { label: 'A4 Portrait',   value: 'A4 portrait',   w:'210mm', h:'297mm' },
  { label: 'A4 Landscape',  value: 'A4 landscape',  w:'297mm', h:'210mm' },
  { label: 'A3 Portrait',   value: 'A3 portrait',   w:'297mm', h:'420mm' },
  { label: 'A3 Landscape',  value: 'A3 landscape',  w:'420mm', h:'297mm' },
  { label: 'Letter',        value: 'letter portrait',w:'216mm', h:'279mm' },
];

const PrintControl = ({ defaultSize = 'A4 landscape', accentColor = '#e8b84b', dark = false }) => {
  const [size, setSize] = useState(defaultSize);

  const handlePrint = () => {
    const existing = document.getElementById('__print_page_style__');
    if (existing) existing.remove();
    const s = document.createElement('style');
    s.id = '__print_page_style__';
    s.innerHTML = `
      @media print {
        @page { size: ${size}; margin: 8mm; }
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(s);
    window.print();
  };

  const bg      = dark ? '#111827' : '#fff';
  const border  = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const textCol = dark ? '#f1f5f9' : '#0f172a';
  const mutedCol= dark ? '#64748b' : '#94a3b8';

  return (
    <div className="no-print" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, marginBottom: 24, flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 10, padding: '8px 14px',
      }}>
        <i className="bi bi-file-earmark" style={{ color: mutedCol, fontSize: 15 }} />
        <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, color: mutedCol, marginRight: 4 }}>Page Size:</span>
        <select
          value={size}
          onChange={e => setSize(e.target.value)}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 600,
            color: textCol, cursor: 'pointer',
          }}
        >
          {PAGE_SIZES.map(p => (
            <option key={p.value} value={p.value} style={{ background: bg, color: textCol }}>{p.label}</option>
          ))}
        </select>
      </div>

      <button onClick={handlePrint} style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        color: dark ? '#07111f' : '#fff',
        border: 'none', padding: '10px 26px', borderRadius: 10,
        fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: `0 4px 20px ${accentColor}55`,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${accentColor}66`; }}
        onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}55`; }}
      >
        <i className="bi bi-printer-fill" /> Print Calendar
      </button>
    </div>
  );
};

export default PrintControl;
