Here's the fixed version with proper closing brackets and structure:

[Previous content remains unchanged until the return statement]

```typescript
return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* ... existing header content ... */}
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* ... existing basic info content ... */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Components */}
          <div className="lg:col-span-2 space-y-6">
            {/* Component Package */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* ... existing component package content ... */}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar Events */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* ... existing calendar events content ... */}
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* ... existing invoices content ... */}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInvoiceModal && (
        <AddInvoiceModal
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleSaveInvoice}
        />
      )}

      {showPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSave={handleSavePayment}
        />
      )}

      {showComponentModal && (
        <AddComponentModal
          onClose={() => setShowComponentModal(null)}
          onSave={handleSaveComponent}
          clientId={client.id}
          invoiceId={showComponentModal}
        />
      )}

      {showEditModal && (
        <ClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showEventModal && (
        <AddEventModal
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </>
  );
};

export default ClientProfile;
```