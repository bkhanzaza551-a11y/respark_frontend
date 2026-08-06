import { useCallback, useEffect, useMemo, useState } from "react";
import CustomDropdown from '../../components/common/CustomDropdown';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { Link, useLocation, useParams } from "react-router-dom";
import { Trash2, Edit2, Plus, PackageOpen, Package, X, UserPlus, Search } from 'lucide-react';
import { api } from "../../api/client";
import { useSalonSettings } from "../../context/SalonSettingsContext";
import { useBranch } from "../../context/BranchContext";
import EmptyState from "../../components/EmptyState";
import { formatApiError } from "../../utils/apiError";
import ModuleTabs from "../../components/ModuleTabs";
import PageLoader from "../../components/PageLoader";
import "./MembershipsPage.css";



const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 650, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
          <button onClick={onClose} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }} className="hub-form-group">
          {children}
        </div>
      </div>
    </div>
  );
};

const emptyMembership = {
  membershipType: "Fixed", // 'Fixed' or 'Percentage'
  name: "",
  isActive: true,
  price: "",
  validityDays: "",
  renewalReminder: "",
  isSharable: false,
  applySelectedDays: false,
  applySelectedServices: false,
  description: "",
  benefits: [{ label: "", value: "" }],
  benefitType: "WALLET_VALUE", // We will set this dynamically based on membershipType
  discountValue: "",
  walletValue: "",
  serviceIds: []
};
const emptyPackage = { name: "", price: 0, totalSessions: 5, validityDays: 60, services: [], products: [], includeProducts: false, selectedCategoryId: "" };
const emptyPackageRedeem = { customerPackageId: "", serviceId: "", sessionsUsed: 1, note: "" };
const normalizeRows = (value) => Array.isArray(value) ? value : value?.items || value?.rows || [];
const normalizeBenefits = (value) => {
  const rows = Array.isArray(value) ? value : [];
  return rows.length ? rows.map((item) => ({ label: item.label || "", value: item.value || "" })) : [{ label: "", value: "" }];
};
const cleanBenefits = (value) => normalizeBenefits(value).map((item) => ({
  label: String(item.label || "").trim(),
  value: String(item.value || "").trim()
})).filter((item) => item.label);

export default function MembershipsPage() {
  const location = useLocation();
  const { id: routeId } = useParams();
  const { formatMoney } = useSalonSettings();
  const { selectedBranchId } = useBranch();
  const customerId = location.pathname.includes("/customers/") ? routeId : "";
  const editableMembershipId = location.pathname.includes("/admin/memberships/") && location.pathname.includes("/edit") ? routeId : "";
  const editablePackageId = location.pathname.includes("/admin/packages/") && location.pathname.includes("/edit") ? routeId : "";
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [membershipForm, setMembershipForm] = useState(emptyMembership);
  const [packageForm, setPackageForm] = useState(emptyPackage);
  const [assignMembershipForm, setAssignMembershipForm] = useState({ customerId: customerId || "", membershipPlanId: "", startsAt: "" });
  const [assignPackageForm, setAssignPackageForm] = useState({ customerId: customerId || "", packageId: "", startsAt: "" });
  const [redeemForm, setRedeemForm] = useState(emptyPackageRedeem);
  const [membershipLifecycleForm, setMembershipLifecycleForm] = useState({ customerMembershipId: "", topUpAmount: 0, upgradePlanId: "", transferCustomerId: "", note: "" });
  const [packageLifecycleForm, setPackageLifecycleForm] = useState({ customerPackageId: "", additionalSessions: 0, transferCustomerId: "", note: "" });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAssignMembershipModal, setShowAssignMembershipModal] = useState(false);
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  
  useEffect(() => {
    if (editableMembershipId) setShowMembershipModal(true);
  }, [editableMembershipId]);

  useEffect(() => {
    if (editablePackageId) setShowPackageModal(true);
  }, [editablePackageId]);


  const applyWorkspaceData = useCallback(async ({
    membershipResponse,
    packageResponse,
    serviceResponse,
    serviceCategoryResponse,
    productResponse,
    customerResponse,
    activeCustomerId = "",
    active = true,
    membershipId = editableMembershipId,
    packageId = editablePackageId
  }) => {
    if (!active) return;

    const nextMemberships = membershipResponse.status === "fulfilled" ? normalizeRows(membershipResponse.value.data) : [];
    const nextPackages = packageResponse.status === "fulfilled" ? normalizeRows(packageResponse.value.data) : [];
    const nextServices = serviceResponse.status === "fulfilled" ? normalizeRows(serviceResponse.value.data) : [];
    const nextServiceCategories = serviceCategoryResponse?.status === "fulfilled" ? normalizeRows(serviceCategoryResponse.value.data) : [];
    const nextProducts = productResponse?.status === "fulfilled" ? normalizeRows(productResponse.value.data) : [];
    const nextCustomers = customerResponse.status === "fulfilled" ? normalizeRows(customerResponse.value.data) : [];

    setMemberships(nextMemberships);
    setPackages(nextPackages);
    setServices(nextServices);
    setServiceCategories(nextServiceCategories);
    setProducts(nextProducts);
    setCustomers(nextCustomers);

    if (activeCustomerId) {
      try {
        const historyResponse = await api.get(`/owner/customers/${activeCustomerId}/history`);
        if (!active) return;
        setSelectedCustomerHistory(historyResponse.data);
      } catch {
        if (!active) return;
        setSelectedCustomerHistory(null);
      }
    } else {
      setSelectedCustomerHistory(null);
    }

    if (membershipId) {
      try {
        const membershipDetail = await api.get(`/owner/memberships/${membershipId}`);
        if (!active) return;
        setMembershipForm({
          membershipType: membershipDetail.data.benefitType === "DISCOUNT_PERCENT" ? "Percentage" : "Fixed",
          name: membershipDetail.data.name || "",
          isActive: true, // Assuming true by default if no active flag
          description: membershipDetail.data.description || "",
          benefits: normalizeBenefits(membershipDetail.data.benefits),
          price: membershipDetail.data.price || "",
          validityDays: membershipDetail.data.validityDays || "",
          renewalReminder: "", // not in db yet?
          isSharable: false, // not in db yet?
          applySelectedDays: false,
          applySelectedServices: (membershipDetail.data.services || []).length > 0,
          benefitType: membershipDetail.data.benefitType || "WALLET_VALUE",
          discountValue: membershipDetail.data.discountValue || "",
          walletValue: membershipDetail.data.walletValue || "",
          serviceIds: (membershipDetail.data.services || []).map((item) => item.serviceId)
        });
      } catch {
        if (!active) return;
      }
    }

    if (packageId) {
      try {
        const packageDetail = await api.get(`/owner/packages/${packageId}`);
        if (!active) return;
        setPackageForm({
          name: packageDetail.data.name || "",
          price: packageDetail.data.price || 0,
          totalSessions: packageDetail.data.totalSessions || 5,
          validityDays: packageDetail.data.validityDays || 60,
          services: (packageDetail.data.services || []).map((item) => ({
            serviceId: item.serviceId,
            sessions: item.sessions || 1
          })),
          products: (packageDetail.data.products || []).map((item) => ({
            productId: item.productId,
            quantity: item.quantity || 1
          })),
          includeProducts: (packageDetail.data.products || []).length > 0,
          selectedCategoryId: ""
        });
      } catch {
        if (!active) return;
      }
    }

    const failedCoreLoads = [membershipResponse, packageResponse, serviceResponse, customerResponse].filter((entry) => entry.status !== "fulfilled");
    if (failedCoreLoads.length) {
      setStatus((current) => ({
        ...current,
        error: "Some memberships workspace data could not be loaded completely. Available lists are still usable."
      }));
    } else {
      setStatus((current) => ({ ...current, error: "" }));
    }
  }, [editableMembershipId, editablePackageId]);

  const loadAll = async (activeCustomerId = customerId || assignMembershipForm.customerId || assignPackageForm.customerId || "") => {
    setLoading(true);
    try {
      const [membershipResponse, packageResponse, serviceResponse, serviceCategoryResponse, productResponse, customerResponse] = await Promise.allSettled([
        api.get("/owner/memberships", { params: { branchId: selectedBranchId || undefined } }),
        api.get("/owner/packages", { params: { branchId: selectedBranchId || undefined } }),
        api.get("/owner/services", { params: { branchId: selectedBranchId || undefined } }),
        api.get("/owner/service-categories", { params: { branchId: selectedBranchId || undefined } }),
        api.get("/owner/inventory/products", { params: { branchId: selectedBranchId || undefined } }),
        api.get("/owner/customers", { params: { branchId: selectedBranchId || undefined } })
      ]);
      await applyWorkspaceData({ membershipResponse, packageResponse, serviceResponse, serviceCategoryResponse, productResponse, customerResponse, activeCustomerId });
    } catch (error) {
      setStatus({ error: formatApiError(error, "Could not load memberships, packages, customers, or services"), success: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [membershipResponse, packageResponse, serviceResponse, serviceCategoryResponse, productResponse, customerResponse] = await Promise.allSettled([
          api.get("/owner/memberships", { params: { branchId: selectedBranchId || undefined } }),
          api.get("/owner/packages", { params: { branchId: selectedBranchId || undefined } }),
          api.get("/owner/services", { params: { branchId: selectedBranchId || undefined } }),
          api.get("/owner/service-categories", { params: { branchId: selectedBranchId || undefined } }),
          api.get("/owner/inventory/products", { params: { branchId: selectedBranchId || undefined } }),
          api.get("/owner/customers", { params: { branchId: selectedBranchId || undefined } })
        ]);
        await applyWorkspaceData({
          membershipResponse,
          packageResponse,
          serviceResponse,
          serviceCategoryResponse,
          productResponse,
          customerResponse,
          activeCustomerId: customerId,
          active,
          membershipId: editableMembershipId,
          packageId: editablePackageId
        });
      } catch (error) {
        if (!active) return;
        setStatus({ error: formatApiError(error, "Could not load memberships workspace"), success: "" });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyWorkspaceData, customerId, editableMembershipId, editablePackageId, selectedBranchId]);

  const toggleMembershipService = (serviceId) => {
    setMembershipForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId) ? current.serviceIds.filter((id) => id !== serviceId) : [...current.serviceIds, serviceId]
    }));
  };

  const updateMembershipBenefit = (index, patch) => {
    setMembershipForm((current) => ({
      ...current,
      benefits: normalizeBenefits(current.benefits).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  };

  const addMembershipBenefit = () => {
    setMembershipForm((current) => ({
      ...current,
      benefits: [...normalizeBenefits(current.benefits), { label: "", value: "" }]
    }));
  };

  const removeMembershipBenefit = (index) => {
    setMembershipForm((current) => {
      const nextBenefits = normalizeBenefits(current.benefits).filter((_, itemIndex) => itemIndex !== index);
      return { ...current, benefits: nextBenefits.length ? nextBenefits : [{ label: "", value: "" }] };
    });
  };

  const togglePackageService = (serviceId) => {
    setPackageForm((current) => ({
      ...current,
      services: current.services.some((item) => item.serviceId === serviceId)
        ? current.services.filter((item) => item.serviceId !== serviceId)
        : [...current.services, { serviceId, sessions: 1 }]
    }));
  };

  const togglePackageProduct = (productId) => {
    setPackageForm((current) => ({
      ...current,
      products: current.products.some((item) => item.productId === productId)
        ? current.products.filter((item) => item.productId !== productId)
        : [...current.products, { productId, quantity: 1 }]
    }));
  };

  const collectCategoryServiceIds = (categoryId) => {
    const cat = serviceCategories.find((c) => c.id === categoryId);
    if (!cat) return [];
    const ids = new Set();
    (cat.services || []).forEach((s) => ids.add(s.id));
    (cat.children || []).forEach((child) => {
      (child.services || []).forEach((s) => ids.add(s.id));
    });
    return Array.from(ids);
  };

  const handleCategorySelect = (categoryId) => {
    if (!categoryId) {
      setPackageForm((current) => ({ ...current, selectedCategoryId: "" }));
      return;
    }
    const serviceIds = collectCategoryServiceIds(categoryId);
    setPackageForm((current) => {
      const existingIds = new Set(current.services.map((s) => s.serviceId));
      const merged = [...current.services];
      serviceIds.forEach((id) => {
        if (!existingIds.has(id)) {
          merged.push({ serviceId: id, sessions: 1 });
        }
      });
      return { ...current, selectedCategoryId: categoryId, services: merged };
    });
  };

  const removePackageService = (serviceId) => {
    setPackageForm((current) => ({
      ...current,
      services: current.services.filter((item) => item.serviceId !== serviceId)
    }));
  };

  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const activeSection = location.pathname.includes("/packages") ? "packages" : "memberships";
  const customerMembershipMode = location.pathname.includes("/customers/") && location.pathname.includes("/memberships");
  const customerPackageMode = location.pathname.includes("/customers/") && location.pathname.includes("/packages");
  const membershipEditMode = Boolean(editableMembershipId);
  const packageEditMode = Boolean(editablePackageId);
  const customerScopeLabel = customerId ? "Customer linked" : "All customers";
  const customerPackageOptions = useMemo(
    () => (selectedCustomerHistory?.packages || []).filter((item) => item.status === "ACTIVE" && Number(item.remainingSessions || 0) > 0),
    [selectedCustomerHistory]
  );
  const effectiveCustomerPackageId = redeemForm.customerPackageId || customerPackageOptions[0]?.id || "";
  const customerOptions = customers.map((customer) => (
    <option key={customer.id} value={customer.id}>{customer.name} {customer.phone ? `- ${customer.phone}` : ""}</option>
  ));

  // Strict branch-wise filtering — only show items for the selected branch
  const filteredMemberships = selectedBranchId
    ? memberships.filter(m => m.branchId === selectedBranchId)
    : memberships;
  const filteredPackages = selectedBranchId
    ? packages.filter(p => p.branchId === selectedBranchId)
    : packages;

  return (
    <div className="mem-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {status.error && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#fef2f2", color: "#dc2626", padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 12, fontWeight: 600 }}>
          {status.error}
          <button onClick={() => setStatus({...status, error: ""})} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>×</button>
        </div>
      )}
      {status.success && (
        <div style={{ position: "fixed", top: 80, right: 24, background: "#ecfdf5", color: "#059669", padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 12, fontWeight: 600 }}>
          ✓ {status.success}
          <button onClick={() => setStatus({...status, success: ""})} style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>×</button>
        </div>
      )}
      
      <ModalWrapper isOpen={showMembershipModal} onClose={() => { setShowMembershipModal(false); setMembershipForm(emptyMembership); }} title={membershipEditMode ? "Edit Membership Plan" : "Create Membership Plan"}>
        <form onSubmit={async (event) => {
              event.preventDefault();
              setStatus({ error: "", success: "" });
              try {
                if (!membershipForm.name.trim()) throw new Error("Membership name is required.");
                const isFixed = membershipForm.membershipType === "Fixed";
                const payload = {
                  ...membershipForm,
                  name: membershipForm.name.trim(),
                  description: membershipForm.description.trim(),
                  benefits: cleanBenefits(membershipForm.benefits),
                  price: Number(membershipForm.price),
                  validityDays: Number(membershipForm.validityDays),
                  benefitType: isFixed ? "WALLET_VALUE" : "DISCOUNT_PERCENT",
                  walletValue: isFixed ? Number(membershipForm.walletValue || 0) : 0,
                  discountValue: !isFixed ? Number(membershipForm.discountValue || 0) : 0,
                  // Pass new fields incase backend accepts them, otherwise they are ignored safely
                  renewalReminder: Number(membershipForm.renewalReminder || 0),
                  isSharable: membershipForm.isSharable,
                  applySelectedDays: membershipForm.applySelectedDays,
                  applySelectedServices: membershipForm.applySelectedServices,
                  serviceIds: membershipForm.applySelectedServices ? membershipForm.serviceIds : [],
                  branchId: selectedBranchId || null
                };
                if (membershipEditMode) {
                  await api.patch(`/owner/memberships/${editableMembershipId}`, payload);
                } else {
                  await api.post("/owner/memberships", payload);
                }
                setMembershipForm(emptyMembership);
                await loadAll();
                setStatus({ error: "", success: membershipEditMode ? "Membership updated." : "Membership created." }); setShowMembershipModal(false);
              } catch (error) {
                setStatus({ error: formatApiError(error, "Could not save membership"), success: "" });
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Membership Type Radio */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>Membership Type:</label>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem", color: "#0f172a" }}>
                    <input 
                      type="radio" 
                      name="membershipType" 
                      value="Fixed" 
                      checked={membershipForm.membershipType === "Fixed"} 
                      onChange={() => setMembershipForm({ ...membershipForm, membershipType: "Fixed" })}
                      style={{ accentColor: "#e11d48", width: "16px", height: "16px" }}
                    />
                    Fixed
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem", color: "#0f172a" }}>
                    <input 
                      type="radio" 
                      name="membershipType" 
                      value="Percentage" 
                      checked={membershipForm.membershipType === "Percentage"} 
                      onChange={() => setMembershipForm({ ...membershipForm, membershipType: "Percentage" })}
                      style={{ accentColor: "#e11d48", width: "16px", height: "16px" }}
                    />
                    Percentage
                  </label>
                </div>
              </div>

              {/* Name & Active */}
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Name" 
                    value={membershipForm.name} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })} 
                   
                  />
                </div>
                <ToggleSwitch label="Active" checked={membershipForm.isActive} onChange={(e) => setMembershipForm({ ...membershipForm, isActive: e.target.checked })} />
              </div>

              {/* Fees, Validity, Renewal Reminder, Standard Discount */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Fees</label>
                  <input 
                    type="number" 
                    placeholder="Enter Fee" 
                    value={membershipForm.price} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, price: e.target.value })} 
                   
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Validity</label>
                  <input 
                    type="number" 
                    placeholder="In Days" 
                    value={membershipForm.validityDays} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, validityDays: e.target.value })} 
                   
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Renewal Reminder</label>
                  <input 
                    type="number" 
                    placeholder="In Days" 
                    value={membershipForm.renewalReminder} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, renewalReminder: e.target.value })} 
                   
                  />
                </div>
                {membershipForm.membershipType === "Percentage" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Standard Discount '%'</label>
                    <input 
                      type="number" 
                      placeholder="Enter %" 
                      value={membershipForm.discountValue} 
                      onChange={(e) => setMembershipForm({ ...membershipForm, discountValue: e.target.value })} 
                     
                    />
                  </div>
                )}
              </div>

              {/* Benefit Amount (Fixed Only) */}
              {membershipForm.membershipType === "Fixed" && (
                <div style={{ width: "200px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Benefit Amount</label>
                  <input 
                    type="number" 
                    placeholder="Enter Amount" 
                    value={membershipForm.walletValue} 
                    onChange={(e) => setMembershipForm({ ...membershipForm, walletValue: e.target.value })} 
                   
                  />
                </div>
              )}

              {/* Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                <ToggleSwitch label="Membership Sharable" checked={membershipForm.isSharable} onChange={e => setMembershipForm({...membershipForm, isSharable: e.target.checked})} />
                
                {membershipForm.membershipType === "Percentage" && (
                  <>
                    <ToggleSwitch label="Apply For Selected Days" checked={membershipForm.applySelectedDays} onChange={e => setMembershipForm({...membershipForm, applySelectedDays: e.target.checked})} />

                    <ToggleSwitch label="Apply On Selected Services" checked={membershipForm.applySelectedServices} onChange={e => setMembershipForm({...membershipForm, applySelectedServices: e.target.checked})} />
                  </>
                )}
              </div>

              {/* Service Selection for Percentage (If enabled) */}
              {membershipForm.membershipType === "Percentage" && membershipForm.applySelectedServices && (
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>Select Services</label>
                  <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={serviceSearch} 
                    onChange={(e) => setServiceSearch(e.target.value)} 
                   
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                    {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).map((service) => {
                      const isSelected = membershipForm.serviceIds.includes(service.id);
                      return (
                        <button 
                          type="button" 
                          key={service.id} 
                          onClick={() => {
                            setMembershipForm(cur => ({
                              ...cur,
                              serviceIds: isSelected ? cur.serviceIds.filter(id => id !== service.id) : [...cur.serviceIds, service.id]
                            }));
                          }}
                          style={{
                            padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                            background: isSelected ? "#3b82f6" : "white",
                            color: isSelected ? "white" : "#475569",
                            border: isSelected ? "1px solid #3b82f6" : "1px solid #cbd5e1"
                          }}
                        >
                          {service.name}
                        </button>
                      );
                    })}
                    {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No services found</span>}
                  </div>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

              {/* Bottom Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ alignSelf: "flex-end", fontSize: "0.9rem", color: "#475569", fontWeight: 600 }}>
                  Total Amount To Pay: <span style={{ color: "#0f172a", fontWeight: 800 }}>{formatMoney(membershipForm.price || 0)}</span>
                </div>
                
                {membershipForm.membershipType === "Fixed" && (
                  <div style={{ background: "#e2e8f0", padding: "12px", borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "#334155" }}>Final benefit amount is: <strong style={{ color: "var(--accent, #3b82f6)" }}>{formatMoney(membershipForm.walletValue || 0)}</strong></span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => { setMembershipForm(emptyMembership); setShowMembershipModal(false); }} style={{ padding: "8px 24px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 32px", borderRadius: "6px", border: "none", background: "var(--button-bg-solid, #3b82f6)", color: "white", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}>Save</button>
              </div>

            </form>
      </ModalWrapper>

      <ModalWrapper isOpen={showPackageModal} onClose={() => { setShowPackageModal(false); setPackageForm(emptyPackage); }} title={packageEditMode ? "Edit Package" : "Create Package"}>
        <form onSubmit={async (event) => {
              event.preventDefault();
              setStatus({ error: "", success: "" });
              try {
                if (!packageForm.name.trim()) throw new Error("Package name is required.");
                if (!packageForm.services.length) throw new Error("Select at least one service for this package.");
                const payload = {
                  ...packageForm,
                  name: packageForm.name.trim(),
                  price: Number(packageForm.price),
                  totalSessions: Number(packageForm.totalSessions),
                  validityDays: Number(packageForm.validityDays),
                  branchId: selectedBranchId || undefined,
                  services: packageForm.services.map((item) => ({
                    serviceId: item.serviceId,
                    sessions: Number(item.sessions || 1)
                  })),
                  products: packageForm.includeProducts ? packageForm.products.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity || 1)
                  })) : []
                };
                delete payload.selectedCategoryId;
                if (packageEditMode) {
                  await api.patch(`/owner/packages/${editablePackageId}`, payload);
                } else {
                  await api.post("/owner/packages", payload);
                }
                setPackageForm(emptyPackage);
                setServiceSearch("");
                setProductSearch("");
                await loadAll();
                setStatus({ error: "", success: packageEditMode ? "Package updated." : "Package created." }); setShowPackageModal(false);
              } catch (error) {
                setStatus({ error: formatApiError(error, "Could not save package"), success: "" });
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Name & Active */}
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Package name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bridal Package" 
                    value={packageForm.name} 
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} 
                   
                  />
                </div>
                <ToggleSwitch label="Active" checked={true} onChange={() => {}} />
              </div>

              {/* Price, Total Sessions, Validity */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Price</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    value={packageForm.price} 
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} 
                   
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Total sessions</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="5" 
                    value={packageForm.totalSessions} 
                    onChange={(e) => setPackageForm({ ...packageForm, totalSessions: e.target.value })} 
                   
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "6px" }}>Validity (Days)</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="60" 
                    value={packageForm.validityDays} 
                    onChange={(e) => setPackageForm({ ...packageForm, validityDays: e.target.value })} 
                   
                  />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                <ToggleSwitch label="Include physical products" checked={packageForm.includeProducts} onChange={e => setPackageForm({...packageForm, includeProducts: e.target.checked})} />
              </div>

              {/* Service Category + Selected Services + Individual Services */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>Service Category</label>
                <CustomDropdown
                  value={packageForm.selectedCategoryId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                 
                >
                  <option value="">Select a category to auto-add services</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </CustomDropdown>

                {packageForm.services.length > 0 && (
                  <>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>
                      Included Services ({packageForm.services.length})
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto", marginBottom: "16px" }}>
                      {packageForm.services.map((item) => {
                        const svc = services.find((s) => s.id === item.serviceId);
                        if (!svc) return null;
                        return (
                          <div key={item.serviceId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "white", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: 500 }}>
                              {svc.name}
                              {svc.category ? <span style={{ color: "#94a3b8", marginLeft: "6px" }}>({svc.category.name})</span> : null}
                              {svc.price ? <span style={{ color: "#64748b", marginLeft: "6px" }}>— {formatMoney(svc.price)}</span> : null}
                            </span>
                            <button type="button" onClick={() => removePackageService(item.serviceId)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, padding: "2px 6px" }}>
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 12px 0" }} />

                <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>Add Individual Services</label>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                 
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                  {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).map((service) => {
                    const isSelected = packageForm.services.some((item) => item.serviceId === service.id);
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => togglePackageService(service.id)}
                        style={{
                          padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                          background: isSelected ? "#3b82f6" : "white",
                          color: isSelected ? "white" : "#475569",
                          border: isSelected ? "1px solid #3b82f6" : "1px solid #cbd5e1"
                        }}
                      >
                        {service.name}
                      </button>
                    );
                  })}
                  {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No services found</span>}
                </div>
              </div>

              {/* Product Selection */}
              {packageForm.includeProducts && (
                <div style={{ background: "#fdf8f5", padding: "16px", borderRadius: "8px", border: "1px solid #f0e1df" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: "8px" }}>Included Products</label>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={productSearch} 
                    onChange={(e) => setProductSearch(e.target.value)} 
                   
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((product) => {
                      const isSelected = packageForm.products.some((item) => item.productId === product.id);
                      return (
                        <button 
                          type="button" 
                          key={product.id} 
                          onClick={() => togglePackageProduct(product.id)}
                          style={{
                            padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                            background: isSelected ? "#f97316" : "white",
                            color: isSelected ? "white" : "#475569",
                            border: isSelected ? "1px solid #f97316" : "1px solid #cbd5e1"
                          }}
                        >
                          {product.name}
                        </button>
                      );
                    })}
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No products found</span>}
                  </div>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

              {/* Bottom Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ alignSelf: "flex-end", fontSize: "0.9rem", color: "#475569", fontWeight: 600 }}>
                  Total Amount To Pay: <span style={{ color: "#0f172a", fontWeight: 800 }}>{formatMoney(packageForm.price || 0)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => { setPackageForm(emptyPackage); setServiceSearch(""); setProductSearch(""); setShowPackageModal(false); }} style={{ padding: "8px 24px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f1f5f9", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 32px", borderRadius: "6px", border: "none", background: "var(--button-bg-solid, #3b82f6)", color: "white", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}>Save</button>
              </div>

            </form>
      </ModalWrapper>

      <ModalWrapper isOpen={showAssignMembershipModal} onClose={() => setShowAssignMembershipModal(false)} title="Assign Membership">
        <form onSubmit={async (event) => {
            event.preventDefault();
            setStatus({ error: "", success: "" });
            try {
              await api.post("/owner/memberships/assign", {
                ...assignMembershipForm,
                customerId: customerId || assignMembershipForm.customerId,
                startsAt: assignMembershipForm.startsAt || undefined
              });
              await loadAll(customerId || assignMembershipForm.customerId);
              setAssignMembershipForm({ customerId: customerId || "", membershipPlanId: "", startsAt: "" });
              setStatus({ error: "", success: "Membership assigned." }); setShowAssignMembershipModal(false);
              setTimeout(() => setStatus({ error: "", success: "" }), 3000);
            } catch (error) {
              setStatus({ error: formatApiError(error, "Could not assign membership"), success: "" });
            }
          }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!customerId && (
              <label>
                <span className="muted">Customer</span>
                <CustomDropdown value={assignMembershipForm.customerId} onChange={async (event) => {
                  const nextCustomerId = event.target.value;
                  setAssignMembershipForm((current) => ({ ...current, customerId: nextCustomerId }));
                  if (nextCustomerId) await loadAll(nextCustomerId);
                }}>
                  <option value="">Select customer</option>
                  {loading ? <option value="" disabled>Loading customers...</option> : null}
                  {!loading && !customers.length ? <option value="" disabled>No customers found</option> : null}
                  {customerOptions}
                </CustomDropdown>
              </label>
            )}
            <label>
              <span className="muted">Membership plan</span>
              <CustomDropdown value={assignMembershipForm.membershipPlanId} onChange={(event) => setAssignMembershipForm((current) => ({ ...current, membershipPlanId: event.target.value }))}>
                <option value="">Select membership plan</option>
                {filteredMemberships.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </CustomDropdown>
            </label>
            <label>
              <span className="muted">Start Date</span>
              <input type="date" value={assignMembershipForm.startsAt} onChange={(event) => setAssignMembershipForm((current) => ({ ...current, startsAt: event.target.value }))} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Assign Membership</button>
            </div>
          </form>
      </ModalWrapper>

      <ModalWrapper isOpen={showAssignPackageModal} onClose={() => setShowAssignPackageModal(false)} title="Assign Package">
        <form onSubmit={async (event) => {
            event.preventDefault();
            setStatus({ error: "", success: "" });
            try {
              await api.post("/owner/packages/assign", {
                ...assignPackageForm,
                customerId: customerId || assignPackageForm.customerId,
                startsAt: assignPackageForm.startsAt || undefined
              });
              await loadAll(customerId || assignPackageForm.customerId);
              setAssignPackageForm({ customerId: customerId || "", packageId: "", startsAt: "" });
              setStatus({ error: "", success: "Package assigned." }); setShowAssignPackageModal(false);
              setTimeout(() => setStatus({ error: "", success: "" }), 3000);
            } catch (error) {
              setStatus({ error: formatApiError(error, "Could not assign package"), success: "" });
            }
          }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!customerId && (
              <label>
                <span className="muted">Customer</span>
                <CustomDropdown value={assignPackageForm.customerId} onChange={async (event) => {
                  const nextCustomerId = event.target.value;
                  setAssignPackageForm((current) => ({ ...current, customerId: nextCustomerId }));
                  if (nextCustomerId) await loadAll(nextCustomerId);
                }}>
                  <option value="">Select customer</option>
                  {loading ? <option value="" disabled>Loading customers...</option> : null}
                  {!loading && !customers.length ? <option value="" disabled>No customers found</option> : null}
                  {customerOptions}
                </CustomDropdown>
              </label>
            )}
            <label>
              <span className="muted">Package</span>
              <CustomDropdown value={assignPackageForm.packageId} onChange={(event) => setAssignPackageForm((current) => ({ ...current, packageId: event.target.value }))}>
                <option value="">Select package</option>
                {filteredPackages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </CustomDropdown>
            </label>
            <label>
              <span className="muted">Start Date</span>
              <input type="date" value={assignPackageForm.startsAt} onChange={(event) => setAssignPackageForm((current) => ({ ...current, startsAt: event.target.value }))} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Assign Package</button>
            </div>
          </form>
      </ModalWrapper>

      <div className="page-shell">
        {customerId ? (
          <ModuleTabs
            title="Customer Timeline"
            description="Complete CRM view with service history, billing, memberships, packages, and event trail."
            items={[
              { label: "Customer List", to: "/admin/customers", hint: "Back" },
              { label: "History View", to: `/admin/customers/${customerId}/history`, hint: "Profile" },
              { label: "Memberships", to: `/admin/customers/${customerId}/memberships`, hint: "Loyalty" },
              { label: "Packages", to: `/admin/customers/${customerId}/packages`, hint: "Prepaid" }
            ]}
            actions={<Link to="/admin/customers" className="module-tab">Back to Customers</Link>}
          />
        ) : (
          <ModuleTabs
            title="Memberships & Packages"
            description="Control recurring loyalty products, prepaid sessions, and service access in one revenue workspace."
            items={[
              { label: "Membership Plans", to: "/admin/memberships", hint: "Recurring" },
              { label: "Packages", to: "/admin/packages", hint: "Prepaid" }
            ]}
          />
        )}
        
        <div className="page-shell">
          {activeSection === "memberships" && (
            <div className="panel-card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
              <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 10, color: "#64748b" }} />
                  <input 
                    placeholder="Search memberships..." 
                    value={searchQuery || ""} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {!customerMembershipMode && (
                    <button onClick={() => setShowAssignMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer" }}><UserPlus size={16}/> Assign</button>
                  )}
                  {!customerMembershipMode && (
                    <button onClick={() => setShowMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Create Plan</button>
                  )}
                  {customerMembershipMode && (
                    <button onClick={() => setShowAssignMembershipModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Assign Membership</button>
                  )}
                </div>
              </div>
              
              {loading ? <PageLoader compact title="Loading..." /> : null}
              
              <table className="crm-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>PLAN NAME</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>TYPE</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>PRICE</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>VALIDITY</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>BENEFIT</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", width: 140 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(customerMembershipMode ? (selectedCustomerHistory?.memberships || []) : filteredMemberships).map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="crm-table-row">
                      <td style={{ padding: "16px", fontWeight: 600, color: "#0f172a" }}>{customerMembershipMode ? item.membershipPlan?.name : item.name}</td>
                      <td style={{ padding: "16px" }}><span className="badge" style={{ background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: 4, fontSize: "0.8rem", fontWeight: 600 }}>{customerMembershipMode ? item.status : (item.benefitType === "WALLET_VALUE" ? "Fixed Wallet" : "Percentage")}</span></td>
                      <td style={{ padding: "16px", fontWeight: 600, color: "#0f172a" }}>{formatMoney(Number(item.price || 0))}</td>
                      <td style={{ padding: "16px", color: "#475569", fontSize: "0.9rem" }}>{customerMembershipMode ? `Ends ${String(item.endsAt).slice(0, 10)}` : `${item.validityDays} days`}</td>
                      <td style={{ padding: "16px", color: "#475569", fontWeight: 600 }}>{customerMembershipMode ? formatMoney(Number(item.remainingWalletValue || 0)) : (item.benefitType === "WALLET_VALUE" ? formatMoney(Number(item.walletValue || 0)) : `${item.discountValue}%`)}</td>
                      <td style={{ padding: "16px" }}>
                        {!customerMembershipMode && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link to={`/admin/memberships/${item.id}/edit`} className="secondary-button" style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, color: "#475569", fontSize: "0.85rem", textDecoration: "none" }}>Edit</Link>
                            <button type="button" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }} disabled={deletingId === item.id} onClick={async () => {
                              if (!window.confirm(`Delete membership plan "${item.name}"?`)) return;
                              try {
                                setDeletingId(item.id);
                                await api.delete(`/owner/memberships/${item.id}`);
                                setStatus({ error: "", success: "Membership plan deleted." });
                                setTimeout(() => setStatus({ error: "", success: "" }), 3000);
                                await loadAll(customerId);
                              } catch (error) {
                                setStatus({ error: formatApiError(error, "Could not delete plan"), success: "" });
                              } finally {
                                setDeletingId(null);
                              }
                            }}>{deletingId === item.id ? "..." : <Trash2 size={14} />}</button>
                          </div>
                        )}
                        {customerMembershipMode && (
                          <button type="button" className="secondary-button" onClick={() => setMembershipLifecycleForm((current) => ({ ...current, customerMembershipId: item.id }))}>Lifecycle</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {((customerMembershipMode ? (selectedCustomerHistory?.memberships || []) : filteredMemberships).length === 0 && !loading) && (
                    <tr>
                      <td colSpan="6" style={{ padding: 40, textAlign: "center" }}>
                        <EmptyState title="No memberships found" message="Create a membership plan to see it here." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "packages" && (
            <div className="panel-card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
              <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 10, color: "#64748b" }} />
                  <input 
                    placeholder="Search packages..." 
                    value={searchQuery || ""} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {!customerPackageMode && (
                    <button onClick={() => setShowAssignPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer" }}><UserPlus size={16}/> Assign</button>
                  )}
                  {!customerPackageMode && (
                    <button onClick={() => setShowPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Create Package</button>
                  )}
                  {customerPackageMode && (
                    <button onClick={() => setShowAssignPackageModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#10b981", color: "white", padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}><Plus size={16}/> Assign Package</button>
                  )}
                </div>
              </div>
              
              {loading ? <PageLoader compact title="Loading..." /> : null}
              
              <table className="crm-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>PACKAGE NAME</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>PRICE</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>SESSIONS</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>VALIDITY</th>
                    <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", width: 140 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {(customerPackageMode ? (selectedCustomerHistory?.packages || []) : filteredPackages).map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="crm-table-row">
                      <td style={{ padding: "16px", fontWeight: 600, color: "#0f172a" }}>{customerPackageMode ? item.package?.name : item.name}</td>
                      <td style={{ padding: "16px", fontWeight: 600, color: "#0f172a" }}>{formatMoney(Number(item.price || 0))}</td>
                      <td style={{ padding: "16px" }}>{customerPackageMode ? <span className="badge" style={{ background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: 4, fontSize: "0.8rem", fontWeight: 600 }}>{item.remainingSessions} remaining</span> : <span style={{ color: "#475569", fontSize: "0.9rem" }}>{item.totalSessions} sessions</span>}</td>
                      <td style={{ padding: "16px", color: "#475569", fontSize: "0.9rem" }}>{customerPackageMode ? `Ends ${String(item.endsAt).slice(0, 10)}` : `${item.validityDays} days`}</td>
                      <td style={{ padding: "16px" }}>
                        {!customerPackageMode && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link to={`/admin/packages/${item.id}/edit`} className="secondary-button" style={{ padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, color: "#475569", fontSize: "0.85rem", textDecoration: "none" }}>Edit</Link>
                            <button type="button" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }} disabled={deletingId === item.id} onClick={async () => {
                              if (!window.confirm(`Delete package "${item.name}"?`)) return;
                              try {
                                setDeletingId(item.id);
                                await api.delete(`/admin/packages/${item.id}`);
                                setStatus({ error: "", success: "Package deleted." });
                                setTimeout(() => setStatus({ error: "", success: "" }), 3000);
                                await loadAll(customerId);
                              } catch (error) {
                                setStatus({ error: formatApiError(error, "Could not delete package"), success: "" });
                              } finally {
                                setDeletingId(null);
                              }
                            }}>{deletingId === item.id ? "..." : <Trash2 size={14} />}</button>
                          </div>
                        )}
                        {customerPackageMode && (
                          <button type="button" className="secondary-button" onClick={() => setPackageLifecycleForm((current) => ({ ...current, customerPackageId: item.id }))}>Lifecycle</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {((customerPackageMode ? (selectedCustomerHistory?.packages || []) : filteredPackages).length === 0 && !loading) && (
                    <tr>
                      <td colSpan="5" style={{ padding: 40, textAlign: "center" }}>
                        <EmptyState title="No packages found" message="Create a package to see it here." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
