import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/format';

export default function AdminLoginPage() {
  const { admin, loading, needsSetup, login, setupFirstAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [admin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (needsSetup) {
      if (name.trim().length < 2) {
        setError('Please enter your full administrator name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (needsSetup) {
        await setupFirstAdmin(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          needsSetup ? 'Failed to create initial admin account.' : 'Invalid credentials.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07162B] flex items-center justify-center text-white text-sm">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07162B] flex flex-col justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Juddi Housing Scheme Website</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#0B1F3A] text-amber-400 flex items-center justify-center shrink-0">
              {needsSetup ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#0B1F3A]">
                {needsSetup ? 'Initial Admin Setup' : 'Admin Portal Login'}
              </h1>
              <p className="text-xs text-slate-500">
                Juddi Housing Scheme Pasni · Management Console
              </p>
            </div>
          </div>

          {needsSetup && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              No administrator account is registered yet. Create your primary administrator credentials below to lock and activate the dashboard.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {needsSetup && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Tariq Hameed"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@juddihousingscheme.pk"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {needsSetup && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              {submitting
                ? 'Please wait...'
                : needsSetup
                  ? 'Create Admin Account & Sign In'
                  : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
