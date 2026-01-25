import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, BarChart3, FileText, LogOut } from 'lucide-react';
import { auth, signInWithGoogle, signInWithApple, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const InvoiceGenerator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [currentView, setCurrentView] = useState('create');
  const [invoices, setInvoices] = useState([]);
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  
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
    items: [
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail('');
      }
    });
  
    return () => unsubscribe();
  }, []);


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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Curio Graphics Yard</h1>
            <p className="text-gray-600">Invoice Management System</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3 font-medium transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Sign in to access your invoices and manage your business
          </p>
        </div>
      </div>
    );
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
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

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { desc: '', unitRate: 0, count: 1, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    
    if (field === 'unitRate' || field === 'count') {
      newItems[index].amount = (newItems[index].unitRate || 0) * (newItems[index].count || 0);
    }
    
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const saveInvoice = async () => {
    const invoiceToSave = {
      ...invoiceData,
      subtotal: calculateSubtotal(),
      netSales: calculateNetSales(),
      total: calculateTotal(),
      balance: calculateBalance(),
      savedDate: new Date().toISOString()
    };

    const updatedInvoices = [...invoices, invoiceToSave];
    setInvoices(updatedInvoices);

    try {
      await window.storage.set('all-invoices', JSON.stringify(updatedInvoices));
      
      const newCounter = invoiceCounter + 1;
      await window.storage.set('invoice-counter', String(newCounter));
      setInvoiceCounter(newCounter);

      setInvoiceData({
        invoiceNumber: `INV-2025-${String(newCounter).padStart(3, '0')}`,
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
        items: [{ desc: '', unitRate: 0, count: 1, amount: 0 }],
        discount: 0,
        tax: 0,
        status: 'UNPAID',
        paymentMethod: '',
        paid: 0,
        paymentAccountNumber: invoiceData.paymentAccountNumber,
        paymentInstitution: invoiceData.paymentInstitution,
        paymentBeneficiary: invoiceData.paymentBeneficiary,
        paymentLink: invoiceData.paymentLink
      });

      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const getStats = () => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const paidInvoices = invoices.filter(inv => inv.balance === 0).length;
    const unpaidInvoices = invoices.filter(inv => inv.balance > 0).length;

    const clientStats = {};
    invoices.forEach(inv => {
      if (inv.clientName) {
        if (!clientStats[inv.clientName]) {
          clientStats[inv.clientName] = { count: 0, total: 0 };
        }
        clientStats[inv.clientName].count += 1;
        clientStats[inv.clientName].total += inv.total;
      }
    });

    const topClients = Object.entries(clientStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    return {
      totalRevenue,
      totalPaid,
      totalOutstanding,
      paidInvoices,
      unpaidInvoices,
      totalInvoices: invoices.length,
      topClients
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
            <FileText size={20} /> Create Invoice
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
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Recent Invoices</h3>
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
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice().reverse().slice(0, 10).map((inv, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-3 md:p-4 text-sm md:text-base">{inv.invoiceNumber}</td>
                        <td className="p-3 md:p-4 text-sm md:text-base">{formatDate(inv.invoiceDate)}</td>
                        <td className="p-3 md:p-4 text-sm md:text-base">{inv.clientName || 'N/A'}</td>
                        <td className="text-right p-3 md:p-4 text-sm md:text-base">GHS {inv.total.toFixed(2)}</td>
                        <td className="text-right p-3 md:p-4 text-sm md:text-base">GHS {inv.balance.toFixed(2)}</td>
                        <td className="text-center p-3 md:p-4">
                          <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                            inv.balance === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {inv.balance === 0 ? 'PAID' : 'UNPAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'create' && (
          <>
            <div className="no-print mb-4 md:mb-6 bg-white p-4 md:p-6 rounded shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <h1 className="text-lg md:text-2xl font-bold">Create Invoice</h1>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
                <div className="text-base md:text-lg font-semibold text-blue-600">
                  Next: {invoiceData.invoiceNumber}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
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
                  <label className="block text-sm font-medium mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={invoiceData.purchaseDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, purchaseDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Client Information</h3>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="City, Postal Code"
                    value={invoiceData.clientCity}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientCity: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="P.O. Number"
                    value={invoiceData.clientPO}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientPO: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="VAT ID"
                    value={invoiceData.clientVAT}
                    onChange={(e) => setInvoiceData({ ...invoiceData, clientVAT: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Order Details</h3>
                  <input
                    type="text"
                    placeholder="Order No."
                    value={invoiceData.orderNo}
                    onChange={(e) => setInvoiceData({ ...invoiceData, orderNo: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="Checkout No."
                    value={invoiceData.checkoutNo}
                    onChange={(e) => setInvoiceData({ ...invoiceData, checkoutNo: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <input
                    type="text"
                    placeholder="Payment Method"
                    value={invoiceData.paymentMethod}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value })}
                    className="w-full border px-3 py-2 rounded mb-2 text-base"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={invoiceData.status}
                      onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value })}
                      className="w-full border px-3 py-2 rounded text-base"
                    >
                      <option value="PAID">PAID</option>
                      <option value="UNPAID">UNPAID</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="font-semibold mb-2 text-sm md:text-base">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={invoiceData.paymentAccountNumber}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentAccountNumber: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                  <input
                    type="text"
                    placeholder="Institution (e.g., Telecel)"
                    value={invoiceData.paymentInstitution}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentInstitution: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                  <input
                    type="text"
                    placeholder="Beneficiary Name"
                    value={invoiceData.paymentBeneficiary}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentBeneficiary: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                  <input
                    type="text"
                    placeholder="Payment Link (optional)"
                    value={invoiceData.paymentLink}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentLink: e.target.value })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm md:text-base">Items</h3>
                  <button onClick={addItem} className="flex items-center gap-2 bg-blue-500 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-600 text-sm md:text-base">
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Service Description"
                        value={item.desc}
                        onChange={(e) => updateItem(index, 'desc', e.target.value)}
                        className="w-full border px-2 py-2 rounded text-base"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.unitRate}
                          onChange={(e) => updateItem(index, 'unitRate', parseFloat(e.target.value) || 0)}
                          className="w-full border px-2 py-2 rounded text-base"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.count}
                          onChange={(e) => updateItem(index, 'count', parseInt(e.target.value) || 0)}
                          className="w-full border px-2 py-2 rounded text-base"
                        />
                        <input
                          type="number"
                          value={item.amount.toFixed(2)}
                          disabled
                          className="w-full border px-2 py-2 rounded bg-gray-100 text-base"
                        />
                      </div>
                      <button 
                        onClick={() => removeItem(index)} 
                        className="w-full text-red-500 hover:text-red-700 py-2 border border-red-300 rounded text-sm"
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <input
                    type="number"
                    value={invoiceData.discount}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax</label>
                  <input
                    type="number"
                    value={invoiceData.tax}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paid Amount</label>
                  <input
                    type="number"
                    value={invoiceData.paid}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paid: parseFloat(e.target.value) || 0 })}
                    className="w-full border px-3 py-2 rounded text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={saveInvoice}
                  className="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600 text-base"
                >
                  Save Invoice
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex-1 bg-green-500 text-white py-3 rounded hover:bg-green-600 flex items-center justify-center gap-2 text-base"
                >
                  <Download size={20} /> Export to PDF
                </button>
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
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{item.desc}</td>
                        <td className="text-right py-2">{item.unitRate.toFixed(2)}</td>
                        <td className="text-right py-2">{item.count}</td>
                        <td className="text-right py-2">{item.amount.toFixed(2)}</td>
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
      </div>
    </div>
  );
};

export default InvoiceGenerator;