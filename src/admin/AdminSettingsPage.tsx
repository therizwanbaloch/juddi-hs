import { CheckCircle2, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getApiErrorMessage } from '../utils/format';

export default function AdminSettingsPage() {
  const { admin, systemInfo } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put('/admin/auth/password', {
        currentPassword,
        newPassword,
      });
      setSuccess(data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Admin Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your administrator account security and review active backend configuration.
        </p>
      </div>

      {/* Profile & Storage Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-[#0B1F3A]">
          Administrator Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-500">Account Name</div>
            <div className="font-semibold text-slate-900 mt-0.5">{admin?.name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Email Address</div>
            <div className="font-mono text-xs font-semibold text-slate-900 mt-1">
              {admin?.email}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Database Engine</div>
            <div className="font-medium text-slate-800 mt-0.5">
              {systemInfo?.databaseMode || 'Connected'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Media Storage</div>
            <div className="font-medium text-slate-800 mt-0.5">
              {systemInfo?.mediaMode || 'Configured'}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <h2 className="font-display text-base font-bold text-[#0B1F3A]">
            Change Password
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-sm font-bold transition-colors"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
