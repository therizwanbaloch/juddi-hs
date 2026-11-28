import { ArrowRight, Building2, CheckCircle2, Clock, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plot } from '../types';
import { formatPKR } from '../utils/format';

interface PlotCardProps {
  plot: Plot;
  onBookNow: (plot: Plot) => void;
}

export default function PlotCard({ plot, onBookNow }: PlotCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverImage = plot.images?.[0]?.url;

  const isSold = plot.status === 'Sold';
  const isReserved = plot.status === 'Reserved';

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md">
      {/* 4:3 Image with resilient fallback */}
      <Link
        to={`/plots/${plot._id}`}
        className="relative aspect-[4/3] bg-slate-100 overflow-hidden block group"
      >
        {coverImage && !imgError ? (
          <img
            src={coverImage}
            alt={`${plot.title} - Plot ${plot.plotNumber}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0B1F3A] to-[#1A3D6E] flex flex-col items-center justify-center p-6 text-center text-white">
            <Building2 className="w-10 h-10 text-amber-400 mb-2" />
            <span className="font-display font-semibold text-sm">{plot.title}</span>
            <span className="text-xs text-slate-300 mt-1">Plot {plot.plotNumber}</span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Clean unboxed metadata row */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
          <span>{plot.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-700">
            Plot {plot.plotNumber}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums font-semibold text-slate-700">
            {plot.lengthFt} × {plot.widthFt} ft
          </span>
          <span aria-hidden="true">·</span>
          <span>{plot.block}</span>
        </div>

        <Link to={`/plots/${plot._id}`} className="mt-2 group">
          <h3 className="font-display text-lg font-bold text-[#0B1F3A] group-hover:text-amber-600 transition-colors line-clamp-1">
            {plot.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 flex-1">
          {plot.description}
        </p>

        {/* Price + Explicit Status Indicator (Icon + Label) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Total Price</div>
            <div className="font-display text-lg font-bold text-[#0B1F3A] tabular-nums">
              {formatPKR(plot.price)}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              isSold
                ? 'text-red-700'
                : isReserved
                  ? 'text-amber-700'
                  : 'text-emerald-700'
            }`}
          >
            {isSold ? (
              <Lock className="w-3.5 h-3.5 shrink-0" />
            ) : isReserved ? (
              <Clock className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{plot.status}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link
            to={`/plots/${plot._id}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            disabled={isSold}
            onClick={() => onBookNow(plot)}
            className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              isSold
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0B1F3A] hover:bg-[#112D54] text-white'
            }`}
          >
            {isSold ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </article>
  );
}
