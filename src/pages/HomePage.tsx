import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Droplets,
  Landmark,
  MapPin,
  Megaphone,
  Route,
  ShieldCheck,
  Trees,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import PlotCard from '../components/PlotCard';
import { api } from '../services/api';
import { Plot } from '../types';

const FACILITIES = [
  { icon: Route, label: 'Wide Roads', detail: '60 ft & 80 ft carpeted avenues' },
  { icon: Zap, label: 'Reliable Electricity', detail: 'Dedicated grid & street lighting' },
  { icon: Droplets, label: 'Clean Water Supply', detail: 'Planned pressurized water network' },
  { icon: Trees, label: 'Green Parks', detail: 'Landscaped family parks & tracks' },
  { icon: Landmark, label: 'Central Mosque', detail: 'Sector-accessible Jamia Mosque' },
  { icon: ShieldCheck, label: 'Security System', detail: '24/7 gated perimeter monitoring' },
];

const WHY_INVEST = [
  'Prime Location in Gwadar Old City',
  'High Return on Investment',
  'Safe & Secure Community',
  'Modern Infrastructure',
];

const CATEGORIES = [
  {
    key: 'Residential' as const,
    title: 'Residential Plots',
    subtitle: '20×35 – 50×90 ft Coastal Plots',
    image: '/src/assets/images/gwadar_residential_sector_1795861377102.jpg',
    to: '/plots?category=Residential',
  },
  {
    key: 'Commercial' as const,
    title: 'Commercial Plots',
    subtitle: '30×30 – 30×60 ft Main Boulevard',
    image: '/src/assets/images/gwadar_commercial_plaza_1795861377664.jpg',
    to: '/plots?category=Commercial',
  },
  {
    key: 'Mixed Use' as const,
    title: 'Mixed Use Plots',
    subtitle: '30×45 – 35×65 ft Retail + Apartments',
    image: '/src/assets/images/gwadar_mixed_avenue_1795861378469.jpg',
    to: '/plots?category=Mixed%20Use',
  },
];

const GALLERY_PREVIEW = [
  {
    src: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_9.51.01_PM_a42de632.jpeg',
    caption: 'Juddi Housing Scheme Coastal Shoreline Landmark',
  },
  {
    src: '/src/assets/images/gwadar_coastal_masterplan_1795861378571.jpg',
    caption: 'Gwadar & Makran Coast Aerial Master Plan',
  },
  {
    src: '/src/assets/images/gwadar_residential_sector_1795861377102.jpg',
    caption: 'Block A Residential Avenue',
  },
  {
    src: '/src/assets/images/gwadar_commercial_plaza_1795861377664.jpg',
    caption: 'Gwadar Commercial Boulevard Enclave',
  },
  {
    src: '/src/assets/images/gwadar_mixed_avenue_1795861378469.jpg',
    caption: 'Mixed-Use Corner Developments',
  },
];

const UPDATES = [
  {
    date: 'November 2026',
    title: 'Main Boulevard Asphalt & Street Lighting Phase I',
    summary:
      '80-foot central corridor grading, curb stones, and solar-assisted LED poles completed along Block A and Commercial Enclave.',
  },
  {
    date: 'October 2026',
    title: 'Boundary Wall & Main Entrance Gate Structure',
    summary:
      'Perimeter security fencing and twin-arch gateway masonry finished with dedicated 24/7 security checkpost.',
  },
  {
    date: 'September 2026',
    title: 'Sector Demarcation & Corner Plot Pegging',
    summary:
      'Surveyed boundary markers installed across Blocks A, B, and C for immediate on-site plot inspection.',
  },
];

const ANNOUNCEMENTS = [
  {
    date: 'Nov 18, 2026',
    title: 'Open Booking Requests for Block A & Block B Residential Plots',
    detail:
      'Families and investors may submit formal booking inquiries online or at our Gwadar Old City sales office.',
  },
  {
    date: 'Nov 05, 2026',
    title: 'Commercial Boulevard Frontage Allocation Schedule',
    detail:
      '30 × 30 ft and 30 × 60 ft commercial plots facing the main approach road are now open for inspection.',
  },
];

export default function HomePage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [categoryCounts, setCategoryCounts] = useState({
    Residential: 0,
    Commercial: 0,
    'Mixed Use': 0,
  });
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [bookingPlot, setBookingPlot] = useState<Plot | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get('/plots', { params: { limit: 12 } })
      .then(({ data }) => {
        if (active) {
          setPlots(data.plots || []);
          if (data.facets?.categoryCounts) {
            setCategoryCounts(data.facets.categoryCounts);
          }
        }
      })
      .catch(() => {
        if (active) setPlots([]);
      })
      .finally(() => {
        if (active) setLoadingPlots(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredPlots = plots.slice(0, 3);
  const residentialPlots = plots
    .filter((p) => p.category === 'Residential')
    .slice(0, 3);
  const commercialPlots = plots
    .filter((p) => p.category === 'Commercial' || p.category === 'Mixed Use')
    .slice(0, 3);

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION featuring user's provided coastal image */}
      <section className="relative bg-gradient-to-b from-[#F4F8FC] via-white to-white border-b border-slate-200 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="font-editorial italic text-2xl sm:text-3xl text-amber-500 font-semibold">
                Welcome to
              </span>

              <h1 className="mt-2 font-display font-extrabold text-[#0B1F3A] tracking-tight leading-[1.08] text-[clamp(2.25rem,4vw,3.75rem)] text-balance">
                Juddi Housing Scheme{' '}
                <span className="text-amber-500">Pasni</span>
              </h1>

              <p className="mt-4 font-display text-lg sm:text-xl font-semibold text-[#112D54]">
                Your Dream Home, Your Future Investment.
              </p>

              <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-xl">
                Located in Gwadar Old City, Gwadar, 91200, Pakistan — combining modern urban planning, wide carpeted boulevards, and transparent residential and commercial plot allotments.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/plots"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] font-display font-bold text-sm transition-colors whitespace-nowrap"
                >
                  <span>Explore Plots</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white font-display font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Media Column — User's Provided Coastal Image */}
            <div className="lg:col-span-6 flex">
              <div className="relative w-full min-h-[340px] sm:min-h-[420px] lg:h-full rounded-2xl overflow-hidden border border-amber-400/40 shadow-lg bg-[#0B1F3A]">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-21_at_9.51.01_PM_a42de632.jpeg"
                  alt="Juddi Housing Scheme Pasni coastal landmark in Gwadar, Balochistan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07162B]/85 via-[#07162B]/35 to-transparent p-5 text-white">
                  <div className="text-xs font-medium text-amber-300">
                    Gwadar Old City, Gwadar, 91200, Pakistan
                  </div>
                  <div className="font-display font-bold text-base mt-0.5">
                    Coastal Community &amp; Investment Corridor
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colony Key Metrics Strip below Hero Split */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="font-display text-2xl font-bold text-[#0B1F3A] tabular-nums">
                {plots.length > 0 ? plots.length : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Registered Inventory Plots
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#0B1F3A] tabular-nums">
                20×35 – 50×90 ft
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Dimensions (Length &times; Width)
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#0B1F3A]">
                80 ft – 100 ft
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Main Boulevard Width
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#0B1F3A] tabular-nums">
                0321 5552244
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Direct Sales Desk · Tariq Hameed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT US + OUR FACILITIES + WHY INVEST WITH US (Reference Middle Band) */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* About Us */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center gap-2.5 text-[#0B1F3A]">
                <Building2 className="w-5 h-5 text-amber-500 shrink-0" />
                <h2 className="font-display text-2xl font-bold">About Us</h2>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Juddi Housing Scheme Pasni is a modern and well-planned residential and commercial community located in Gwadar Old City, Gwadar, 91200, Pakistan, designed to provide a secure, comfortable, and prosperous living environment for families and investors.
              </p>
              <div className="mt-4 rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 bg-slate-100">
                <img
                  src="/src/assets/images/gwadar_residential_sector_1795861377102.jpg"
                  alt="Juddi Housing Scheme Pasni coastal residential avenue in Gwadar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-5 pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-sm font-semibold transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Our Facilities */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
                  Our Facilities
                </h2>
                <Link
                  to="/facilities"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap"
                >
                  All Facilities &rarr;
                </Link>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Modern infrastructure engineered for coastal living.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 flex-1">
                {FACILITIES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#0B1F3A] text-amber-400 flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="font-display text-xs font-bold text-[#0B1F3A]">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.detail}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why Invest With Us? (Deep Navy Panel matching reference) */}
            <div className="lg:col-span-4 bg-[#0B1F3A] text-white rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-amber-400">
                  Why Invest With Us?
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Positioned in Gwadar Old City, Gwadar&apos;s coastal growth corridor with verified sector planning and transparent allotment procedures.
                </p>

                <ul className="mt-6 space-y-4">
                  {WHY_INVEST.map((reason) => (
                    <li key={reason} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-[#07162B] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="font-display font-medium text-sm sm:text-base text-white">
                        {reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-300">Site Visits Daily</div>
                  <div className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                    0321 5552244
                  </div>
                </div>
                <Link
                  to="/blocks"
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Explore Blocks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLOT CATEGORIES (Reference Lower Strip) */}
      <section className="py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                Plot Categories
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose the right residential, commercial, or mixed-use allotment for your plans.
              </p>
            </div>
            <Link
              to="/plots"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1F3A] hover:text-amber-600 transition-colors"
            >
              <span>Browse All Plots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.key];
              return (
                <Link
                  key={cat.title}
                  to={cat.to}
                  className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4 bg-[#0B1F3A] text-white flex items-center justify-between gap-3">
                    <div>
                      <div className="font-display font-bold text-base">
                        {cat.title}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {cat.subtitle} &middot; {count} {count === 1 ? 'Plot' : 'Plots'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED, RESIDENTIAL & COMMERCIAL PLOTS (Live from MongoDB / Store) */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Featured Plots */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                  Featured Plots
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Live inventory available for immediate booking inquiry.
                </p>
              </div>
              <Link
                to="/plots"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-[#0B1F3A] hover:bg-slate-100 transition-colors self-start sm:self-auto"
              >
                View All Inventory
              </Link>
            </div>

            {loadingPlots ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : featuredPlots.length === 0 ? (
              <div className="p-10 rounded-xl bg-white border border-slate-200 text-center text-slate-600 text-sm">
                No plots are currently listed. Check back soon or contact our sales desk.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPlots.map((plot) => (
                  <PlotCard key={plot._id} plot={plot} onBookNow={setBookingPlot} />
                ))}
              </div>
            )}
          </div>

          {/* Available Residential Plots */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A]">
                  Available Residential Plots
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Peaceful family blocks near parks, schools, and the Jamia Mosque.
                </p>
              </div>
              <Link
                to="/plots?category=Residential"
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap"
              >
                All Residential &rarr;
              </Link>
            </div>
            {residentialPlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {residentialPlots.map((plot) => (
                  <PlotCard key={plot._id} plot={plot} onBookNow={setBookingPlot} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-600">
                <span>
                  No Residential plots are currently listed. Contact our sales desk (0321 5552244) for upcoming allotments.
                </span>
                <Link
                  to="/plots?category=Residential"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-[#0B1F3A] font-semibold text-xs hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
                >
                  Open Residential Filter
                </Link>
              </div>
            )}
          </div>

          {/* Commercial & Mixed-Use Plots */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A]">
                  Commercial &amp; Mixed-Use Plots
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  High-footfall main boulevard frontage in Gwadar Old City, Gwadar.
                </p>
              </div>
              <Link
                to="/plots?category=Commercial"
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap"
              >
                All Commercial &rarr;
              </Link>
            </div>
            {commercialPlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {commercialPlots.map((plot) => (
                  <PlotCard key={plot._id} plot={plot} onBookNow={setBookingPlot} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-600">
                <span>
                  No Commercial or Mixed-Use plots are currently listed. Contact our sales desk (0321 5552244) for boulevard availability.
                </span>
                <Link
                  to="/plots?category=Commercial"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-[#0B1F3A] font-semibold text-xs hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
                >
                  Open Commercial Filter
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. LOCATION ADVANTAGES & MASTER PLAN PREVIEW */}
      <section className="py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Location Card */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
                  <MapPin className="w-4 h-4" />
                  <span>Strategic Coastal Connectivity</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#0B1F3A] mt-2">
                  Our Location in Gwadar
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Situated at Gwadar Old City, Gwadar, 91200, Pakistan — connecting seamlessly to Gwadar Port, Marine Drive, and the Makran Coastal Highway.
                </p>

                <dl className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Gwadar Port &amp; Fish Harbour</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] tabular-nums">
                      5 min drive
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Gwadar Marine Drive</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] tabular-nums">
                      6 min drive
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Makran Coastal Highway</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] tabular-nums">
                      10 min drive
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">New Gwadar Int&apos;l Airport</dt>
                    <dd className="font-mono font-semibold text-[#0B1F3A] tabular-nums">
                      25 min drive
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 pt-4">
                <Link
                  to="/location"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-sm font-semibold transition-colors"
                >
                  <span>View Location Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Master Plan Preview */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                  src="/src/assets/images/gwadar_coastal_masterplan_1795861378571.jpg"
                  alt="Juddi Housing Scheme Pasni Aerial Master Plan in Gwadar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                    Colony Master Plan &amp; Sector Blocks
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Organized residential blocks A, B, and C surrounding central green parks, mosque, and main commercial boulevard.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to="/master-plan"
                    className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] text-xs font-bold whitespace-nowrap transition-colors"
                  >
                    Master Plan
                  </Link>
                  <Link
                    to="/blocks"
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-[#0B1F3A] hover:bg-slate-50 text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    View Blocks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEVELOPMENT UPDATES, GALLERY & LATEST ANNOUNCEMENTS */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Gallery Strip */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
                  Gallery
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  A visual glimpse of Juddi Housing Scheme Pasni and coastal surroundings.
                </p>
              </div>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#112D54] transition-colors whitespace-nowrap"
              >
                <span>View Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {GALLERY_PREVIEW.map((img) => (
                <Link
                  key={img.src}
                  to="/gallery"
                  className="group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 block"
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Updates + Announcements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                    Development Updates
                  </h3>
                </div>
                <Link
                  to="/updates"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                >
                  All Updates &rarr;
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {UPDATES.map((item) => (
                  <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                    <div className="text-xs font-mono text-amber-600 font-semibold">
                      {item.date}
                    </div>
                    <h4 className="font-display font-bold text-[#0B1F3A] mt-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                      Latest Announcements
                    </h3>
                  </div>
                  <Link
                    to="/announcements"
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-4">
                  {ANNOUNCEMENTS.map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="text-xs font-mono text-slate-500">
                        {item.date}
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#0B1F3A] mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready to reserve a residential or commercial plot?
                </span>
                <Link
                  to="/plots"
                  className="text-xs font-bold text-[#0B1F3A] hover:text-amber-600 whitespace-nowrap"
                >
                  Book Now &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        plot={bookingPlot}
        availablePlots={plots}
        onClose={() => setBookingPlot(null)}
      />
    </div>
  );
}
