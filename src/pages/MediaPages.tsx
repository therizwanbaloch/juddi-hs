import { Calendar, Megaphone, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="bg-[#0B1F3A] text-white py-12 border-b border-amber-400/20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">{title}</h1>
        <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">{subtitle}</p>
      </div>
    </section>
  );
}

export function UpdatesPage() {
  const milestones = [
    {
      date: 'November 2026',
      phase: 'Phase I Infrastructure',
      title: 'Main Boulevard Carpeted Road & Street Lighting',
      details:
        'Asphalt paving along the 80-foot central corridor and installation of dual-arm solar LED street lights across Block A and Commercial Enclave.',
      image: '/src/assets/images/colony_boulevard_gate_1795441093203.jpg',
    },
    {
      date: 'October 2026',
      phase: 'Perimeter & Gateway',
      title: 'Grand Entrance Gateway & Security Checkpost',
      details:
        'Structural finishing completed on the main entrance arch in Gwadar Old City, Gwadar along with 24/7 security guardhouse and perimeter boundary wall.',
      image: '/src/assets/images/colony_masterplan_aerial_1795441093561.jpg',
    },
    {
      date: 'September 2026',
      phase: 'Land Survey & Utilities',
      title: 'Sector Pegging & Underground Utility Trenches',
      details:
        'On-ground plot demarcation completed in Blocks A, B, and C, with main water supply and sewerage trunk trenches laid along primary avenues.',
      image: '/src/assets/images/residential_villa_plot_1795441093419.jpg',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHero
        title="Development Updates"
        subtitle="Track civil engineering milestones, road paving, utility networks, and site readiness at Juddi Housing Scheme Pasni."
      />
      <section className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {milestones.map((m) => (
          <article
            key={m.title}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
          >
            <div className="md:col-span-5 aspect-[4/3] md:aspect-auto bg-slate-100">
              <img
                src={m.image}
                alt={m.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{m.date}</span>
                <span aria-hidden="true">·</span>
                <span>{m.phase}</span>
              </div>
              <h2 className="font-display text-xl font-bold text-[#0B1F3A] mt-2">
                {m.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                {m.details}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function GalleryPage() {
  const photos = [
    {
      src: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_9.51.01_PM_a42de632.jpeg',
      title: 'Juddi Housing Scheme Coastal Shoreline Emblem',
      category: 'Coastal Heritage',
    },
    {
      src: '/src/assets/images/colony_boulevard_gate_1795441093203.jpg',
      title: 'Main Entrance Gateway & Palm Boulevard',
      category: 'Infrastructure',
    },
    {
      src: '/src/assets/images/colony_masterplan_aerial_1795441093561.jpg',
      title: 'Coastal Aerial Master Plan Layout',
      category: 'Master Plan',
    },
    {
      src: '/src/assets/images/residential_villa_plot_1795441093419.jpg',
      title: 'Block A Modern Coastal Villa Sector',
      category: 'Residential',
    },
    {
      src: '/src/assets/images/commercial_plaza_plot_1795441093119.jpg',
      title: 'Main Boulevard Commercial Enclave',
      category: 'Commercial',
    },
    {
      src: '/src/assets/images/mixed_use_corner_plot_1795441093434.jpg',
      title: 'Mixed-Use Retail & Apartment Corner',
      category: 'Mixed Use',
    },
  ];

  const [selected, setSelected] = useState<(typeof photos)[0] | null>(null);

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        title="Photo Gallery"
        subtitle="Explore architectural views, coastal landmarks, and sector development visuals across Juddi Housing Scheme Pasni."
      />
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setSelected(photo)}
              className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-amber-600 font-semibold">
                  {photo.category}
                </div>
                <div className="font-display font-bold text-sm text-[#0B1F3A] mt-0.5">
                  {photo.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="font-display font-bold text-sm text-[#0B1F3A]">
                {selected.title}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close image preview"
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selected.src}
              alt={selected.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnouncementsPage() {
  const notices = [
    {
      date: 'November 18, 2026',
      ref: 'JHS-ANN-2026-11',
      title: 'Online Booking Requests Open for Residential Blocks A & B',
      body: 'Prospective homeowners may now browse live available plots (from 700 sq ft to 4,500 sq ft) and submit official booking inquiries directly through our portal. No advance online payment is required at inquiry stage.',
    },
    {
      date: 'November 05, 2026',
      ref: 'JHS-ANN-2026-10',
      title: 'Commercial Boulevard Frontage Inspection Schedule',
      body: 'Daily site visits for Commercial Enclave and Block C Mixed-Use corner plots are conducted between 9:00 AM and 6:00 PM with our allotment desk representative Tariq Hameed (0321 5552244).',
    },
    {
      date: 'October 22, 2026',
      ref: 'JHS-ANN-2026-09',
      title: 'Completion of Sector Pegging & Corner Plot Verification',
      body: 'Survey markers across all primary sectors have been verified. Allottees and visitors can inspect exact plot dimensions and road alignments on site.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHero
        title="News & Announcements"
        subtitle="Official public advisories, booking schedules, and community notices from Juddi Housing Scheme Pasni."
      />
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
        {notices.map((n) => (
          <article
            key={n.ref}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>{n.date}</span>
              <span aria-hidden="true">·</span>
              <span>{n.ref}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#0B1F3A] mt-2">
              {n.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{n.body}</p>
            <div className="mt-4">
              <Link
                to="/plots"
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Explore Eligible Plots &rarr;
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
