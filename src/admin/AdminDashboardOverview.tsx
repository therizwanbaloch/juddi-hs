import { Calendar, ClipboardList, Layers, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../services/api';
import { DashboardAnalytics } from '../types';
import { formatDate, formatPKR, formatShortPKR } from '../utils/format';

export default function AdminDashboardOverview() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard', {
        params: {
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-sm text-slate-600">
        Unable to load dashboard analytics.
      </div>
    );
  }

  const { summary, periods, charts, recentOrders } = data;
  const activeSeries =
    chartPeriod === 'daily'
      ? charts.dailySeries
      : chartPeriod === 'weekly'
        ? charts.weeklySeries
        : chartPeriod === 'yearly'
          ? charts.yearlySeries
          : charts.monthlySeries;

  return (
    <div className="space-y-6">
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live metrics calculated directly from plot, order, and payment records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-2">
          <Calendar className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="date"
            aria-label="Filter from date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-700"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            aria-label="Filter to date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-700"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="text-xs font-semibold text-amber-700 px-2 py-1 hover:bg-amber-50 rounded-md"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 8 KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Plots</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-display text-2xl font-bold text-[#0B1F3A] mt-2 tabular-nums">
            {summary.totalPlots}
          </div>
          <div className="text-xs text-slate-500 mt-1">Registered colony inventory</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Available Plots</div>
          <div className="font-display text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            {summary.availablePlots}
          </div>
          <div className="text-xs text-slate-500 mt-1">Open for booking inquiry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Reserved Plots</div>
          <div className="font-display text-2xl font-bold text-amber-600 mt-2 tabular-nums">
            {summary.reservedPlots}
          </div>
          <div className="text-xs text-slate-500 mt-1">Held during verification</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Sold Plots</div>
          <div className="font-display text-2xl font-bold text-[#0B1F3A] mt-2 tabular-nums">
            {summary.soldPlots}
          </div>
          <div className="text-xs text-slate-500 mt-1">Locked from new bookings</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Booking Orders</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-display text-2xl font-bold text-[#0B1F3A] mt-2 tabular-nums">
            {summary.totalBookingOrders}
          </div>
          <div className="text-xs text-slate-500 mt-1">All submitted inquiries</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Pending Orders</div>
          <div className="font-display text-2xl font-bold text-amber-600 mt-2 tabular-nums">
            {summary.pendingOrders}
          </div>
          <div className="text-xs text-slate-500 mt-1">New, Contacted &amp; Pending</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Confirmed Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            {summary.confirmedSalesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            Today: {periods.today.count} ({formatShortPKR(periods.today.value)})
          </div>
        </div>

        <div className="bg-[#0B1F3A] text-white rounded-xl p-5">
          <div className="text-xs text-amber-300">Confirmed Sales Value</div>
          <div className="font-display text-xl font-bold text-white mt-1.5 tabular-nums">
            {formatShortPKR(summary.confirmedSalesValue)}
          </div>
          <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-white/15 flex justify-between gap-2 tabular-nums">
            <span>Collected Payments:</span>
            <strong className="text-amber-400">
              {formatPKR(summary.collectedPaymentsTotal)}
            </strong>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Revenue Over Time */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#0B1F3A]">
                Confirmed Sales &amp; Revenue Trend
              </h2>
              <p className="text-xs text-slate-500">
                Only confirmed sales appear here; unconfirmed requests are excluded.
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    chartPeriod === period
                      ? 'bg-white text-[#0B1F3A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)
                  }
                />
                <Tooltip
                  formatter={(value, name) => {
                    const num = Number(value) || 0;
                    const label = String(name || '');
                    return [
                      label === 'Confirmed Sales' ? `${num} plots` : formatPKR(num),
                      label || 'Value',
                    ];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="salesValue"
                  name="Confirmed Sales Value"
                  stroke="#0B1F3A"
                  fill="#0B1F3A"
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
                {chartPeriod === 'monthly' && (
                  <Area
                    type="monotone"
                    dataKey="collectedAmount"
                    name="Collected Payments"
                    stroke="#D97706"
                    fill="#F59E0B"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot Availability Statistics */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-display text-base font-bold text-[#0B1F3A]">
              Plot Availability by Category
            </h2>
            <p className="text-xs text-slate-500">
              Current inventory distribution across Residential, Commercial &amp; Mixed Use.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.plotAvailabilityByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Available" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Reserved" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Sold" stackId="a" fill="#0B1F3A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Booking Requests */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[#0B1F3A]">
              Recent Booking Inquiries
            </h2>
            <p className="text-xs text-slate-500">
              Latest customer requests submitted from the public website.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            Manage All Orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No booking requests have been submitted yet. Inquiries submitted on the public website will appear here immediately.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Plot</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0B1F3A] tabular-nums">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        {order.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {order.plot?.plotNumber || '—'} · {order.plot?.size || ''}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.plot?.title || 'Plot removed'}
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
