import { Search, Plus, Edit2, Trash2, X, Power, PowerOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";
import ModuleTabs from "../../components/ModuleTabs";
import EmptyState from "../../components/EmptyState";
import PageLoader from "../../components/PageLoader";
import { formatApiError } from "../../utils/apiError";
import { useBranch } from "../../context/BranchContext";
import ToggleSwitch from "../../components/common/ToggleSwitch";

const defaultCouponForm = {
  code: "",
  title: "",
  description: "",
  discountType: "FIXED",
  discountValue: 50,
  minBillAmount: 59,
  usageLimit: "",
  startsAt: new Date().toISOString().split('T')[0],
  validityDays: 90,
  isActive: true,
  isPrivate: false
};

const emptyGiftCard = {
  code: "",
  title: "",
  originalAmount: 1000,
  note: "",
  isActive: true,
  validityDays: 365
};

export default function CouponsPage() {
  const location = useLocation();
  const { selectedBranchId } = useBranch();
  const [coupons, setCoupons] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [reports, setReports] = useState(null);
  const [couponForm, setCouponForm] = useState(defaultCouponForm);
  const [giftCardForm, setGiftCardForm] = useState(emptyGiftCard);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [gcSearch, setGcSearch] = useState("");
  const [editingGc, setEditingGc] = useState(null);
  const [couponSearch, setCouponSearch] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);

  const handleEditCoupon = (c) => {
    setEditingCoupon(c);
    let valDays = 90;
    if (c.startsAt && c.endsAt) {
      const diffTime = Math.abs(new Date(c.endsAt) - new Date(c.startsAt));
      valDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    setCouponForm({
      code: c.code || "",
      title: c.title || "",
      description: c.description || "",
      discountType: c.discountType || "PERCENT",
      discountValue: c.discountValue ? Number(c.discountValue) : 0,
      minBillAmount: c.minBillAmount ? Number(c.minBillAmount) : 0,
      usageLimit: c.usageLimit || "",
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validityDays: valDays,
      isActive: !c.isArchived,
      isPrivate: c.notes === "PRIVATE"
    });
  };

  const mode = location.pathname.includes("/gift-cards")
    ? "giftCards"
    : location.pathname.includes("/reports")
      ? "reports"
      : "coupons";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [couponResponse, giftCardResponse, reportResponse] = await Promise.all([
        api.get("/owner/coupons", { params: { branchId: selectedBranchId } }),
        api.get("/owner/gift-cards", { params: { branchId: selectedBranchId } }),
        api.get("/owner/coupons/reports", { params: { branchId: selectedBranchId } })
      ]);
      setCoupons(couponResponse.data || []);
      setGiftCards(giftCardResponse.data || []);
      setReports(reportResponse.data || null);
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not load coupons module"), success: "" });
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  const saveCoupon = async (event) => {
    event.preventDefault();
    try {
      const start = couponForm.startsAt ? new Date(couponForm.startsAt) : new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + Number(couponForm.validityDays || 0));

      const payload = {
        code: couponForm.code,
        title: couponForm.title,
        ...(couponForm.description ? { description: couponForm.description } : {}),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minBillAmount: Number(couponForm.minBillAmount || 0),
        ...(couponForm.usageLimit ? { usageLimit: Number(couponForm.usageLimit) } : {}),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        isArchived: !couponForm.isActive,
        notes: couponForm.isPrivate ? "PRIVATE" : "",
        ...(selectedBranchId ? { branchId: selectedBranchId } : {})
      };

      if (editingCoupon) {
        await api.patch(`/owner/coupons/${editingCoupon.id}`, payload);
        setStatus({ error: "", success: "Coupon updated." });
      } else {
        await api.post("/owner/coupons", payload);
        setStatus({ error: "", success: "Coupon created." });
      }
      setCouponForm(defaultCouponForm);
      setEditingCoupon(null);
      setShowCouponModal(false);
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not save coupon"), success: "" });
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/owner/coupons/${id}`);
      setStatus({ error: "", success: "Coupon deleted." });
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not delete coupon"), success: "" });
    }
  };

  const saveGiftCard = async (event) => {
    event.preventDefault();
    try {
      if (editingGc) {
        await api.patch(`/owner/gift-cards/${editingGc.id}`, {
          code: giftCardForm.code,
          title: giftCardForm.title,
          originalAmount: Number(giftCardForm.originalAmount),
          note: giftCardForm.note,
          isActive: giftCardForm.isActive,
          validityDays: Number(giftCardForm.validityDays),
          branchId: selectedBranchId || null
        });
        setStatus({ error: "", success: "Gift card updated." });
      } else {
        await api.post("/owner/gift-cards", {
          code: giftCardForm.code,
          title: giftCardForm.title,
          originalAmount: Number(giftCardForm.originalAmount),
          note: giftCardForm.note,
          isActive: giftCardForm.isActive,
          validityDays: Number(giftCardForm.validityDays),
          branchId: selectedBranchId || null
        });
        setStatus({ error: "", success: "Gift card created." });
      }
      setGiftCardForm(emptyGiftCard);
      setEditingGc(null);
      setShowGiftCardModal(false);
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not save gift card"), success: "" });
    }
  };

  const deleteGiftCard = async (id) => {
    if (!confirm("Delete this gift card?")) return;
    try {
      await api.delete(`/owner/gift-cards/${id}`);
      setStatus({ error: "", success: "Gift card deleted." });
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not delete gift card"), success: "" });
    }
  };

  const toggleGiftCardActive = async (gc) => {
    try {
      await api.patch(`/owner/gift-cards/${gc.id}`, { isActive: !gc.isActive });
      setStatus({ error: "", success: `Gift card ${gc.isActive ? "deactivated" : "activated"}.` });
      await load();
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not update gift card"), success: "" });
    }
  };

  const filteredGiftCards = giftCards.filter(gc =>
    gc.code?.toLowerCase().includes(gcSearch.toLowerCase()) ||
    gc.title?.toLowerCase().includes(gcSearch.toLowerCase())
  );

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(couponSearch.toLowerCase()) ||
    c.title?.toLowerCase().includes(couponSearch.toLowerCase())
  );

  return (
    <div className="page-shell">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        .cpn-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s; }
        .cpn-input { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; transition: all 0.2s; background: #fff; box-sizing: border-box; }
        .cpn-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .cpn-label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        
        .cpn-btn { padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .cpn-btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        .cpn-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
        .cpn-btn-secondary { background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; }
        .cpn-btn-secondary:hover { background: #f1f5f9; border-color: #94a3b8; }
        
        .coupons-layout {
          display: flex;
          gap: 24px;
          margin-top: 20px;
          min-height: 600px;
        }
        .coupons-left-col {
          width: 32%;
          min-width: 300px;
        }
        .coupons-right-col {
          flex: 1;
        }
        .coupons-form-grid-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .coupons-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        
        /* Custom Radio & Checkbox */
        .cpn-radio-group { display: flex; gap: 16px; background: #f8fafc; padding: 6px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .cpn-radio-option { flex: 1; text-align: center; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; color: #64748b; }
        .cpn-radio-option.active { background: white; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        @media (max-width: 900px) {
          .coupons-layout { flex-direction: column !important; }
          .coupons-left-col { width: 100% !important; min-width: 0 !important; }
          .coupons-right-col { padding: 20px !important; }
          .coupons-form-grid-1, .coupons-form-grid-2 { grid-template-columns: 1fr !important; }
        }

        /* Premium Table Additions */
        .table-row-hover { transition: background 0.2s ease; }
        .table-row-hover:hover { background: #f8fafc !important; }
        .icon-btn { border-radius: 50%; transition: all 0.2s ease; }
        .icon-btn:hover { background: #f1f5f9 !important; transform: scale(1.05); }
        .icon-btn[title="Delete"]:hover { background: #fee2e2 !important; color: #dc2626 !important; }
      `}</style>
      <ModuleTabs
        title="Coupons & Gift Cards"
        description="Promotions, vouchers, gift card balances and redemption reporting."
        items={[
          { label: "Coupons", to: "/admin/coupons" },
          { label: "Gift Cards", to: "/admin/gift-cards" },
          { label: "Reports", to: "/admin/coupons/reports" }
        ]}
      />
      <div className="hero-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>Coupons & Gift Cards</h1>
            <p style={{ marginBottom: 0 }}>Manage promotions, vouchers, balances, and redemption performance without leaving the revenue workspace.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            <span style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#e0f2fe", color: "#0369a1", whiteSpace: "nowrap" }}>Coupons {coupons.length}</span>
            <span style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#f0fdf4", color: "#15803d", whiteSpace: "nowrap" }}>Gift Cards {giftCards.length}</span>
            <span style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#f5f3ff", color: "#6d28d9", whiteSpace: "nowrap" }}>{mode === "reports" ? "Reports" : "Active Setup"}</span>
          </div>
        </div>
      </div>
      {status.error && <div className="panel-card"><p className="error-text">{status.error}</p></div>}
      {status.success && <div className="panel-card"><p className="success-text">{status.success}</p></div>}
      {loading && <PageLoader title="Loading promotions workspace" message="Bringing together coupon rules, gift card balances, and redemption insights." />}

      {!loading && mode === "coupons" && (
        <div className="panel-card anim-fade">
          <div className="rpt-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} size={18} />
              <input 
                placeholder="Search coupons..." 
                value={couponSearch} 
                onChange={(e) => setCouponSearch(e.target.value)} 
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <button 
              className="primary-button" 
              onClick={() => { setEditingCoupon(null); setCouponForm(defaultCouponForm); setShowCouponModal(true); setStatus({ error: "", success: "" }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={18} /> Create Coupon
            </button>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Coupon Title</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Code</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Benefit</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row-hover">
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{row.title}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: 1 }}>{row.code}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#3b82f6", fontSize: 14 }}>{row.discountType === "PERCENT" ? `${Number(row.discountValue)}% OFF` : row.discountType === "CAMPAIGN" ? `CAMPAIGN ${Number(row.discountValue)}%` : `₹${Number(row.discountValue)} OFF`}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "inline-block", fontSize: 11, padding: "2px 6px", borderRadius: 4, background: !row.isArchived ? "#dcfce7" : "#f1f5f9", color: !row.isArchived ? "#166534" : "#475569", fontWeight: 600 }}>
                        {!row.isArchived ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => { handleEditCoupon(row); setShowCouponModal(true); }} className="icon-btn" style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, display: "flex" }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteCoupon(row.id)} className="icon-btn" style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 6, display: "flex" }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredCoupons.length && (
              <EmptyState title="No coupons found" message="Try adjusting your search or create a new coupon." />
            )}
          </div>
        </div>
      )}

      {!loading && mode === "giftCards" && (
        <div className="panel-card anim-fade">
          <div className="rpt-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} size={18} />
              <input 
                placeholder="Search gift cards..." 
                value={gcSearch} 
                onChange={(e) => setGcSearch(e.target.value)} 
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <button 
              className="primary-button" 
              onClick={() => { setEditingGc(null); setGiftCardForm(emptyGiftCard); setShowGiftCardModal(true); setStatus({ error: "", success: "" }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7c3aed' }}
            >
              <Plus size={18} /> Issue Gift Card
            </button>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Gift Card Code</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Title</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Balance</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Expires</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", fontSize: 13, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGiftCards.map((gc) => {
                  const balance = Number(gc.balanceAmount || 0);
                  const original = Number(gc.originalAmount || 0);
                  const isExpired = gc.expiresAt && new Date(gc.expiresAt) < new Date();
                  const daysLeft = gc.expiresAt ? Math.max(0, Math.ceil((new Date(gc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))) : null;
                  
                  return (
                  <tr key={gc.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="table-row-hover">
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "inline-block", background: "#f3e8ff", padding: "4px 8px", borderRadius: 6, fontWeight: 700, fontSize: 13, color: "#6d28d9", letterSpacing: 1 }}>{gc.code}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{gc.title}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>₹{balance.toFixed(0)}</span> <span style={{ fontSize: 13, color: "#64748b" }}>/ ₹{original.toFixed(0)}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, color: isExpired ? "#ef4444" : "#475569" }}>{daysLeft !== null ? (isExpired ? "Expired" : `${daysLeft} days`) : "Never"}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "inline-block", fontSize: 11, padding: "2px 6px", borderRadius: 4, background: isExpired ? "#fee2e2" : gc.isActive ? "#dcfce7" : "#f1f5f9", color: isExpired ? "#b91c1c" : gc.isActive ? "#166534" : "#475569", fontWeight: 600 }}>
                        {isExpired ? "Expired" : gc.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => toggleGiftCardActive(gc)} className="icon-btn" style={{ background: "transparent", border: "none", color: gc.isActive ? "#f59e0b" : "#10b981", cursor: "pointer", padding: 6, display: "flex" }} title={gc.isActive ? "Deactivate" : "Activate"}>
                          {gc.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button onClick={() => { setEditingGc(gc); setGiftCardForm({ code: gc.code, title: gc.title, originalAmount: gc.originalAmount, note: gc.note || "", isActive: gc.isActive ?? true, validityDays: gc.expiresAt ? Math.max(1, Math.round((new Date(gc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))) : 365 }); setShowGiftCardModal(true); }} className="icon-btn" style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, display: "flex" }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteGiftCard(gc.id)} className="icon-btn" style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 6, display: "flex" }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {!filteredGiftCards.length && (
              <EmptyState title="No gift cards found" message="Try adjusting your search or issue a new gift card." />
            )}
          </div>
        </div>
      )}

      {!loading && mode === "reports" && reports && (
        <div className="panel-card">
          <h3>Promotion Reports</h3>
          <div className="badge-row" style={{ marginBottom: 16 }}>
            <span className="badge">Coupon Savings ₹{reports.totalSavings || 0}</span>
          </div>
          <div className="list-stack">
            {(reports.redemptions || []).map((row) => (
              <div key={row.id} className="list-item">
                <strong>{row.coupon?.code || "-"}</strong>
                <div className="item-meta">Saved ₹{row.amountSaved}</div>
              </div>
            ))}
            {!reports.redemptions?.length && <EmptyState title="No promotion redemptions yet" message="Savings and gift card usage will appear here once customers begin using promotions." />}
          </div>
        </div>
      )}
      {showCouponModal && (
        <div className="premium-modal-overlay" onClick={() => setShowCouponModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, padding: 32, borderRadius: 16, background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{editingCoupon ? "Update Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setShowCouponModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={saveCoupon} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
                <ToggleSwitch
                  checked={couponForm.isActive}
                  onChange={(val) => setCouponForm({ ...couponForm, isActive: val })}
                  label={couponForm.isActive ? "Active" : "Inactive"}
                  color="#16a34a"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Name</span><input placeholder="e.g. Summer Special" required value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Code</span><input placeholder="e.g. SUMMER20" required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}/></label>
              </div>
              <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Description (Optional)</span><input placeholder="e.g. Valid only for first-time customers..." value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16 }}>
                <div><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Benefit Type</span><div style={{ display: 'flex', background: '#f8fafc', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}><div onClick={() => setCouponForm({ ...couponForm, discountType: "FIXED" })} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: couponForm.discountType === "FIXED" ? 'white' : 'transparent', boxShadow: couponForm.discountType === "FIXED" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: couponForm.discountType === "FIXED" ? '#0f172a' : '#64748b' }}>₹ Fixed</div><div onClick={() => setCouponForm({ ...couponForm, discountType: "PERCENT" })} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: couponForm.discountType === "PERCENT" ? 'white' : 'transparent', boxShadow: couponForm.discountType === "PERCENT" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: couponForm.discountType === "PERCENT" ? '#0f172a' : '#64748b' }}>% Pct</div></div></div>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Value {couponForm.discountType === "FIXED" ? "(₹)" : "(%)"}</span><input type="number" min="0" placeholder="50" required value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Activated Date</span><input type="date" required value={couponForm.startsAt} onChange={(e) => setCouponForm({ ...couponForm, startsAt: e.target.value })} min={new Date().toISOString().slice(0, 10)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Min. Bill (₹)</span><input type="number" min="0" placeholder="0 for none" value={couponForm.minBillAmount} onChange={(e) => setCouponForm({ ...couponForm, minBillAmount: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Usage Limit</span><input type="number" min="0" placeholder="Unlimited" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Validity (Days)</span><input type="number" min="1" placeholder="90" required value={couponForm.validityDays} onChange={(e) => setCouponForm({ ...couponForm, validityDays: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}>
                <div><div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Private Coupon</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Will not be visible on the public online catalog.</div></div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <ToggleSwitch
                      checked={couponForm.isPrivate}
                      onChange={(val) => setCouponForm({ ...couponForm, isPrivate: val })}
                      color="#3b82f6"
                    />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowCouponModal(false)} className="secondary-button">Cancel</button>
                <button type="submit" className="primary-button">{editingCoupon ? "Save Changes" : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGiftCardModal && (
        <div className="premium-modal-overlay" onClick={() => setShowGiftCardModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: 32, borderRadius: 16, background: '#ffffff', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{editingGc ? "Update Gift Card" : "Issue Gift Card"}</h2>
              <button onClick={() => setShowGiftCardModal(false)} style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={saveGiftCard} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
                <ToggleSwitch
                  checked={giftCardForm.isActive}
                  onChange={(val) => setGiftCardForm({ ...giftCardForm, isActive: val })}
                  label={giftCardForm.isActive ? "Active" : "Inactive"}
                  color="#7c3aed"
                />
              </div>
              <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Gift Card Code</span><input placeholder="e.g. GC-2024-001" required value={giftCardForm.code} onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}/></label>
              <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Title</span><input placeholder="e.g. Birthday Voucher" required value={giftCardForm.title} onChange={(e) => setGiftCardForm({ ...giftCardForm, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Amount (₹)</span><input type="number" min="1" placeholder="e.g. 1000" required value={giftCardForm.originalAmount} onChange={(e) => setGiftCardForm({ ...giftCardForm, originalAmount: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
                <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Validity (Days)</span><input type="number" min="1" placeholder="365" required value={giftCardForm.validityDays} onChange={(e) => setGiftCardForm({ ...giftCardForm, validityDays: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              </div>
              <label><span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Note (Optional)</span><input placeholder="Internal note..." value={giftCardForm.note} onChange={(e) => setGiftCardForm({ ...giftCardForm, note: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}/></label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowGiftCardModal(false)} className="secondary-button">Cancel</button>
                <button type="submit" className="primary-button" style={{ background: '#7c3aed' }}>{editingGc ? "Update Gift Card" : "Issue Gift Card"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
