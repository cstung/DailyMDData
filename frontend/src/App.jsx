import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = '/api';

const initialForm = {
  rptDate: '',
  mdName: '',
  orderCount: 0,
  discountAmt: 0,
  netRevAmt: 0,
  vatNetRevamt: 0,
  totalRevAmt: 0,
  counter_staff_name: '',
  lw_staff_name: '',
  netLeasing: 0,
  vatLeasing: 0,
  totalLeasing: 0
};

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Auto-calculate Totals
  useEffect(() => {
    const totalRev = parseFloat(formData.totalRevAmt) || 0;
    const vatRev = parseFloat(formData.vatNetRevamt) || 0;
    const netLease = parseFloat(formData.netLeasing) || 0;
    const vatLease = parseFloat(formData.vatLeasing) || 0;

    setFormData(prev => ({
      ...prev,
      netRevAmt: (totalRev - vatRev).toFixed(2),
      totalLeasing: (netLease + vatLease).toFixed(2)
    }));
  }, [formData.totalRevAmt, formData.vatNetRevamt, formData.netLeasing, formData.vatLeasing]);

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = val.toString();
    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const parseNumber = (val) => {
    if (typeof val !== 'string') return val;
    return val.replace(/,/g, '');
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    const isNumeric = ['orderCount', 'discountAmt', 'netRevAmt', 'vatNetRevamt', 'totalRevAmt', 'netLeasing', 'vatLeasing', 'totalLeasing'].includes(name);

    if (isNumeric) {
      value = value.replace(/[^0-9.,]/g, '');
      const parsed = parseNumber(value);
      if ((parsed.match(/\./g) || []).length > 1) return;
      setFormData(prev => ({ ...prev, [name]: parsed }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    
    // Auto format decimals on blur
    const numericFields = ['discountAmt', 'totalRevAmt', 'vatNetRevamt', 'netLeasing', 'vatLeasing'];
    if (numericFields.includes(name)) {
      const parsed = parseNumber(value);
      if (!isNaN(parsed) && parsed !== '') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(parsed).toFixed(2) }));
      }
    }

    // Check if record exists when PK fields are filled
    if ((name === 'rptDate' || name === 'mdName') && formData.rptDate && formData.mdName) {
      checkExistingRecord(formData.rptDate, formData.mdName);
    }
  };

  const checkExistingRecord = async (date, name) => {
    try {
      const res = await fetch(`${API_BASE}/revenue?rptDate=${date}&mdName=${name}`);
      if (res.ok) {
        const data = await res.json();
        // Convert dates for input type="date"
        if (data.rptDate) data.rptDate = data.rptDate.split('T')[0];
        setFormData(data);
        setIsEditMode(true);
        setStatus({ type: 'info', message: 'Record found. Switched to Update Mode.' });
      } else {
        setIsEditMode(false);
        setStatus({ type: '', message: '' });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const method = isEditMode ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(`${API_BASE}/revenue`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: result.message });
        if (!isEditMode) resetForm();
      } else {
        setStatus({ type: 'error', message: result.error || 'Something went wrong' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check backend.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditMode(false);
    setStatus({ type: '', message: '' });
  };

  const isInvalid = !formData.rptDate || !formData.mdName;

  return (
    <div className="container">
      <div className="form-card">
        <header className="form-header">
          <h1>Daily Revenue Report</h1>
          <p>{isEditMode ? 'Editing existing record' : 'Create a new daily report'}</p>
        </header>

        {status.message && (
          <div className={`status-msg ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: General Info */}
          <section className="form-section">
            <h2 className="form-section-title">General Info</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Report Date *</label>
                <input 
                  type="date" 
                  name="rptDate" 
                  value={formData.rptDate} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  required 
                />
              </div>
              <div className="form-group">
                <label>MD Name *</label>
                <input 
                  type="text" 
                  name="mdName" 
                  placeholder="Enter store name"
                  value={formData.mdName} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Order Count</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="orderCount" 
                  value={formatNumber(formData.orderCount)} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Revenue */}
          <section className="form-section">
            <h2 className="form-section-title">Revenue</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Discount Amount</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="discountAmt" 
                  value={formatNumber(formData.discountAmt)} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
              </div>
              <div className="form-group highlight">
                <label>Net Revenue (Auto)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="netRevAmt" 
                  value={formatNumber(formData.netRevAmt)} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>VAT Revenue</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="vatNetRevamt" 
                  value={formatNumber(formData.vatNetRevamt)} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
              </div>
              <div className="form-group">
                <label>Total Revenue</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="totalRevAmt" 
                  value={formatNumber(formData.totalRevAmt)} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Leasing */}
          <section className="form-section">
            <h2 className="form-section-title">Leasing</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Net Leasing</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="netLeasing" 
                  value={formatNumber(formData.netLeasing)} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
              </div>
              <div className="form-group">
                <label>VAT Leasing</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="vatLeasing" 
                  value={formatNumber(formData.vatLeasing)} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
              </div>
              <div className="form-group highlight">
                <label>Total Leasing (Auto)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="totalLeasing" 
                  value={formatNumber(formData.totalLeasing)} 
                  disabled 
                />
              </div>
            </div>
          </section>

          {/* Section 4: Staff */}
          <section className="form-section">
            <h2 className="form-section-title">Staff</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Counter Staff Name</label>
                <input 
                  type="text" 
                  name="counter_staff_name" 
                  value={formData.counter_staff_name} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>LW Staff Name</label>
                <input 
                  type="text" 
                  name="lw_staff_name" 
                  value={formData.lw_staff_name} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </section>

          <div className="actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={resetForm}
            >
              Reset Form
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || isInvalid}
            >
              {loading ? 'Processing...' : (isEditMode ? 'Update Record' : 'Submit Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
