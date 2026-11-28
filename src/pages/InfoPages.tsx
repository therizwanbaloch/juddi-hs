import {
  ArrowRight,
  Building2,
  Check,
  Compass,
  Droplets,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  Trees,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Plot } from '../types';

function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="bg-[#0B1F3A] text-white py-12 border-b border-amber-400/20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">{title}</h1>
        <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">{subtitle}</p>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        title="About Juddi Housing Scheme Pasni"
        subtitle="A modern, family-centered coastal residential and commercial community located in Gwadar Old City, Gwadar, 91200, Pakistan."
      />

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
              Society Overview &amp; Coastal Vision
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Juddi Housing Scheme Pasni brings structured urban planning, clear title security, and modern municipal utilities to Gwadar Old City, Gwadar, 91200, Pakistan. Designed for both permanent family residences and long-term commercial growth, every block prioritizes wide roads, green spaces, and effortless access across Gwadar.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our goal is simple: build a peaceful, well-connected neighborhood where families thrive and investors see sustainable value appreciation alongside the wider Makran coastal development corridor.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/plots"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] font-bold text-sm"
              >
                <span>Browse Available Plots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/master-plan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-[#0B1F3A] font-semibold text-sm hover:bg-slate-50"
              >
                <span>View Master Plan</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100">
            <img
              src="/src/assets/images/gwadar_residential_sector_1795861377102.jpg"
              alt="Juddi Housing Scheme Pasni coastal community in Gwadar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-display text-xl font-bold text-[#0B1F3A]">Our Vision</h3>
            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
              To establish Gwadar&apos;s benchmark planned housing colony — uniting coastal tranquility, durable civil infrastructure, and dignified family living under the guiding spirit of &ldquo;Together for a Better Pasni.&rdquo;
            </p>
          </div>
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-display text-xl font-bold text-[#0B1F3A]">Our Mission</h3>
            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
              To deliver transparently allotted residential, commercial, and mixed-use plots backed by carpeted boulevards, clean water supply, reliable electricity, and responsive customer support.
            </p>
          </div>
        </div>

        {/* Why Choose Our Housing Colony */}
        <div className="bg-[#0B1F3A] text-white rounded-2xl p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-amber-400">
            Why Choose Juddi Housing Scheme?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[
              {
                title: 'Prime Coastal Access',
                desc: 'Located in Gwadar Old City, Gwadar (91200) with quick connectivity to Gwadar Port and Makran Coastal Highway.',
              },
              {
                title: 'Verified Allotment',
                desc: 'Transparent plot numbering across Blocks A, B, C, and Commercial Enclave.',
              },
              {
                title: 'Complete Utilities',
                desc: 'Planned water distribution, underground-ready power lines, and storm drainage.',
              },
              {
                title: 'Community Security',
                desc: 'Boundary wall perimeter, controlled main gate, and 24/7 security oversight.',
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-[#07162B] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function FacilitiesPage() {
  const items = [
    {
      icon: Route,
      title: 'Wide Carpeted Roads',
      desc: 'Main boulevards spanning 80–100 feet with 40–60 feet internal sector streets, footpaths, and street lighting.',
    },
    {
      icon: Zap,
      title: 'Reliable Electricity',
      desc: 'Planned grid distribution, dedicated transformers, and energy-efficient solar street illumination.',
    },
    {
      icon: Droplets,
      title: 'Clean Water Supply',
      desc: 'Central water storage and sector-level supply pipelines engineered for consistent household pressure.',
    },
    {
      icon: Trees,
      title: 'Green Parks & Play Areas',
      desc: 'Landscaped coastal parks, shaded walking tracks, and dedicated family recreational lawns in each sector.',
    },
    {
      icon: Landmark,
      title: 'Grand Central Mosque',
      desc: 'Spacious Jamia Mosque located in the heart of the colony, accessible within a short walk from every block.',
    },
    {
      icon: ShieldCheck,
      title: '24/7 Gated Security',
      desc: 'Perimeter boundary wall, monitored entrance gatehouse, and trained community security patrols.',
    },
    {
      icon: GraduationCap,
      title: 'Education & Community Center',
      desc: 'Reserved civic plot for primary/secondary schooling and neighborhood community gatherings.',
    },
    {
      icon: HeartPulse,
      title: 'Health & Commercial Services',
      desc: 'Main Commercial Enclave zoned for medical clinics, pharmacies, grocery markets, and banking services.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHero
        title="Facilities & Amenities"
        subtitle="Essential urban infrastructure and community spaces engineered for comfortable coastal living in Gwadar Old City, Gwadar."
      />
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] text-amber-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function LocationPage() {
  const landmarks = [
    { place: 'Gwadar Old City Commercial Center', time: '2 Minutes', dist: '0.5 km' },
    { place: 'Gwadar Port & Fish Harbour', time: '5 Minutes', dist: '2.2 km' },
    { place: 'Gwadar Marine Drive', time: '6 Minutes', dist: '3.0 km' },
    { place: 'Makran Coastal Highway (N-10)', time: '10 Minutes', dist: '5.5 km' },
    { place: 'New Gwadar International Airport', time: '25 Minutes', dist: '22.0 km' },
  ];

  return (
    <div className="bg-white">
      <PageHero
        title="Location & Coastal Connectivity"
        subtitle="Juddi Housing Scheme Pasni is located at Gwadar Old City, Gwadar, 91200, Pakistan — connecting coastal lifestyle with Makran trade routes."
      />
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                <MapPin className="w-4 h-4" />
                <span>Site Address</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0B1F3A] mt-2">
                Gwadar Old City, Gwadar, 91200, Pakistan
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Juddi Housing Scheme Pasni occupies accessible coastal land in Gwadar Old City, just minutes from the Arabian Sea shoreline and Gwadar Port, offering refreshing sea breeze and clean road connectivity.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-6 text-xs font-mono text-slate-600 tabular-nums">
                <span>LAT: 25.1216° N</span>
                <span>LON: 62.3254° E</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 font-display font-bold text-[#0B1F3A]">
                Key Distance &amp; Travel Times
              </div>
              <div className="divide-y divide-slate-100">
                {landmarks.map((l) => (
                  <div
                    key={l.place}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="font-medium text-slate-800">{l.place}</span>
                    <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
                      <span className="text-slate-500">{l.dist}</span>
                      <span className="font-bold text-[#0B1F3A]">{l.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] relative">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-21_at_9.51.01_PM_a42de632.jpeg"
                alt="Juddi Housing Scheme Pasni Coastal Shoreline in Gwadar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#0B1F3A]/90 backdrop-blur-xs text-white p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">
                    Site Visit Appointments
                  </div>
                  <div className="text-sm font-medium mt-0.5">
                    Daily 9:00 AM – 6:00 PM · Call 0321 5552244
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg bg-amber-400 text-[#07162B] text-xs font-bold whitespace-nowrap"
                >
                  Schedule Visit
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B1F3A] text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-sm">
                  Want to inspect available plots in person?
                </div>
              </div>
              <Link
                to="/plots"
                className="px-4 py-2 rounded-lg bg-white text-[#0B1F3A] text-xs font-bold whitespace-nowrap"
              >
                Explore Plots
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Location Map */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                Interactive Map — Gwadar Old City, Gwadar, 91200, Pakistan
              </h2>
              <p className="text-xs text-slate-500">
                Project Name: Juddi Housing Scheme Pasni · Physical Location: Gwadar Old City, Gwadar, 91200, Pakistan
              </p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Gwadar+Old+City,+Gwadar,+91200,+Pakistan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Open in Google Maps &rarr;
            </a>
          </div>
          <div className="w-full h-80 bg-slate-100">
            <iframe
              title="Juddi Housing Scheme Pasni Map - Gwadar Old City, Gwadar, 91200, Pakistan"
              src="https://www.google.com/maps?q=Gwadar+Old+City,+Gwadar,+91200,+Pakistan&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export function MasterPlanPage() {
  const zones = [
    {
      name: 'Block A — Executive Coastal Zone',
      sizes: '35×65 ft – 50×90 ft Residential',
      roads: '60 ft & 80 ft Carpeted Roads',
      highlights: 'Adjacent to Main Entrance Gate and Central Park.',
    },
    {
      name: 'Block B — Family Residential Zone',
      sizes: '20×35 ft – 25×45 ft Residential',
      roads: '40 ft Internal Streets',
      highlights: 'Walkable access to Neighborhood Mosque & School.',
    },
    {
      name: 'Block C — Mixed-Use Coastal Avenue',
      sizes: '30×45 ft – 35×65 ft Mixed Use',
      roads: '60 ft – 80 ft Avenue',
      highlights: 'Zoned for retail ground floors and upper apartments.',
    },
    {
      name: 'Commercial Enclave',
      sizes: '30×30 ft – 30×60 ft Commercial',
      roads: '100 ft Main Commercial Boulevard',
      highlights: 'Prime business visibility in Gwadar Old City, Gwadar.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHero
        title="Colony Master Plan"
        subtitle="Thoughtfully zoned sectors balancing quiet family neighborhoods, central civic spaces, and high-visibility commercial boulevards."
      />
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="aspect-[16/9] bg-slate-100">
            <img
              src="/src/assets/images/gwadar_coastal_masterplan_1795861378571.jpg"
              alt="Juddi Housing Scheme Pasni Gwadar Coastal Master Plan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Full Sector Zoning Overview · Gwadar Old City, Gwadar, 91200, Pakistan</span>
            </div>
            <Link
              to="/plots"
              className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#112D54]"
            >
              Browse Plots by Block
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((z) => (
            <div
              key={z.name}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                  {z.name}
                </h2>
                <div className="text-xs font-medium text-amber-700 mt-1">
                  {z.sizes} · {z.roads}
                </div>
                <p className="text-sm text-slate-600 mt-3">{z.highlights}</p>
              </div>
              <div className="mt-5">
                <Link
                  to="/plots"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] hover:text-amber-600"
                >
                  <span>View Plots in Inventory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function BlocksPage() {
  const [plots, setPlots] = useState<Plot[]>([]);

  useEffect(() => {
    api
      .get('/plots', { params: { limit: 100 } })
      .then(({ data }) => setPlots(data.plots || []))
      .catch(() => setPlots([]));
  }, []);

  const blockDefs = [
    {
      name: 'Block A',
      subtitle: 'Executive 35×65 ft – 50×90 ft Residential Sector',
      desc: 'Wide avenues adjacent to the main gateway, central park, and Jamia Mosque.',
    },
    {
      name: 'Block B',
      subtitle: 'Family 20×35 ft – 25×45 ft Residential Sector',
      desc: 'Quiet residential streets close to neighborhood green belts and community school.',
    },
    {
      name: 'Block C',
      subtitle: 'Mixed-Use Coastal Avenue Sector (30×45 ft – 35×65 ft)',
      desc: 'Dual residential and retail-approved plots designed for modern coastal living.',
    },
    {
      name: 'Commercial Enclave',
      subtitle: '30×30 ft – 30×60 ft Commercial Boulevard',
      desc: 'Direct frontage on the 100-foot main commercial spine in Gwadar Old City, Gwadar.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHero
        title="Colony Sectors & Blocks"
        subtitle="Explore individual blocks and view real-time plot availability in each sector."
      />
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blockDefs.map((b) => {
            const matching = plots.filter((p) => p.block === b.name);
            const available = matching.filter((p) => p.status === 'Available').length;
            return (
              <div
                key={b.name}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-amber-500" />
                      <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                        {b.name}
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-700 tabular-nums">
                      {available} Available / {matching.length} Listed
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    {b.subtitle}
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/plots?block=${encodeURIComponent(b.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#112D54]"
                  >
                    <span>Explore {b.name} Plots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
