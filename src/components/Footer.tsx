import { ArrowRight, Mail, MapPin, Phone, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0B1F3A] text-white border-t border-amber-400/30">
      {/* Get in Touch Banner matching reference layout */}
      <div className="bg-[#07162B] border-b border-white/10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Get in Touch With Us
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Have questions about plot booking, site visits, or investment? Our team is here to help.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:justify-center">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Contact Person</div>
                  <div className="font-display font-bold text-amber-400 text-base">
                    Tariq Hameed
                  </div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-9 bg-white/15" />
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Direct Sales Desk</div>
                  <a
                    href="tel:03215552244"
                    className="font-mono tabular-nums font-semibold text-white hover:text-amber-400 transition-colors"
                  >
                    0321 5552244
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:justify-end items-start sm:items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <span>Send Us a Message</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:info@juddihousingscheme.pk"
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info@juddihousingscheme.pk</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-lg font-bold text-white">
              Juddi Housing Scheme Pasni
            </div>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              A modern, planned coastal residential and commercial community located in Gwadar Old City, Gwadar, 91200, Pakistan.
            </p>
            <div className="flex items-start gap-2 text-xs text-slate-300 mt-4">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Gwadar Old City, Gwadar, 91200, Pakistan</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-amber-400 mb-3">
              Explore Colony
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/plots" className="hover:text-white transition-colors">
                  Available Plots
                </Link>
              </li>
              <li>
                <Link to="/master-plan" className="hover:text-white transition-colors">
                  Master Plan
                </Link>
              </li>
              <li>
                <Link to="/blocks" className="hover:text-white transition-colors">
                  Sector &amp; Blocks
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-white transition-colors">
                  Facilities &amp; Amenities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-amber-400 mb-3">
              Information &amp; Media
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/location" className="hover:text-white transition-colors">
                  Location Advantages
                </Link>
              </li>
              <li>
                <Link to="/updates" className="hover:text-white transition-colors">
                  Development Updates
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors">
                  News &amp; Announcements
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Sales Desk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-amber-400 mb-3">
              Plot Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link
                  to="/plots?category=Residential"
                  className="hover:text-white transition-colors"
                >
                  Residential Plots
                </Link>
              </li>
              <li>
                <Link
                  to="/plots?category=Commercial"
                  className="hover:text-white transition-colors"
                >
                  Commercial Plots
                </Link>
              </li>
              <li>
                <Link
                  to="/plots?category=Mixed%20Use"
                  className="hover:text-white transition-colors"
                >
                  Mixed Use Plots
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom signature bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-editorial italic text-lg text-amber-400">
            Together for a Better Pasni
          </p>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Juddi Housing Scheme Pasni. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
