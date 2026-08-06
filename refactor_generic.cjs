const fs = require('fs');

let content = fs.readFileSync('src/pages/owner/SettingsPage.jsx', 'utf8');

const replacement = `  const renderGenericSection = () => {
    const generic = form.advancedSettings.genericSettings;
    const allChecked = WEEK_DAYS.every((day) => generic.weeklyOff.includes(day.key));

    const toggleWeeklyOff = (dayKey) => {
      const active = generic.weeklyOff.includes(dayKey);
      const nextWeeklyOff = active 
        ? generic.weeklyOff.filter((item) => item !== dayKey)
        : [...generic.weeklyOff, dayKey];
      updateGeneric("weeklyOff", nextWeeklyOff);
    };

    const toggleAllWeeklyOff = (checked) => {
      if (checked) {
        updateGeneric("weeklyOff", WEEK_DAYS.map((day) => day.key));
      } else {
        updateGeneric("weeklyOff", []);
      }
    };

    return (
      <>
        <SectionHeader
          title="Generic Settings"
          description="Business timing, storefront behavior, booking rules, checkout defaults, and currency propagation are managed from this workspace."
        />

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Business Settings</h3>
          </div>

          <div className="business-settings-content">
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
              <ToggleSwitch
                checked={generic.businessOpen}
                onChange={(e) => updateGeneric("businessOpen", e.target.checked)}
                label="Is Business Open?"
              />
            </div>

            <div className="settings-form-grid" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
              <label className="settings-input-group">
                <span className="muted">Salon Name on Invoice</span>
                <input
                  type="text"
                  value={generic.salonName || ""}
                  onChange={(event) => updateGeneric("salonName", event.target.value)}
                  placeholder="Enter salon name..."
                />
              </label>
              <label className="settings-input-group">
                <span className="muted">Salon Phone on Invoice</span>
                <input
                  type="text"
                  value={generic.salonPhone || ""}
                  onChange={(event) => updateGeneric("salonPhone", event.target.value)}
                  placeholder="Enter phone number..."
                />
              </label>
              <label className="settings-input-group">
                <span className="muted">Salon Address on Invoice</span>
                <input
                  type="text"
                  value={generic.salonAddress || ""}
                  onChange={(event) => updateGeneric("salonAddress", event.target.value)}
                  placeholder="Enter address..."
                />
              </label>
            </div>

            <div className="settings-form-grid" style={{ marginBottom: 24 }}>
              <div>
                <span className="muted" style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>Business Timing</span>
                <div style={{ display: "flex", gap: 16 }}>
                  <label className="settings-input-group" style={{ flex: 1 }}>
                    <span className="muted" style={{ fontSize: 11 }}>From</span>
                    <input
                      type="time"
                      value={generic.businessStart}
                      onChange={(event) => updateGeneric("businessStart", event.target.value)}
                    />
                  </label>
                  <label className="settings-input-group" style={{ flex: 1 }}>
                    <span className="muted" style={{ fontSize: 11 }}>To</span>
                    <input
                      type="time"
                      value={generic.businessEnd}
                      onChange={(event) => updateGeneric("businessEnd", event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="muted" style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>Applicable For</span>
                <div style={{ display: "flex", gap: 16, alignItems: "center", height: 42 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="radio" name="applicableFor" value="female" checked={generic.applicableFor === "female"} onChange={() => updateGeneric("applicableFor", "female")} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} /> Female
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="radio" name="applicableFor" value="male" checked={generic.applicableFor === "male"} onChange={() => updateGeneric("applicableFor", "male")} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} /> Male
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="radio" name="applicableFor" value="both" checked={generic.applicableFor === "both"} onChange={() => updateGeneric("applicableFor", "both")} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} /> Both
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <span className="muted" style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 13, color: "#1e293b" }}>Set Weekly Off</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={allChecked} onChange={(e) => toggleAllWeeklyOff(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} /> All
                </label>
                {WEEK_DAYS.map((day) => (
                  <label key={day.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="checkbox" checked={generic.weeklyOff.includes(day.key)} onChange={() => toggleWeeklyOff(day.key)} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} /> {day.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Online Payment & Orders</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ToggleSwitch
              checked={generic.onlinePaymentEnabled}
              onChange={(e) => updateGeneric("onlinePaymentEnabled", e.target.checked)}
              label="Enable Online Payment for Orders & Appointments"
            />
            <ToggleSwitch
              checked={generic.productOrderingEnabled}
              onChange={(e) => updateGeneric("productOrderingEnabled", e.target.checked)}
              label="Enable Product Ordering"
            />
            
            <div style={{ display: "flex", gap: 40, marginTop: 10, marginLeft: 10, paddingLeft: 20, borderLeft: "2px solid #e2e8f0" }}>
              <ToggleSwitch
                checked={generic.homeDeliveryEnabled}
                onChange={(e) => updateGeneric("homeDeliveryEnabled", e.target.checked)}
                label="Home Delivery"
              />
              <ToggleSwitch
                checked={generic.pickupOrderingEnabled}
                onChange={(e) => updateGeneric("pickupOrderingEnabled", e.target.checked)}
                label="Pickup Orders"
              />
            </div>
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Storefront Permissions</h3>
          </div>
          <div className="settings-form-grid" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
            <label className="settings-input-group">
              <span className="muted">Minimum Order Value</span>
              <input
                type="number"
                value={generic.minOrderValue}
                onChange={(event) => updateGeneric("minOrderValue", Number(event.target.value))}
              />
            </label>
            <label className="settings-input-group">
              <span className="muted">Delivery Fee</span>
              <input
                type="number"
                value={generic.deliveryFee}
                onChange={(event) => updateGeneric("deliveryFee", Number(event.target.value))}
              />
            </label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ToggleSwitch checked={generic.allowCustomerCancel} onChange={(e) => updateGeneric("allowCustomerCancel", e.target.checked)} label="Customers can cancel appointments" />
            <ToggleSwitch checked={generic.allowCustomerReschedule} onChange={(e) => updateGeneric("allowCustomerReschedule", e.target.checked)} label="Customers can reschedule appointments" />
            <ToggleSwitch checked={generic.showCancelledInHistory} onChange={(e) => updateGeneric("showCancelledInHistory", e.target.checked)} label="Show cancelled appointments in customer history" />
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Storefront Content</h3>
          </div>
          <div className="settings-form-grid">
            <label className="settings-input-group" style={{ gridColumn: "1 / -1" }}>
              <span className="muted">Delivery Disclaimer</span>
              <textarea rows="2" value={generic.deliveryDisclaimer} onChange={(event) => updateGeneric("deliveryDisclaimer", event.target.value)} placeholder="Enter Delivery Disclaimer text..." />
            </label>
            <label className="settings-input-group" style={{ gridColumn: "1 / -1" }}>
              <span className="muted">Pickup Disclaimer</span>
              <textarea rows="2" value={generic.pickupDisclaimer} onChange={(event) => updateGeneric("pickupDisclaimer", event.target.value)} placeholder="Enter Pickup Disclaimer text..." />
            </label>
            <label className="settings-input-group">
              <span className="muted">Service List Heading</span>
              <input type="text" value={generic.serviceListHeading} onChange={(event) => updateGeneric("serviceListHeading", event.target.value)} placeholder="Our Services" />
            </label>
            <label className="settings-input-group">
              <span className="muted">Product List Heading</span>
              <input type="text" value={generic.productListHeading} onChange={(event) => updateGeneric("productListHeading", event.target.value)} placeholder="Products For Sale" />
            </label>
            <label className="settings-input-group">
              <span className="muted">Use Currency</span>
              <CustomDropdown value={normalizeCurrencyCode(generic.currency || "INR")} onChange={(event) => updateGeneric("currency", event.target.value)}>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="AED">UAE Dirham (AED)</option>
                <option value="SAR">Saudi Riyal (SAR)</option>
              </CustomDropdown>
            </label>
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Payment Modes</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(paymentModes).map(([key, value]) => (
              <ToggleSwitch key={key} checked={value} onChange={() => togglePaymentMode(key)} label={key === "bankTransfer" ? "Bank Transfer" : key.charAt(0).toUpperCase() + key.slice(1)} />
            ))}
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>POS & Back-Office Rules</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ToggleSwitch checked={form.advancedSettings.allowFutureBackdatedBills} onChange={(e) => updateAdvancedObject("allowFutureBackdatedBills", e.target.checked)} label="Allow future backdated bills" />
            <ToggleSwitch checked={form.advancedSettings.allowBackdatedAppointments} onChange={(e) => updateAdvancedObject("allowBackdatedAppointments", e.target.checked)} label="Allow backdated appointments" />
            <ToggleSwitch checked={form.advancedSettings.allowPriceEditOnBill} onChange={(e) => updateAdvancedObject("allowPriceEditOnBill", e.target.checked)} label="Allow price edit on bill" />
            <ToggleSwitch checked={form.advancedSettings.allowPOPriceEdit} onChange={(e) => updateAdvancedObject("allowPOPriceEdit", e.target.checked)} label="Allow PO price edit" />
            <ToggleSwitch checked={form.advancedSettings.allowPriceEditWhilePOSettlement} onChange={(e) => updateAdvancedObject("allowPriceEditWhilePOSettlement", e.target.checked)} label="Allow price edit while PO settlement" />
            <ToggleSwitch checked={form.advancedSettings.allowEditConsumable} onChange={(e) => updateAdvancedObject("allowEditConsumable", e.target.checked)} label="Allow edit consumable" />
            <ToggleSwitch checked={form.advancedSettings.allowReportDateRestriction} onChange={(e) => updateAdvancedObject("allowReportDateRestriction", e.target.checked)} label="Allow report date restriction" />
          </div>
        </div>

        <div className="settings-panel-card">
          <div className="settings-panel-header-with-toggle" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            <h3>Booking & Invoice Defaults</h3>
          </div>
          <div className="settings-form-grid">
            <label className="settings-input-group">
              <span className="muted">Tax Label</span>
              <input type="text" value={form.taxLabel} onChange={(e) => setForm((c) => ({ ...c, taxLabel: e.target.value }))} placeholder="e.g. GST" />
            </label>
            <label className="settings-input-group" style={{ gridColumn: "1 / -1" }}>
              <span className="muted">Booking Notes</span>
              <textarea value={form.bookingNotes} onChange={(e) => setForm((c) => ({ ...c, bookingNotes: e.target.value }))} placeholder="e.g. Please arrive 10 minutes early" style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: 6, width: "100%", boxSizing: "border-box", outline: "none", minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
            </label>
            <label className="settings-input-group" style={{ gridColumn: "1 / -1" }}>
              <span className="muted">Cancellation Policy</span>
              <textarea value={form.cancellationPolicy} onChange={(e) => setForm((c) => ({ ...c, cancellationPolicy: e.target.value }))} placeholder="e.g. Free cancellation up to 24 hours before" style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: 6, width: "100%", boxSizing: "border-box", outline: "none", minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
            </label>
          </div>
        </div>

      </>
    );
  };`;

const startStr = '  const renderGenericSection = () => {';
const startIdx = content.indexOf(startStr);
const endStr = '  const renderShiftSection = () => {';
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + replacement + '\n\n' + content.substring(endIdx);
    fs.writeFileSync('src/pages/owner/SettingsPage.jsx', content);
    console.log('Successfully refactored generic settings!');
} else {
    console.log('Could not find generic section');
}
