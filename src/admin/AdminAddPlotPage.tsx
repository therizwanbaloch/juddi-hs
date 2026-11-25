import { Calculator, CheckCircle2, ImagePlus, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PlotCategory, PlotStatus } from '../types';
import { formatPKR, getApiErrorMessage } from '../utils/format';

interface SelectedFilePreview {
  file: File;
  previewUrl: string;
}

const PRESET_BLOCKS = ['Block A', 'Block B', 'Block C', 'Commercial Enclave'];

export default function AdminAddPlotPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [lengthFt, setLengthFt] = useState('35');
  const [widthFt, setWidthFt] = useState('65');
  const [block, setBlock] = useState('Block A');
  const [category, setCategory] = useState<PlotCategory>('Residential');
  const [price, setPrice] = useState('');
  const [facing, setFacing] = useState('');
  const [status, setStatus] = useState<PlotStatus>('Available');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Carpeted Road Access',
    'Clean Water Supply',
    '24/7 Gated Security',
  ]);
  const [selectedImages, setSelectedImages] = useState<SelectedFilePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const numericLength = Number(lengthFt);
  const numericWidth = Number(widthFt);
  const numericPrice = Number(price);
  const computedAreaSqFt =
    Number.isFinite(numericLength) &&
    numericLength > 0 &&
    Number.isFinite(numericWidth) &&
    numericWidth > 0
      ? Number((numericLength * numericWidth).toFixed(2))
      : 0;
  const computedPricePerSqFt =
    computedAreaSqFt > 0 && Number.isFinite(numericPrice) && numericPrice > 0
      ? Number((numericPrice / computedAreaSqFt).toFixed(2))
      : 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = Math.max(0, 8 - selectedImages.length);
    const additions = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...additions]);
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setSelectedImages((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val || features.includes(val)) return;
    setFeatures((prev) => [...prev, val]);
    setFeatureInput('');
  };

  const removeFeature = (feat: string) => {
    setFeatures((prev) => prev.filter((f) => f !== feat));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!Number.isFinite(numericLength) || numericLength <= 0) {
      setError('Please enter a valid positive plot length in feet.');
      return;
    }
    if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
      setError('Please enter a valid positive plot width in feet.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid positive price in PKR.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('plotNumber', plotNumber.trim().toUpperCase());
      formData.append('lengthFt', String(numericLength));
      formData.append('widthFt', String(numericWidth));
      formData.append('block', block.trim());
      formData.append('category', category);
      formData.append('price', String(numericPrice));
      formData.append('facing', facing.trim());
      formData.append('status', status);
      formData.append('description', description.trim());
      formData.append('features', JSON.stringify(features));

      selectedImages.forEach((item) => {
        formData.append('images', item.file);
      });

      await api.post('/admin/plots', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setSuccessMsg('Plot added successfully and published to the public website.');
      setTitle('');
      setPlotNumber('');
      setPrice('');
      setFacing('');
      setDescription('');
      setSelectedImages([]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add plot.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Add New Plot
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter plot dimensions in feet and total price — total area (sq ft) and rate per sq ft are calculated automatically.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/manage-plots')}
            className="text-xs font-bold underline underline-offset-4"
          >
            Go to Manage Plots &rarr;
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Coastal Breeze 2,275 sq ft Park Facing Plot"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              placeholder="e.g., A-115"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Category <span className="text-red-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlotCategory)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed Use">Mixed Use</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Length (ft) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={lengthFt}
              onChange={(e) => setLengthFt(e.target.value)}
              placeholder="e.g., 35"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plot Width (ft) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={widthFt}
              onChange={(e) => setWidthFt(e.target.value)}
              placeholder="e.g., 65"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Block Name <span className="text-red-600">*</span>
            </label>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {PRESET_BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Plot Price (PKR) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 4500000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlotStatus)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Orientation / Facing (Optional)
            </label>
            <input
              type="text"
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              placeholder="e.g., Corner · Park Facing"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Auto-calculated Dimensions & Price Preview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5">
            <Calculator className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">Dimensions</div>
              <div className="font-mono text-sm font-bold text-[#0B1F3A] tabular-nums">
                {numericLength > 0 && numericWidth > 0
                  ? `${numericLength} × ${numericWidth} ft`
                  : '—'}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Total Area (Length &times; Width)</div>
            <div className="font-mono text-sm font-bold text-[#0B1F3A] tabular-nums">
              {computedAreaSqFt > 0
                ? `${computedAreaSqFt.toLocaleString('en-US')} sq ft`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Price per sq ft (Total &divide; Area)</div>
            <div className="font-mono text-sm font-bold text-amber-700 tabular-nums">
              {computedPricePerSqFt > 0
                ? `${formatPKR(Math.round(computedPricePerSqFt))} / sq ft`
                : 'Enter total price'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Plot Description <span className="text-red-600">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe road width, nearby amenities, corner advantages, and investment highlights..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Features */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Plot Features &amp; Utilities
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Add feature (e.g., Underground Electricity)"
              className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-800"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feat)}
                  aria-label={`Remove ${feat}`}
                  className="text-slate-500 hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Multi-image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Plot Images (Up to 8 images · JPEG, PNG, WEBP · Max 5MB each)
          </label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-6 cursor-pointer bg-slate-50/70 transition-colors">
            <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-semibold text-[#0B1F3A]">
              Click to select multiple plot images
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Images upload via Cloudinary (or secure local storage when unconfigured)
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {selectedImages.map((item, idx) => (
                <div
                  key={item.previewUrl}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <img
                    src={item.previewUrl}
                    alt={`Selected preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin/manage-plots')}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {submitting ? 'Uploading & Saving Plot...' : 'Publish Plot'}
          </button>
        </div>
      </form>
    </div>
  );
}
