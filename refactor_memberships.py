import re
import sys

def process_file():
    with open('src/pages/owner/MembershipsPage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add X icon and new state variables
    content = content.replace(
        'import { Trash2, Edit2, Plus, PackageOpen, Package } from "lucide-react";',
        'import { Trash2, Edit2, Plus, PackageOpen, Package, X, UserPlus } from "lucide-react";'
    )
    
    state_injection = """  const [deletingId, setDeletingId] = useState(null);
  
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  const [showAssignMembershipModal, setShowAssignMembershipModal] = useState(false);
  
  const isCreateOrEditRoute = location.pathname.includes("/create") || location.pathname.includes("/edit");
  const handleCloseModal = () => {
    navigate(activeSection === "packages" ? "/admin/packages" : "/admin/memberships");
    if (activeSection === "packages") setPackageForm(emptyPackage);
    if (activeSection === "memberships") setMembershipForm(emptyMembership);
  };
"""
    # Wait, navigate isn't imported? It is! Let's check imports. No wait, it's useLocation, useParams.
    # Let's add useNavigate.
    content = content.replace(
        'import { Link, useLocation, useParams } from "react-router-dom";',
        'import { Link, useLocation, useParams, useNavigate } from "react-router-dom";'
    )
    content = content.replace(
        'const location = useLocation();',
        'const location = useLocation();\n  const navigate = useNavigate();'
    )
    content = content.replace('  const [deletingId, setDeletingId] = useState(null);', state_injection)


    # 2. Add Modal Wrapper Component at the top (outside default export)
    modal_wrapper = """
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} onClick={e => e.stopPropagation()}>
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

"""
    content = content.replace('const emptyMembership = {', modal_wrapper + '\nconst emptyMembership = {')


    # 3. Replace .settings-section-grid layout entirely
    # Let's just find the start of <div className="page-shell"> and rewrite the main structure
    # Because we need the table format, and then modals for forms.

    with open('src/pages/owner/MembershipsPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

process_file()
