import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import PlotCard from '../components/PlotCard';
import { api } from '../services/api';
import { Plot } from '../types';

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under PKR 30 Lac', min: '', max: '3000000' },
  { label: 'PKR 30 Lac – 70 Lac', min: '3000000', max: '7000000' },
  { label: 'PKR 70 Lac – 1.2 Cr', min: '7000000', max: '12000000' },
  { label: 'Above PKR 1.2 Cr', min: '12000000', max: '' },
];

const AREA_RANGES = [
  { label: 'All Areas (sq ft)', min: '', max: '' },
  { label: 'Under 1,000 sq ft', min: '', max: '999' },
  { label: '1,000 – 2,000 sq ft', min: '1000', max: '2000' },
  { label: '2,001 – 3,500 sq ft', min: '2001', max: '3500' },
  { label: 'Above 3,500 sq ft', min: '3501', max: '' },
];

export default function PlotsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [areaIdx, setAreaIdx] = useState(0);
  const [block, setBlock] = useState(searchParams.get('block') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priceIdx, setPriceIdx] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  const [plots, setPlots] = useState<Plot[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [facets, setFacets] = useState<{ blocks: string[]; sizes: string[] }>({
    blocks: [],
    sizes: [],
  });
  const [loading, setLoading] = useState(true);
  const [bookingPlot, setBookingPlot] = useState<Plot | null>(null);

  useEffect(() => {
    const paramCat = searchParams.get('category');
    const paramBlock = searchParams.get('block');
    if (paramCat) setCategory(paramCat);
    if (paramBlock) setBlock(paramBlock);
  }, [searchParams]);

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    const priceRange = PRICE_RANGES[priceIdx] || PRICE_RANGES[0];
    const areaRange = AREA_RANGES[areaIdx] || AREA_RANGES[0];
    try {
      const { data } = await api.get('/plots', {
        params: {
          category: category !== 'All' ? category : undefined,
          block: block !== 'All' ? block : undefined,
          status: status !== 'All' ? status : undefined,
          minPrice: priceRange.min || undefined,
          maxPrice: priceRange.max || undefined,
          minArea: areaRange.min || undefined,
          maxArea: areaRange.max || undefined,
          search: search.trim() || undefined,
          page,
          limit: 9,
        },
      });
      setPlots(data.plots || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.facets) {
        setFacets(data.facets);
      }
    } catch {
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }, [category, areaIdx, block, status, priceIdx, search, page]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  const handleReset = () => {
    setCategory('All');
    setAreaIdx(0);
    setBlock('All');
    setStatus('All');
    setPriceIdx(0);
    setSearch('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0B1F3A] text-white py-12 border-b border-amber-400/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Available Plots &amp; Inventory
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">
            Filter live residential, commercial, and mixed-use plots at Juddi Housing Scheme Pasni by area range (sq ft), sector block, price bracket, and availability status.
          </p>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search plot #, title, block..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Category */}
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed Use">Mixed Use</option>
            </select>

            {/* Area Range (sq ft) */}
            <select
              aria-label="Filter by area range"
              value={areaIdx}
              onChange={(e) => {
                setAreaIdx(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {AREA_RANGES.map((range, idx) => (
                <option key={range.label} value={idx}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Block */}
            <select
              aria-label="Filter by block"
              value={block}
              onChange={(e) => {
                setBlock(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="All">All Blocks</option>
              {facets.blocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Availability */}
            <select
              aria-label="Filter by availability"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Price Range:
              </span>
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    setPriceIdx(idx);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    priceIdx === idx
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600 tabular-nums">
                Showing <strong className="text-[#0B1F3A]">{plots.length}</strong> of{' '}
                <strong className="text-[#0B1F3A]">{total}</strong> plots
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#0B1F3A]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : plots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
              No matching plots found
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Try adjusting your category, price range, or block filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#112D54]"
            >
              Show All Plots
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <PlotCard key={plot._id} plot={plot} onBookNow={setBookingPlot} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-4 py-2 text-sm text-slate-600 tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <BookingModal
        plot={bookingPlot}
        availablePlots={plots}
        onClose={() => setBookingPlot(null)}
      />
    </div>
  );
}
