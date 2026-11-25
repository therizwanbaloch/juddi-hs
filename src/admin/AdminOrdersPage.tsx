import { CheckCircle2, Mail, Phone, Search, X, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { formatDate, formatPKR, getApiErrorMessage } from '../utils/format';

const STATUS_TABS: ('All' | OrderStatus)[] = [
  'All',
  'New',
  'Contacted',
  'Pending',
  'Confirmed',
  'Rejected',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Order detail modal state
  const [notes, setNotes] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Optional payment logging on confirmed orders
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRef, setPayRef] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined,
        },
      });
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setNotes(order.internalNotes || '');
    setSalePrice(
      String(order.confirmedSalePrice ?? order.plot?.price ?? '')
    );
    setModalError('');
    setShowPaymentForm(false);
    setPayAmount('');
    setPayRef('');
  };

  const handleUpdateOrder = async (nextStatus?: OrderStatus) => {
    if (!selectedOrder) return;
    setModalError('');
    setUpdating(true);

    try {
      const payload: Record<string, unknown> = {
        internalNotes: notes,
      };
      if (nextStatus) {
        payload.status = nextStatus;
      }
      if (nextStatus === 'Confirmed' && salePrice) {
        payload.confirmedSalePrice = Number(salePrice);
      }

      const { data } = await api.patch(`/admin/orders/${selectedOrder._id}`, payload);
      setSelectedOrder(data.order);
      setFeedback(
        nextStatus === 'Confirmed'
          ? `Sale confirmed for ${data.order.orderId}. Associated plot marked as Sold.`
          : `Order ${data.order.orderId} updated.`
      );
      fetchOrders();
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Unable to update order.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setModalError('');
    setUpdating(true);

    try {
      await api.post('/admin/payments', {
        orderId: selectedOrder._id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNumber: payRef,
      });
      setShowPaymentForm(false);
      setPayAmount('');
      setPayRef('');
      setFeedback(`Payment recorded against ${selectedOrder.orderId}.`);
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Failed to record payment.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Plot Booking Orders
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review customer booking requests, log internal notes, confirm verified sales, or reject duplicate inquiries.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-[#0B1F3A] text-white text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="text-amber-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer name, phone, or plot #..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No booking orders found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Plot Details</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold">Order Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#0B1F3A] tabular-nums">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="font-mono tabular-nums">{order.phone}</div>
                      <div className="text-slate-500">{order.email}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-semibold text-slate-800">
                        {order.plot?.plotNumber || '—'} ·{' '}
                        {order.plot?.areaSqFt
                          ? `${order.plot.areaSqFt.toLocaleString()} sq ft (${order.plot.lengthFt}×${order.plot.widthFt} ft)`
                          : order.plot?.size || '—'}
                      </div>
                      <div className="text-slate-500">
                        {order.plot?.block || ''} · {order.plot?.title || 'Removed'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-[#0B1F3A] tabular-nums">
                      {formatPKR(order.confirmedSalePrice ?? order.plot?.price ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      <span
                        className={
                          order.status === 'Confirmed'
                            ? 'text-emerald-700'
                            : order.status === 'Rejected' ||
                                order.status === 'Cancelled'
                              ? 'text-red-700'
                              : 'text-amber-700'
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-xs font-semibold whitespace-nowrap"
                      >
                        Manage Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07162B]/70"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                  Order {selectedOrder.orderId}
                </h2>
                <p className="text-xs text-slate-500">
                  Submitted {formatDate(selectedOrder.createdAt)} · Current Status:{' '}
                  <strong className="text-[#0B1F3A]">{selectedOrder.status}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {modalError}
                </div>
              )}

              {/* Customer & Plot Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Customer Details</div>
                  <div className="font-bold text-[#0B1F3A]">
                    {selectedOrder.customerName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <a href={`tel:${selectedOrder.phone}`}>{selectedOrder.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <a href={`mailto:${selectedOrder.email}`}>{selectedOrder.email}</a>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Plot Information</div>
                  <div className="font-bold text-[#0B1F3A]">
                    {selectedOrder.plot?.title || 'Plot Unavailable'}
                  </div>
                  <div className="text-xs text-slate-600">
                    Plot {selectedOrder.plot?.plotNumber} ·{' '}
                    {selectedOrder.plot?.areaSqFt
                      ? `${selectedOrder.plot.lengthFt} × ${selectedOrder.plot.widthFt} ft (${selectedOrder.plot.areaSqFt.toLocaleString()} sq ft)`
                      : selectedOrder.plot?.size}{' '}
                    · {selectedOrder.plot?.block}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#0B1F3A] tabular-nums">
                    Listed: {formatPKR(selectedOrder.plot?.price || 0)}
                    {selectedOrder.plot?.pricePerSqFt
                      ? ` (${formatPKR(Math.round(selectedOrder.plot.pricePerSqFt))}/sq ft)`
                      : ''}{' '}
                    (Plot Status: {selectedOrder.plot?.status || '—'})
                  </div>
                </div>
              </div>

              {selectedOrder.message && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Customer Message
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                    {selectedOrder.message}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record call outcomes, token terms, or document checks..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              {/* Status Actions */}
              {selectedOrder.status !== 'Confirmed' ? (
                <div className="p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['New', 'Contacted', 'Pending', 'Cancelled'] as OrderStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={updating}
                            onClick={() => handleUpdateOrder(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              selectedOrder.status === st
                                ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            Mark {st}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateOrder()}
                      className="text-xs font-semibold text-amber-700 hover:underline"
                    >
                      Save Notes Only
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirmed Sale Price (PKR)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono tabular-nums"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateOrder('Rejected')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateOrder('Confirmed')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Sale</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-emerald-900">
                      Confirmed Sale ·{' '}
                      <span className="font-mono tabular-nums">
                        {formatPKR(selectedOrder.confirmedSalePrice || 0)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm((p) => !p)}
                      className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold"
                    >
                      {showPaymentForm ? 'Hide Payment Form' : '+ Record Payment'}
                    </button>
                  </div>

                  {showPaymentForm && (
                    <form
                      onSubmit={handleRecordPayment}
                      className="pt-3 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <input
                        type="number"
                        required
                        min="1"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="Amount (PKR)"
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                      />
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option>Bank Transfer</option>
                        <option>Pay Order / Demand Draft</option>
                        <option>Cash Receipt</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={payRef}
                          onChange={(e) => setPayRef(e.target.value)}
                          placeholder="Receipt / Ref #"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                        <button
                          type="submit"
                          disabled={updating}
                          className="px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold whitespace-nowrap"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
