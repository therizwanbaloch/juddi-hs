import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookingForm } from '../components/BookingModal';
import { api } from '../services/api';
import { Plot } from '../types';
import { formatPKR } from '../utils/format';

export default function PlotDetailPage() {
  const { id } = useParams();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/plots/${id}`)
      .then(({ data }) => {
        setPlot(data.plot);
        setActiveImgIdx(0);
      })
      .catch(() => setPlot(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Plot Not Found
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          The requested plot listing may have been removed or updated.
        </p>
        <Link
          to="/plots"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plots</span>
        </Link>
      </div>
    );
  }

  const images = plot.images || [];
  const activeUrl = images[activeImgIdx]?.url;
  const isSold = plot.status === 'Sold';
  const isReserved = plot.status === 'Reserved';

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/plots"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0B1F3A] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Available Plots</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-Image Gallery & Specs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="aspect-[16/10] bg-slate-100 relative">
                {activeUrl ? (
                  <img
                    src={activeUrl}
                    alt={`${plot.title} view ${activeImgIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B1F3A] to-[#1A3D6E] flex flex-col items-center justify-center text-white">
                    <Building2 className="w-12 h-12 text-amber-400 mb-2" />
                    <span className="font-display font-bold">{plot.title}</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.publicId + idx}
                      type="button"
                      onClick={() => setActiveImgIdx(idx)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        idx === activeImgIdx
                          ? 'border-amber-400'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plot Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500">
                  <span>{plot.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-bold text-[#0B1F3A]">
                    Plot {plot.plotNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{plot.block}</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    isSold
                      ? 'text-red-700'
                      : isReserved
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }`}
                >
                  {isSold ? (
                    <Lock className="w-4 h-4" />
                  ) : isReserved ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{plot.status}</span>
                </div>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] mt-3">
                {plot.title}
              </h1>

              <div className="mt-4 pb-6 border-b border-slate-200 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">Complete Plot Price</div>
                  <div className="font-display text-3xl font-extrabold text-[#0B1F3A] tabular-nums mt-0.5">
                    {formatPKR(plot.price)}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-slate-500">Dimensions (Length &times; Width)</div>
                  <div className="font-mono text-lg font-bold text-amber-700 tabular-nums mt-0.5">
                    {plot.lengthFt} &times; {plot.widthFt} ft
                  </div>
                </div>
              </div>

              {/* Structured Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">Plot Number</div>
                  <div className="font-mono font-bold text-sm text-[#0B1F3A] mt-0.5 tabular-nums">
                    {plot.plotNumber}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Dimensions (Length &times; Width)</div>
                  <div className="font-mono font-semibold text-sm text-[#0B1F3A] mt-0.5 tabular-nums">
                    {plot.lengthFt} &times; {plot.widthFt} ft
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Sector / Block</div>
                  <div className="font-semibold text-sm text-[#0B1F3A] mt-0.5">
                    {plot.block}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Category</div>
                  <div className="font-semibold text-sm text-[#0B1F3A] mt-0.5">
                    {plot.category}
                  </div>
                </div>
                {plot.facing && (
                  <div>
                    <div className="text-xs text-slate-500">Orientation</div>
                    <div className="font-semibold text-sm text-[#0B1F3A] mt-0.5">
                      {plot.facing}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="py-6 border-b border-slate-200">
                <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                  Overview &amp; Location Notes
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                  {plot.description}
                </p>
              </div>

              {/* Features */}
              {plot.features && plot.features.length > 0 && (
                <div className="pt-6">
                  <h2 className="font-display text-lg font-bold text-[#0B1F3A] mb-3">
                    Plot Features &amp; Utilities
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {plot.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Inquiry Form & Direct Sales Contact */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                Book / Inquire About This Plot
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Submit your booking request to reserve priority review from our Juddi Housing Scheme Pasni sales desk.
              </p>

              <BookingForm initialPlot={plot} compact />
            </div>

            <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 space-y-3">
              <div className="font-display font-bold text-base text-amber-400">
                Direct Allotment Office
              </div>
              <div className="text-sm text-slate-200">
                Contact Person: <strong className="text-white">Tariq Hameed</strong>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:03215552244" className="font-mono tabular-nums hover:text-amber-400">
                  0321 5552244
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info@juddihousingscheme.pk</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300 pt-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Gwadar Old City, Gwadar, 91200, Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
