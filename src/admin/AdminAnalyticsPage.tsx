import { useCallback, useEffect, useState } from 'react';
import {
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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );

  const loadAnalytics = useCallback(async () => {
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
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Calculating sales analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Unable to load analytics data.
      </div>
    );
  }

  const { periods, summary, charts, salesHistory, payments } = data;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
            Sales &amp; Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed plot sales vs. verified collected payment records from the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-2">
          <input
            type="date"
            aria-label="Analytics from date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            aria-label="Analytics to date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="text-xs font-semibold text-amber-700 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Period Sales Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Sales", data: periods.today },
          { label: 'Weekly Sales (7d)', data: periods.weekly },
          { label: 'Monthly Sales', data: periods.monthly },
          { label: 'Yearly Sales', data: periods.yearly },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="font-display text-xl font-bold text-[#0B1F3A] mt-2 tabular-nums">
              {formatShortPKR(item.data.value)}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {item.data.count} confirmed {item.data.count === 1 ? 'sale' : 'sales'}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmed Sales Value vs Actual Collected Money */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Total Confirmed Sales</div>
          <div className="font-display text-2xl font-bold text-[#0B1F3A] mt-1.5 tabular-nums">
            {summary.confirmedSalesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Plots marked Sold via confirmed orders
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Total Confirmed Sales Value</div>
          <div className="font-display text-2xl font-bold text-[#0B1F3A] mt-1.5 tabular-nums">
            {formatPKR(summary.confirmedSalesValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Contracted value of confirmed plot sales
          </div>
        </div>

        <div className="bg-[#0B1F3A] text-white rounded-xl p-5">
          <div className="text-xs text-amber-300">Actual Collected Payments</div>
          <div className="font-display text-2xl font-bold text-white mt-1.5 tabular-nums">
            {formatPKR(summary.collectedPaymentsTotal)}
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Sum of verified payment receipts logged ({payments.length})
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#0B1F3A] mb-0.5">
                Confirmed Sales vs. Collected Payments ({chartPeriod})
              </h2>
              <p className="text-xs text-slate-500">
                Distinguishes contracted sale value from actual recorded receipts across daily, weekly, monthly, and yearly intervals.
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
              <BarChart data={activeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)
                  }
                />
                <Tooltip formatter={(val) => formatPKR(Number(val) || 0)} />
                <Legend />
                <Bar
                  dataKey="salesValue"
                  name="Confirmed Sales Value"
                  fill="#0B1F3A"
                  radius={[4, 4, 0, 0]}
                />
                {chartPeriod === 'monthly' && (
                  <Bar
                    dataKey="collectedAmount"
                    name="Collected Payments"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h2 className="font-display text-base font-bold text-[#0B1F3A] mb-1">
            Yearly Sales Overview
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Annual confirmed allotment revenue.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.yearlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)
                  }
                />
                <Tooltip formatter={(val) => formatPKR(Number(val) || 0)} />
                <Bar
                  dataKey="salesValue"
                  name="Annual Sales"
                  fill="#0B1F3A"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confirmed Sales History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-display text-base font-bold text-[#0B1F3A]">
            Confirmed Sales History
          </h2>
          <p className="text-xs text-slate-500">
            All orders finalized by administration.
          </p>
        </div>

        {salesHistory.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No confirmed sales recorded in this period yet. Confirm a booking order in Plot Orders to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Buyer</th>
                  <th className="py-3 px-4 font-semibold">Plot</th>
                  <th className="py-3 px-4 font-semibold">Confirmed Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Sale Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesHistory.map((sale) => (
                  <tr key={sale._id}>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#0B1F3A]">
                      {sale.orderId}
                    </td>
                    <td className="py-3 px-4">{sale.customerName}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {sale.plot?.plotNumber} ·{' '}
                      {sale.plot?.areaSqFt
                        ? `${sale.plot.areaSqFt.toLocaleString()} sq ft`
                        : sale.plot?.size}{' '}
                      ({sale.plot?.block})
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      {formatDate(sale.confirmedAt || sale.updatedAt)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-emerald-700 tabular-nums">
                      {formatPKR(sale.confirmedSalePrice ?? sale.plot?.price ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-display text-base font-bold text-[#0B1F3A]">
            Recorded Payment Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Actual funds collected against confirmed plot sales.
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No payment receipts have been logged yet. Actual collected money remains PKR 0 until payment records exist.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-3 px-4 font-semibold">Reference #</th>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Payment Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <tr key={pay._id}>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0B1F3A]">
                      {pay.referenceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {pay.order?.orderId || '—'}
                    </td>
                    <td className="py-3 px-4">{pay.order?.customerName || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {pay.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      {formatDate(pay.paymentDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-emerald-700 tabular-nums">
                      {formatPKR(pay.amount)}
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
