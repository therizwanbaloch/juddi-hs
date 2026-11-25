import { CheckCircle2, Clock, Mail, MapPin, Phone, UserCheck } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../services/api';
import { getApiErrorMessage } from '../utils/format';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Plot Booking & Site Visit');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentRef, setSentRef] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/contact', {
        name,
        phone,
        email,
        subject,
        message,
      });
      setSentRef(data.inquiryRef || 'RECEIVED');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send message.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="bg-[#0B1F3A] text-white py-12 border-b border-amber-400/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Contact Sales &amp; Allotment Office
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base">
            Reach our Gwadar Old City office for site visit bookings, plot availability verification, or investment consultations.
          </p>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0B1F3A] text-white rounded-2xl p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-amber-400">
                Direct Representatives
              </h2>

              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-300">Primary Contact Person</div>
                  <div className="font-display font-bold text-lg">Tariq Hameed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-300">Phone &amp; WhatsApp</div>
                  <a
                    href="tel:03215552244"
                    className="font-mono font-bold text-base tabular-nums hover:text-amber-400"
                  >
                    0321 5552244
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-300">Official Email</div>
                  <a
                    href="mailto:info@juddihousingscheme.pk"
                    className="text-sm hover:text-amber-400"
                  >
                    info@juddihousingscheme.pk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-300">Scheme Site Office</div>
                  <div className="text-sm text-slate-200">
                    Gwadar Old City, Gwadar, 91200, Pakistan
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-300">Office Hours</div>
                  <div className="text-sm text-slate-200">
                    Monday – Sunday: 9:00 AM to 6:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
              Send Us a Message
            </h2>
            <p className="text-sm text-slate-600 mt-1 mb-6">
              Fill out the inquiry form below and our sales team will reply promptly.
            </p>

            {sentRef ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg text-[#0B1F3A]">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Reference: <strong className="font-mono">{sentRef}</strong>. Our sales office will follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSentRef('')}
                  className="mt-4 px-5 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option>Plot Booking &amp; Site Visit</option>
                      <option>Residential Plot Information</option>
                      <option>Commercial Plot Investment</option>
                      <option>Documentation &amp; Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our sales team help you?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] font-display font-bold text-sm transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Location Map */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                Site Office Location Map
              </h2>
              <p className="text-xs text-slate-500">
                Juddi Housing Scheme Pasni · Gwadar Old City, Gwadar, 91200, Pakistan
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
          <div className="w-full h-72 bg-slate-100">
            <iframe
              title="Juddi Housing Scheme Pasni Location Map - Gwadar Old City, Gwadar, 91200, Pakistan"
              src="https://www.google.com/maps?q=Gwadar+Old+City,+Gwadar,+91200,+Pakistan&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
