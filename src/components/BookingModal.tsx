import { CheckCircle2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order, Plot } from '../types';
import { formatPKR, getApiErrorMessage } from '../utils/format';

interface BookingFormProps {
  initialPlot?: Plot | null;
  availablePlots?: Plot[];
  onClose?: () => void;
  compact?: boolean;
}

export function BookingForm({
  initialPlot,
  availablePlots = [],
  onClose,
  compact = false,
}: BookingFormProps) {
  const [selectedPlotId, setSelectedPlotId] = useState(initialPlot?._id || '');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (initialPlot?._id) {
      setSelectedPlotId(initialPlot._id);
    }
  }, [initialPlot]);

  const selectablePlots = availablePlots.filter((p) => p.status !== 'Sold');
  const activePlot =
    initialPlot && initialPlot._id === selectedPlotId
      ? initialPlot
      : selectablePlots.find((p) => p._id === selectedPlotId) || initialPlot || null;

  const isSold = activePlot?.status === 'Sold';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activePlot?._id) {
      setError('Please select a plot for your booking request.');
      return;
    }
    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        plotId: activePlot._id,
        message: message.trim(),
      });
      setConfirmedOrder(data.order);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to submit booking request.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
          Booking Request Received
        </h3>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Thank you, <span className="font-semibold text-slate-900">{confirmedOrder.customerName}</span>. Your booking inquiry has been recorded and forwarded to the Juddi Housing Scheme Pasni sales office.
        </p>

        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Order Reference ID</span>
            <span className="font-mono font-bold text-[#0B1F3A] tabular-nums">
              {confirmedOrder.orderId}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Selected Plot</span>
            <span className="font-semibold text-slate-900 text-right">
              {confirmedOrder.plot?.title} ({confirmedOrder.plot?.plotNumber})
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-amber-700">
              Pending Sales Desk Review
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Our representative Tariq Hameed (0321 5552244) will contact you shortly to verify plot availability and arrange documentation.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              setMessage('');
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Submit Another Inquiry
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#112D54]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3.5' : 'space-y-4'}>
      {error && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {error}
        </div>
      )}

      {isSold && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          This plot has already been sold and cannot accept new booking requests.
        </div>
      )}

      {/* Selected Plot / Plot Number */}
      {selectablePlots.length > 0 && !initialPlot ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Selected Plot <span className="text-red-600">*</span>
          </label>
          <select
            value={selectedPlotId}
            onChange={(e) => setSelectedPlotId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Choose an available plot...</option>
            {selectablePlots.map((p) => (
              <option key={p._id} value={p._id}>
                {p.plotNumber} — {p.title} ({p.lengthFt}×{p.widthFt} ft · {formatPKR(p.price)})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="sm:col-span-2">
            <div className="text-xs text-slate-500">Selected Plot</div>
            <div className="text-sm font-semibold text-[#0B1F3A]">
              {activePlot ? activePlot.title : 'No plot selected'}
            </div>
            {activePlot && (
              <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {activePlot.lengthFt} &times; {activePlot.widthFt} ft &middot; {formatPKR(activePlot.price)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500">Plot Number</div>
            <div className="font-mono text-sm font-bold text-[#0B1F3A] tabular-nums">
              {activePlot ? activePlot.plotNumber : '—'}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Customer Full Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g., Muhammad Aslam Baloch"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Message / Inquiry Notes
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Preferred time for a site visit, installment questions, or documentation details..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || isSold || !activePlot}
        className="w-full py-3 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 text-[#07162B] font-display font-bold text-sm transition-colors cursor-pointer"
      >
        {submitting ? 'Submitting Booking Request...' : 'Submit Booking Request'}
      </button>

      <p className="text-xs text-slate-500 text-center">
        This submits a formal booking inquiry. No online payment is charged on this form.
      </p>
    </form>
  );
}

interface BookingModalProps {
  plot: Plot | null;
  availablePlots?: Plot[];
  onClose: () => void;
}

export default function BookingModal({
  plot,
  availablePlots = [],
  onClose,
}: BookingModalProps) {
  if (!plot) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07162B]/70 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="booking-modal-title"
              className="font-display text-lg font-bold text-[#0B1F3A]"
            >
              Plot Booking Request
            </h2>
            <p className="text-xs text-slate-500">
              Juddi Housing Scheme Pasni · Sales &amp; Allotment Desk
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <BookingForm
            initialPlot={plot}
            availablePlots={availablePlots}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
