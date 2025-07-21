// Debug script untuk check dan fix invoice issues
// Jalankan dalam browser console

console.log('🔍 Debug Invoice Issues');

// Function untuk check semua invoice dalam database
async function checkAllInvoices() {
  try {
    console.log('📊 Checking all invoices...');
    
    // Get current state
    const state = useAppStore.getState();
    
    console.log('Current invoices in store:', state.invoices.map(inv => ({
      id: inv.id,
      clientId: inv.clientId,
      packageName: inv.packageName,
      amount: inv.amount,
      createdAt: inv.createdAt
    })));
    
    console.log('Current clients in store:', state.clients.map(c => ({
      id: c.id,
      name: c.name,
      totalSales: c.totalSales,
      totalCollection: c.totalCollection,
      balance: c.balance,
      invoiceCount: c.invoiceCount
    })));
    
    // Calculate expected totals
    for (const client of state.clients) {
      const clientInvoices = state.invoices.filter(inv => inv.clientId === client.id);
      const expectedTotalSales = clientInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      
      console.log(`Client ${client.id} (${client.name}):`, {
        currentTotalSales: client.totalSales,
        expectedTotalSales: expectedTotalSales,
        difference: client.totalSales - expectedTotalSales,
        invoices: clientInvoices.map(inv => ({ id: inv.id, amount: inv.amount }))
      });
    }
    
  } catch (error) {
    console.error('Error checking invoices:', error);
  }
}

// Function untuk force recalculate semua totals
async function forceRecalculateTotals() {
  try {
    console.log('🔄 Force recalculating all totals...');
    await useAppStore.getState().recalculateAllClientTotals();
    console.log('✅ Totals recalculated successfully');
  } catch (error) {
    console.error('Error recalculating totals:', error);
  }
}

// Function untuk refresh semua data
async function refreshAllData() {
  try {
    console.log('🔄 Refreshing all data...');
    await useAppStore.getState().refreshDashboardData();
    console.log('✅ Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}

// Export functions untuk digunakan dalam console
window.debugInvoices = {
  checkAllInvoices,
  forceRecalculateTotals,
  refreshAllData
};

console.log('✅ Debug functions loaded. Use:');
console.log('- debugInvoices.checkAllInvoices() - Check semua invoice');
console.log('- debugInvoices.forceRecalculateTotals() - Force recalculate totals');
console.log('- debugInvoices.refreshAllData() - Refresh semua data'); 