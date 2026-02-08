import logo from './assets/cgy_logo_new.png';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, BarChart3, FileText, LogOut, Edit2, X, Receipt, DollarSign } from 'lucide-react';
import { auth, signInWithGoogle, signInWithApple, logout, getUserInvoices, saveInvoice as saveInvoiceToFirestore, deleteInvoice as deleteInvoiceFromFirestore, getUserCounter, updateUserCounter } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const InvoiceGenerator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [currentView, setCurrentView] = useState('create');
  const [invoices, setInvoices] = useState([]);
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-2025-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    companyName: 'Curio Graphics Yard',
    companyAddress: 'Koforidua, E7-0979-957',
    companyCity: 'Ghana',
    companyEmail: 'curiographicsyard@gmail.com',
    clientName: '',
    clientAddress: '',
    clientCity: '',
    clientPO: '',
    clientVAT: '',
    orderNo: '',
    checkoutNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    services: [
      { desc: '', unitRate: 0, count: 1, amount: 0 }
    ],
    discount: 0,
    tax: 0,
    status: 'UNPAID',
    paymentMethod: '',
    paid: 0,
    paymentAccountNumber: '0200044821',
    paymentInstitution: 'Telecel',
    paymentBeneficiary: 'David Amo',
    paymentLink: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        setUserId(user.uid);
        await loadUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
        setUserId('');
        setInvoices([]);
        setIsLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid) => {
    setIsLoading(true);
    try {
      // Load invoices for this specific user from Firestore
      const loadedInvoices = await getUserInvoices(uid);
      // Ensure paymentHistory exists for all invoices
      const normalizedInvoices = loadedInvoices.map(inv => ({
        ...inv,
        paymentHistory: inv.paymentHistory || []
      }));
      setInvoices(normalizedInvoices);

      // Load counter for this specific user from Firestore
      const loadedCounter = await getUserCounter(uid);
      setInvoiceCounter(loadedCounter);

      // Update invoice number in form
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: `INV-2025-${String(loadedCounter).padStart(3, '0')}`
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      // If error occurs, start fresh
      setInvoices([]);
      setInvoiceCounter(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to sign in with Google');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setInvoices([]);
      setInvoiceCounter(1);
      setEditingInvoiceId(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Curio Graphics Yard Logo"
              className="mx-auto mb-6 w-24 h-auto"
            />
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Invoice Management
            </h1>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3 font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invoices...</p>
        </div>
      </div>
    );
  }

  const calculateSubtotal = () => {
    return invoiceData.services.reduce((sum, service) => sum + (service.amount || 0), 0);
  };

  const calculateNetSales = () => {
    return calculateSubtotal() - invoiceData.discount;
  };

  const calculateTotal = () => {
    return calculateNetSales() + invoiceData.tax;
  };

  const calculateBalance = () => {
    return calculateTotal() - invoiceData.paid;
  };

  const addService = () => {
    setInvoiceData({
      ...invoiceData,
      services: [...invoiceData.services, { desc: '', unitRate: 0, count: 1, amount: 0 }]
    });
  };

  const removeService = (index) => {
    const newServices = invoiceData.services.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, services: newServices });
  };

  const updateService = (index, field, value) => {
    const newServices = [...invoiceData.services];
    newServices[index][field] = value;
    
    if (field === 'unitRate' || field === 'count') {
      newServices[index].amount = (newServices[index].unitRate || 0) * (newServices[index].count || 0);
    }
    
    setInvoiceData({ ...invoiceData, services: newServices });
  };

  const validateInvoice = () => {
    // 1. Client name
    if (!invoiceData.clientName.trim()) {
      alert('Client name is required.');
      return false;
    }
  
    // 2. At least one valid service
    const hasValidService = invoiceData.services.some(service =>
      service.desc.trim() !== '' && service.amount > 0
    );
  
    if (!hasValidService) {
      alert('At least one service must have a description and amount.');
      return false;
    }
  
    // 3. Payment information
    const hasPaymentInfo =
      invoiceData.paymentMethod.trim() !== '' ||
      invoiceData.paymentAccountNumber.trim() !== '' ||
      invoiceData.paymentLink.trim() !== '';
  
    if (!hasPaymentInfo) {
      alert('Payment information is required.');
      return false;
    }
  
    // 4. Total must be greater than zero
    if (calculateTotal() <= 0) {
      alert('Invoice total must be greater than zero.');
      return false;
    }
  
    return true;
  };
  
  const saveInvoice = async () => {
    if (!validateInvoice()) return;

    const cleanedServices = invoiceData.services.filter(
      service => service.desc.trim() !== '' && service.amount > 0
    );

    const finalStatus = invoiceData.status || 'UNPAID';

    const subtotal = calculateSubtotal();
    const netSales = calculateNetSales();
    const total = calculateTotal();

    let paidAmount = invoiceData.paid;
    let balanceAmount = total - paidAmount;

    if (finalStatus === 'PAID') {
      paidAmount = total;
      balanceAmount = 0;
    }
    
    const invoiceToSave = {
      id: editingInvoiceId || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...invoiceData,
      services: cleanedServices,
      status: finalStatus,
      subtotal: calculateSubtotal(),
      netSales: calculateNetSales(),
      total: calculateTotal(),
      balance: calculateBalance(),
      savedDate: new Date().toISOString(),
      userId: userId,
      paymentHistory: invoiceData.paymentHistory || []
    };

    try {
      // Save invoice to Firestore
      await saveInvoiceToFirestore(invoiceToSave);
      
      let updatedInvoices;
      
      if (editingInvoiceId) {
        // Update existing invoice
        updatedInvoices = invoices.map(inv => 
          inv.id === editingInvoiceId ? invoiceToSave : inv
        );
        setEditingInvoiceId(null);
        alert('Invoice updated successfully!');
      } else {
        // Create new invoice
        updatedInvoices = [...invoices, invoiceToSave];
        
        const newCounter = invoiceCounter + 1;
        await updateUserCounter(userId, newCounter);
        setInvoiceCounter(newCounter);
        
        alert('Invoice saved successfully!');
      }

      setInvoices(updatedInvoices);

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Error saving invoice: ${error.message || 'Please try again.'}`);
    }
  };

  const resetForm = () => {
    setInvoiceData({
      invoiceNumber: `INV-2025-${String(invoiceCounter + (editingInvoiceId ? 0 : 1)).padStart(3, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      companyName: 'Curio Graphics Yard',
      companyAddress: 'Koforidua, E7-0979-957',
      companyCity: 'Ghana',
      companyEmail: 'curiographicsyard@gmail.com',
      clientName: '',
      clientAddress: '',
      clientCity: '',
      clientPO: '',
      clientVAT: '',
      orderNo: '',
      checkoutNo: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      services: [{ desc: '', unitRate: 0, count: 1, amount: 0 }],
      discount: 0,
      tax: 0,
      status: 'UNPAID',
      paymentMethod: '',
      paid: 0,
      paymentAccountNumber: invoiceData.paymentAccountNumber,
      paymentInstitution: invoiceData.paymentInstitution,
      paymentBeneficiary: invoiceData.paymentBeneficiary,
      paymentLink: invoiceData.paymentLink,
      paymentHistory: []
    });
    setEditingInvoiceId(null);
  };

  const editInvoice = (invoice) => {
    setInvoiceData({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      companyName: invoice.companyName,
      companyAddress: invoice.companyAddress,
      companyCity: invoice.companyCity,
      companyEmail: invoice.companyEmail,
      clientName: invoice.clientName,
      clientAddress: invoice.clientAddress,
      clientCity: invoice.clientCity,
      clientPO: invoice.clientPO,
      clientVAT: invoice.clientVAT,
      orderNo: invoice.orderNo,
      checkoutNo: invoice.checkoutNo,
      purchaseDate: invoice.purchaseDate,
      services: invoice.services,
      discount: invoice.discount,
      tax: invoice.tax,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      paid: invoice.paid,
      paymentAccountNumber: invoice.paymentAccountNumber,
      paymentInstitution: invoice.paymentInstitution,
      paymentBeneficiary: invoice.paymentBeneficiary,
      paymentLink: invoice.paymentLink,
      paymentHistory: invoice.paymentHistory || []
    });
    setEditingInvoiceId(invoice.id);
    setCurrentView('create');
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteInvoiceFromFirestore(invoiceId);
      
      const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
      setInvoices(updatedInvoices);
      alert('Invoice deleted successfully!');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  const cancelEdit = () => {
    resetForm();
    setEditingInvoiceId(null);
  };

  const exportToPDF = () => {
    window.print();
  };

  const generateReceipt = (invoice, paymentEntry = null) => {
    // Determine if this is a partial payment receipt
    const isPartialPayment = paymentEntry !== null;
    const receiptAmount = isPartialPayment ? paymentEntry.amount : invoice.total;
    const receiptDate = isPartialPayment ? paymentEntry.paymentDate : invoice.invoiceDate;
    const receiptNumber = isPartialPayment 
      ? `${invoice.invoiceNumber}-RCP-${paymentEntry.id || Date.now()}`
      : invoice.invoiceNumber;
    const totalPaidSoFar = invoice.paymentHistory 
      ? invoice.paymentHistory.reduce((sum, p) => sum + p.amount, 0) + (isPartialPayment ? paymentEntry.amount : 0)
      : (isPartialPayment ? paymentEntry.amount : invoice.paid);
    const remainingBalance = invoice.total - totalPaidSoFar;
    
    // Create a temporary div for the receipt
    const receiptWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptNumber}</title>
        <link href="https://fonts.cdnfonts.com/css/ocr-a-extended" rel="stylesheet">
        <style>
          @import url('https://fonts.cdnfonts.com/css/ocr-a-extended');
          
          body {
            font-family: 'OCR A Extended', monospace;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .receipt-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .company-info {
            margin-bottom: 30px;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .items-table th,
          .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          
          .items-table th {
            background-color: #f0f0f0;
          }
          
          .items-table td.number {
            text-align: right;
          }
          
          .totals {
            margin-top: 30px;
            border-top: 2px solid #000;
            padding-top: 20px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          
          .total-row.grand-total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px double #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .payment-status {
            text-align: center;
            margin: 30px 0;
            padding: 15px;
            background-color: ${isPartialPayment ? '#fff3cd' : '#d4edda'};
            border: 2px solid ${isPartialPayment ? '#ffc107' : '#28a745'};
            font-weight: bold;
            font-size: 18px;
          }
          
          .payment-info {
            margin-top: 30px;
            border: 1px solid #000;
            padding: 15px;
          }
          
          .balance-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #000;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
          }
          
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="receipt-title">RECEIPT</div>
          <div>Receipt #: ${receiptNumber}</div>
          <div>Date: ${formatDate(receiptDate)}</div>
          ${isPartialPayment ? `<div style="margin-top: 10px; font-size: 12px; color: #666;">For Invoice: ${invoice.invoiceNumber}</div>` : ''}
        </div>

        <div class="company-info">
          <div><strong>${invoice.companyName}</strong></div>
          <div>${invoice.companyAddress}</div>
          <div>${invoice.companyCity}</div>
          <div>${invoice.companyEmail}</div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div>${invoice.clientName || 'N/A'}</div>
          <div>${invoice.clientAddress || ''}</div>
          <div>${invoice.clientCity || ''}</div>
          ${invoice.clientPO ? `<div>P.O. No: ${invoice.clientPO}</div>` : ''}
          ${invoice.clientVAT ? `<div>VAT ID: ${invoice.clientVAT}</div>` : ''}
        </div>

        ${isPartialPayment ? `
          <div class="section">
            <div class="section-title">Invoice Summary</div>
            <div>Invoice #: ${invoice.invoiceNumber}</div>
            <div>Invoice Date: ${formatDate(invoice.invoiceDate)}</div>
            <div>Invoice Total: GHS ${invoice.total.toFixed(2)}</div>
          </div>
        ` : `
          <div class="section">
            <div class="section-title">Order Details</div>
            ${invoice.orderNo ? `<div>Order No: ${invoice.orderNo}</div>` : ''}
            ${invoice.checkoutNo ? `<div>Checkout No: ${invoice.checkoutNo}</div>` : ''}
            <div>Purchase Date: ${formatDate(invoice.purchaseDate)}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Unit Rate (GHS)</th>
                <th>Quantity</th>
                <th>Amount (GHS)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.services.map((service, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${service.desc}</td>
                  <td class="number">${service.unitRate.toFixed(2)}</td>
                  <td class="number">${service.count}</td>
                  <td class="number">${service.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>GHS ${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>- GHS ${invoice.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Net Sales:</span>
              <span>GHS ${invoice.netSales.toFixed(2)}</span>
            </div>
            ${invoice.tax > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>GHS ${invoice.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span>Invoice Total:</span>
              <span>GHS ${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        `}

        <div class="payment-status">
          ${isPartialPayment 
            ? `✓ PARTIAL PAYMENT RECEIVED - GHS ${receiptAmount.toFixed(2)}` 
            : '✓ PAYMENT RECEIVED - PAID IN FULL'}
        </div>

        <div class="payment-info">
          <div><strong>Payment Information:</strong></div>
          <div>Payment Method: ${isPartialPayment ? paymentEntry.paymentMethod : (invoice.paymentMethod || 'N/A')}</div>
          <div>Amount Paid: GHS ${receiptAmount.toFixed(2)}</div>
          <div>Payment Date: ${formatDate(receiptDate)}</div>
          ${isPartialPayment && paymentEntry.notes ? `<div>Notes: ${paymentEntry.notes}</div>` : ''}
        </div>

        ${isPartialPayment ? `
          <div class="balance-info">
            <div><strong>Payment Summary:</strong></div>
            <div>Total Paid to Date: GHS ${totalPaidSoFar.toFixed(2)}</div>
            <div>Remaining Balance: GHS ${remainingBalance.toFixed(2)}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>***</div>
          <div>Thank you for your business!</div>
          <div style="margin-top: 10px; font-size: 12px;">This is a computer-generated receipt and serves as proof of payment.</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentData({
      amount: 0,
      paymentMethod: invoice.paymentMethod || '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoiceForPayment(null);
    setPaymentData({
      amount: 0,
      paymentMethod: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const recordPartPayment = async () => {
    if (!selectedInvoiceForPayment) return;
    
    const paymentAmount = parseFloat(paymentData.amount);
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    if (!paymentData.paymentMethod.trim()) {
      alert('Payment method is required.');
      return;
    }

    const currentBalance = selectedInvoiceForPayment.balance || (selectedInvoiceForPayment.total - selectedInvoiceForPayment.paid);
    if (paymentAmount > currentBalance) {
      alert(`Payment amount cannot exceed the remaining balance of GHS ${currentBalance.toFixed(2)}.`);
      return;
    }

    const paymentEntry = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentAmount,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      notes: paymentData.notes,
      recordedDate: new Date().toISOString()
    };

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === selectedInvoiceForPayment.id) {
        const paymentHistory = inv.paymentHistory || [];
        const newPaidAmount = (inv.paid || 0) + paymentAmount;
        const newBalance = inv.total - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'PAID' : (newPaidAmount > 0 ? 'PENDING' : inv.status);

        return {
          ...inv,
          paid: newPaidAmount,
          balance: newBalance,
          status: newStatus,
          paymentHistory: [...paymentHistory, paymentEntry]
        };
      }
      return inv;
    });

    // Save updated invoice to Firestore
    const updatedInvoice = updatedInvoices.find(inv => inv.id === selectedInvoiceForPayment.id);
    await saveInvoiceToFirestore(updatedInvoice);

    setInvoices(updatedInvoices);

    // Generate receipt for this payment
    generateReceipt(updatedInvoice, paymentEntry);

    closePaymentModal();
    alert('Payment recorded and receipt generated!');
  };

  const getStats = () => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
    const totalPaid = invoices.reduce((sum, inv) => {
      if (inv.status === 'PAID') {
        return sum + Number(inv.total || 0);
      }
      return sum + Number(inv.paid || 0);
    }, 0);
  
    const totalOutstanding = invoices.reduce((sum, inv) => {
      if (inv.status === 'PAID') return sum;
      return sum + Number(inv.balance || 0);
    }, 0);
  
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID').length;
  
    return {
      totalRevenue,
      totalPaid,
      totalOutstanding,
      paidInvoices,
      unpaidInvoices,
      totalInvoices: invoices.length,
      topClients: []
    };
  };
  

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ocr-a-extended');
        
        .invoice-font {
          font-family: 'OCR A Extended', monospace;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          input, select, button {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="no-print mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 md:gap-4">
          <button
            onClick={() => setCurrentView('create')}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded ${
              currentView === 'create' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <FileText size={20} /> {editingInvoiceId ? 'Edit Invoice' : 'Create Invoice'}
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded ${
              currentView === 'stats' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <BarChart3 size={20} /> Statistics
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded bg-red-500 text-white hover:bg-red-600 sm:ml-auto"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        {currentView === 'stats' && (
          <div className="no-print bg-white p-4 md:p-6 rounded shadow">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Invoice Statistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-blue-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Total Revenue</div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600">GHS {stats.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Total Paid</div>
                <div className="text-2xl md:text-3xl font-bold text-green-600">GHS {stats.totalPaid.toFixed(2)}</div>
              </div>
              <div className="bg-orange-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Outstanding</div>
                <div className="text-2xl md:text-3xl font-bold text-orange-600">GHS {stats.totalOutstanding.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-gray-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Total Invoices</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-700">{stats.totalInvoices}</div>
              </div>
              <div className="bg-gray-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Paid Invoices</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-700">{stats.paidInvoices}</div>
              </div>
              <div className="bg-gray-50 p-4 md:p-6 rounded">
                <div className="text-xs md:text-sm text-gray-600 mb-2">Unpaid Invoices</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-700">{stats.unpaidInvoices}</div>
              </div>
            </div>

            {stats.topClients.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Top Clients by Revenue</h3>
                <div className="bg-gray-50 rounded overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left p-3 md:p-4 text-sm md:text-base">Client Name</th>
                        <th className="text-right p-3 md:p-4 text-sm md:text-base">Invoices</th>
                        <th className="text-right p-3 md:p-4 text-sm md:text-base">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topClients.map(([name, data], index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="p-3 md:p-4 text-sm md:text-base">{name}</td>
                          <td className="text-right p-3 md:p-4 text-sm md:text-base">{data.count}</td>
                          <td className="text-right p-3 md:p-4 text-sm md:text-base">GHS {data.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">All Invoices</h3>
              <div className="bg-gray-50 rounded overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left p-3 md:p-4 text-sm md:text-base">Invoice #</th>
                      <th className="text-left p-3 md:p-4 text-sm md:text-base">Date</th>
                      <th className="text-left p-3 md:p-4 text-sm md:text-base">Client</th>
                      <th className="text-right p-3 md:p-4 text-sm md:text-base">Total</th>
                      <th className="text-right p-3 md:p-4 text-sm md:text-base">Balance</th>
                      <th className="text-center p-3 md:p-4 text-sm md:text-base">Status</th>
                      <th className="text-center p-3 md:p-4 text-sm md:text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice().reverse().map((inv, index) => (
                      <tr key={inv.id} className="border-t border-gray-200">
                        <td className="p-3 md:p-4 text-sm md:text-base">{inv.invoiceNumber}</td>
                        <td className="p-3 md:p-4 text-sm md:text-base">{formatDate(inv.invoiceDate)}</td>
                        <td className="p-3 md:p-4 text-sm md:text-base">{inv.clientName || 'N/A'}</td>
                        <td className="text-right p-3 md:p-4 text-sm md:text-base">GHS {inv.total.toFixed(2)}</td>
                        <td className="text-right p-3 md:p-4 text-sm md:text-base">GHS {inv.balance.toFixed(2)}</td>
                        <td className="text-center p-3 md:p-4">
                          <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                            inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="text-center p-3 md:p-4">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => editInvoice(inv)}
                              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                              title="Edit Invoice"
                            >
                              <Edit2 size={16} />
                            </button>
                            {inv.status !== 'PAID' && inv.balance > 0 && (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                                title="Record Part Payment"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                            {(inv.status === 'PAID' || inv.paid > 0) && (
                              <button
                                onClick={() => generateReceipt(inv)}
                                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                title={inv.status === 'PAID' ? 'Generate Full Receipt' : 'Generate Payment Summary Receipt'}
                              >
                                <Receipt size={16} />
                              </button>
                            )}
                            {inv.paymentHistory && inv.paymentHistory.length > 0 && (
                              <button
                                onClick={() => {
                                  const lastPayment = inv.paymentHistory[inv.paymentHistory.length - 1];
                                  generateReceipt(inv, lastPayment);
                                }}
                                className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                                title="Generate Last Payment Receipt"
                              >
                                <Receipt size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                              title="Delete Invoice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No invoices found. Create your first invoice to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'create' && (
          <>
            <div className="no-print mb-4 md:mb-6 bg-white p-4 md:p-6 rounded shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <h1 className="text-xl font-bold">
                    {editingInvoiceId ? 'Edit Invoice' : 'New Invoice'}
                  </h1>
                  <p className="text-sm text-gray-500">{invoiceData.invoiceNumber}</p>
                </div>
                {editingInvoiceId && (
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name *</label>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={invoiceData.status}
                    onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Address (optional)</label>
                  <input
                    type="text"
                    placeholder="Address, City"
                    value={`${invoiceData.clientAddress}${invoiceData.clientAddress && invoiceData.clientCity ? ', ' : ''}${invoiceData.clientCity}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',').map(s => s.trim());
                      setInvoiceData({ 
                        ...invoiceData, 
                        clientAddress: parts[0] || '', 
                        clientCity: parts.slice(1).join(', ') || '' 
                      });
                    }}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mobile Money, Bank Transfer"
                    value={invoiceData.paymentMethod}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Account</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={invoiceData.paymentAccountNumber}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentAccountNumber: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Link (optional)</label>
                  <input
                    type="text"
                    placeholder="Payment link URL"
                    value={invoiceData.paymentLink}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentLink: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-base">Services</h3>
                  <button onClick={addService} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                    <Plus size={16} /> Add Service
                  </button>
                </div>
                
                <div className="space-y-2">
                  {invoiceData.services.map((service, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <input
                        type="text"
                        placeholder="Description"
                        value={service.desc}
                        onChange={(e) => updateService(index, 'desc', e.target.value)}
                        className="flex-1 border px-3 py-2 rounded text-base"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={service.unitRate || ''}
                        onChange={(e) => updateService(index, 'unitRate', parseFloat(e.target.value) || 0)}
                        className="w-24 border px-2 py-2 rounded text-base"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={service.count || ''}
                        onChange={(e) => updateService(index, 'count', parseInt(e.target.value) || 0)}
                        className="w-20 border px-2 py-2 rounded text-base"
                      />
                      <div className="w-24 px-3 py-2 text-base text-gray-600 font-medium">
                        GHS {service.amount.toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeService(index)} 
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove service"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Discount</label>
                  <input
                    type="number"
                    value={invoiceData.discount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tax</label>
                  <input
                    type="number"
                    value={invoiceData.tax}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Paid</label>
                  <input
                    type="number"
                    value={invoiceData.paid}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paid: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={saveInvoice}
                  className="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600 text-base"
                >
                  {editingInvoiceId ? 'Update Invoice' : 'Save Invoice'}
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex-1 bg-green-500 text-white py-3 rounded hover:bg-green-600 flex items-center justify-center gap-2 text-base"
                >
                  <Download size={20} /> Export to PDF
                </button>
                {(invoiceData.status === 'PAID' || invoiceData.paid > 0) && (
                  <button
                    onClick={() => {
                      const currentInvoice = {
                        ...invoiceData,
                        subtotal: calculateSubtotal(),
                        netSales: calculateNetSales(),
                        total: calculateTotal(),
                        balance: calculateBalance(),
                        paymentHistory: invoiceData.paymentHistory || []
                      };
                      generateReceipt(currentInvoice);
                    }}
                    className="flex-1 bg-purple-500 text-white py-3 rounded hover:bg-purple-600 flex items-center justify-center gap-2 text-base"
                  >
                    <Receipt size={20} /> Generate Receipt
                  </button>
                )}
              </div>
            </div>

            <div className="print-area bg-white p-12 invoice-font text-sm">
              <div className="flex justify-between mb-8">
                <div>
                  <div className="mb-1">{invoiceData.companyName}</div>
                  <div className="mb-1">{invoiceData.companyAddress}</div>
                  <div className="mb-1">{invoiceData.companyCity}</div>
                  <div>{invoiceData.companyEmail}</div>
                </div>
                <div className="border-2 border-black px-4 py-2">
                  <div>Invoice #:     {invoiceData.invoiceNumber}</div>
                  <div>Invoice Date: {formatDate(invoiceData.invoiceDate)}</div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-2">Billed To:</div>
                <div>{invoiceData.clientName}</div>
                <div>{invoiceData.clientAddress}</div>
                <div>{invoiceData.clientCity}</div>
                {invoiceData.clientPO && <div>P.O. No.  {invoiceData.clientPO}</div>}
                {invoiceData.clientVAT && <div>VAT ID {invoiceData.clientVAT}</div>}
              </div>

              <div className="mb-8">
                {invoiceData.orderNo && <div>Order No.:     {invoiceData.orderNo}</div>}
                {invoiceData.checkoutNo && <div>Checkout No.: {invoiceData.checkoutNo}</div>}
                <div>Purchase Date: {formatDate(invoiceData.purchaseDate)}</div>
              </div>

              <div className="mb-8">
                <div className="text-center mb-4">Order {invoiceData.orderNo}</div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left py-2">#</th>
                      <th className="text-left py-2">Services</th>
                      <th className="text-right py-2">Unit Rate</th>
                      <th className="text-right py-2">Count</th>
                      <th className="text-right py-2">Subtotal (GHS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.map((service, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{service.desc}</td>
                        <td className="text-right py-2">{service.unitRate.toFixed(2)}</td>
                        <td className="text-right py-2">{service.count}</td>
                        <td className="text-right py-2">{service.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between border-b py-1">
                    <span>Subtotal</span>
                    <span>{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span>Discount</span>
                    <span>-{invoiceData.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span>Net Sales Total</span>
                    <span>{calculateNetSales().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-double border-black py-1">
                    <span>Tax</span>
                    <span>{invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-double border-black py-2 font-bold">
                    <span>Total</span>
                    <span>{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8 border-b-2 border-double border-black pb-4">
                Invoice Status: {invoiceData.status}
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between border-b py-1">
                    <span>Paid</span>
                    <span>-{invoiceData.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Balance</span>
                    <span>{calculateBalance().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoiceData.paymentMethod && (
                <div className="mb-8">
                  Payment Method: {invoiceData.paymentMethod}
                </div>
              )}

              {(invoiceData.paymentAccountNumber || invoiceData.paymentLink) && (
                <div className="mb-8">
                  <div className="font-bold mb-2">Payment Information:</div>
                  {invoiceData.paymentAccountNumber && (
                    <>
                      <div>Account #: {invoiceData.paymentAccountNumber}</div>
                      {invoiceData.paymentInstitution && <div>Institution: {invoiceData.paymentInstitution}</div>}
                      {invoiceData.paymentBeneficiary && <div>Beneficiary: {invoiceData.paymentBeneficiary}</div>}
                    </>
                  )}
                  {invoiceData.paymentLink && (
                    <div className="mt-2">
                      <div>or use the link below to pay:</div>
                      <div className="text-blue-600 underline">{invoiceData.paymentLink}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <div className="mb-2">***</div>
                <div>Thank you for your business.</div>
              </div>
            </div>
          </>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoiceForPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Record Part Payment</h2>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Invoice: {selectedInvoiceForPayment.invoiceNumber}</div>
                <div className="text-sm text-gray-600 mb-1">Client: {selectedInvoiceForPayment.clientName}</div>
                <div className="text-sm font-semibold">Total: GHS {selectedInvoiceForPayment.total.toFixed(2)}</div>
                <div className="text-sm font-semibold">Paid: GHS {(selectedInvoiceForPayment.paid || 0).toFixed(2)}</div>
                <div className="text-sm font-semibold text-orange-600">
                  Balance: GHS {(selectedInvoiceForPayment.balance || (selectedInvoiceForPayment.total - (selectedInvoiceForPayment.paid || 0))).toFixed(2)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Amount (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedInvoiceForPayment.balance || (selectedInvoiceForPayment.total - (selectedInvoiceForPayment.paid || 0))}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                    placeholder="Enter payment amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                    placeholder="e.g., Mobile Money, Bank Transfer, Cash"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                    rows="3"
                    placeholder="Additional notes about this payment"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePaymentModal}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={recordPartPayment}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Receipt size={18} /> Record Payment & Generate Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerator;