import { Edit3, ImagePlus, Search, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Plot, PlotCategory, PlotImage, PlotStatus } from '../types';
import { formatPKR, getApiErrorMessage } from '../utils/format';

export default function AdminManagePlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [blockFilter, setBlockFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [facets, setFacets] = useState<{ blocks: string[] }>({ blocks: [] });

  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [deletingPlot, setDeletingPlot] = useState<Plot | null>(null);
  const [feedback, setFeedback] = useState('');

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editLengthFt, setEditLengthFt] = useState('');
  const [editWidthFt, setEditWidthFt] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editCategory, setEditCategory] = useState<PlotCategory>('Residential');
  const [editPrice, setEditPrice] = useState('');
  const [editFacing, setEditFacing] = useState('');
  const [editStatus, setEditStatus] = useState<PlotStatus>('Available');
  const [editDescription, setEditDescription] = useState('');
  const [retainedImages, setRetainedImages] = useState<PlotImage[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/plots', {
        params: {
          search: search.trim() || undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          block: blockFilter !== 'All' ? blockFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          limit: 100,
        },
      });
      setPlots(data.plots || []);
      if (data.facets) setFacets(data.facets);
    } catch {
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, blockFilter, statusFilter]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  const openEditModal = (plot: Plot) => {
    setEditingPlot(plot);
    setEditTitle(plot.title);
    setEditNumber(plot.plotNumber);
    setEditLengthFt(String(plot.lengthFt || 30));
    setEditWidthFt(String(plot.widthFt || 50));
    setEditBlock(plot.block);
    setEditCategory(plot.category);
    setEditPrice(String(plot.price));
    setEditFacing(plot.facing || '');
    setEditStatus(plot.status);
    setEditDescription(plot.description);
    setRetainedImages(plot.images || []);
    setNewFiles([]);
    setEditError('');
  };

  const handleQuickStatusChange = async (plotId: string, nextStatus: PlotStatus) => {
    try {
      await api.put(`/admin/plots/${plotId}`, { status: nextStatus });
      setFeedback(`Updated plot status to ${nextStatus}.`);
      fetchPlots();
    } catch (err) {
      setFeedback(getApiErrorMessage(err, 'Failed to update status.'));
    }
  };

  const parsedEditLength = Number(editLengthFt);
  const parsedEditWidth = Number(editWidthFt);
  const parsedEditPrice = Number(editPrice);
  const previewEditArea =
    Number.isFinite(parsedEditLength) &&
    parsedEditLength > 0 &&
    Number.isFinite(parsedEditWidth) &&
    parsedEditWidth > 0
      ? Number((parsedEditLength * parsedEditWidth).toFixed(2))
      : 0;
  const previewEditRate =
    previewEditArea > 0 && Number.isFinite(parsedEditPrice) && parsedEditPrice > 0
      ? Number((parsedEditPrice / previewEditArea).toFixed(2))
      : 0;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlot) return;
    setEditError('');

    if (!Number.isFinite(parsedEditLength) || parsedEditLength <= 0) {
      setEditError('Please enter a valid positive length in feet.');
      return;
    }
    if (!Number.isFinite(parsedEditWidth) || parsedEditWidth <= 0) {
      setEditError('Please enter a valid positive width in feet.');
      return;
    }
    if (!Number.isFinite(parsedEditPrice) || parsedEditPrice <= 0) {
      setEditError('Please enter a valid positive plot price.');
      return;
    }

    setSavingEdit(true);

    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('plotNumber', editNumber.trim().toUpperCase());
      formData.append('lengthFt', String(parsedEditLength));
      formData.append('widthFt', String(parsedEditWidth));
      formData.append('block', editBlock.trim());
      formData.append('category', editCategory);
      formData.append('price', String(parsedEditPrice));
      formData.append('facing', editFacing.trim());
      formData.append('status', editStatus);
      formData.append('description', editDescription.trim());
      formData.append('retainedImages', JSON.stringify(retainedImages));
      newFiles.forEach((f) => formData.append('images', f.file));

      await api.put(`/admin/plots/${editingPlot._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setEditingPlot(null);
      setFeedback(`Plot ${editNumber.toUpperCase()} updated successfully.`);
      fetchPlots();
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Failed to update plot.'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlot) return;
    try {
      await api.delete(`/admin/plots/${deletingPlot._id}`);
      setFeedback(`Plot ${deletingPlot.plotNumber} deleted.`);
      setDeletingPlot(null);
      fetchPlots();
    } catch (err) {
      setFeedback(getApiErrorMessage(err, 'Failed to delete plot.'));
      setDeletingPlot(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
            Manage Plots
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit prices, replace plot images, update availability status, or remove listings.
          </p>
        </div>
        <Link
          to="/admin/add-plot"
          className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#07162B] font-bold text-xs whitespace-nowrap self-start"
        >
          + Add New Plot
        </Link>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="text-slate-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plot # or title..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
        >
          <option value="All">All Categories</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Mixed Use">Mixed Use</option>
        </select>

        <select
          aria-label="Filter by block"
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
        >
          <option value="All">All Blocks</option>
          {facets.blocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {/* Plots Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading inventory...
          </div>
        ) : plots.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No plots match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-3 px-4 font-semibold">Plot #</th>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Dimensions · Area</th>
                  <th className="py-3 px-4 font-semibold">Block</th>
                  <th className="py-3 px-4 font-semibold text-right">Price &amp; Rate</th>
                  <th className="py-3 px-4 font-semibold">Availability</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plots.map((plot) => (
                  <tr key={plot._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#0B1F3A] tabular-nums">
                      {plot.plotNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{plot.title}</div>
                      <div className="text-xs text-slate-500">{plot.category}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                      <div className="font-semibold text-slate-800">
                        {plot.areaSqFt.toLocaleString()} sq ft
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {plot.lengthFt} &times; {plot.widthFt} ft
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{plot.block}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-[#0B1F3A]">
                        {formatPKR(plot.price)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatPKR(Math.round(plot.pricePerSqFt))}/sq ft
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        aria-label={`Change status for plot ${plot.plotNumber}`}
                        value={plot.status}
                        onChange={(e) =>
                          handleQuickStatusChange(plot._id, e.target.value as PlotStatus)
                        }
                        className={`text-xs font-semibold rounded-md px-2 py-1 border ${
                          plot.status === 'Sold'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : plot.status === 'Reserved'
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(plot)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-[#0B1F3A] hover:bg-slate-100 mr-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPlot(plot)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Plot Modal */}
      {editingPlot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07162B]/70"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                Edit Plot · {editingPlot.plotNumber}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPlot(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plot Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plot Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as PlotCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed Use">Mixed Use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={editLengthFt}
                    onChange={(e) => setEditLengthFt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={editWidthFt}
                    onChange={(e) => setEditWidthFt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Block
                  </label>
                  <input
                    type="text"
                    required
                    value={editBlock}
                    onChange={(e) => setEditBlock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Price (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PlotStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facing / Orientation
                  </label>
                  <input
                    type="text"
                    value={editFacing}
                    onChange={(e) => setEditFacing(e.target.value)}
                    placeholder="e.g., Corner · Park Facing"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Calculated Area: </span>
                  <strong className="font-mono text-[#0B1F3A] tabular-nums">
                    {previewEditArea > 0 ? `${previewEditArea.toLocaleString()} sq ft` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Calculated Rate: </span>
                  <strong className="font-mono text-amber-700 tabular-nums">
                    {previewEditRate > 0 ? `${formatPKR(Math.round(previewEditRate))}/sq ft` : '—'}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              {/* Manage Existing & Replacement Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Plot Images
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 cursor-pointer hover:text-amber-800">
                    <ImagePlus className="w-4 h-4" />
                    <span>Add / Replace Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewFiles((prev) => [
                          ...prev,
                          ...files.map((file) => ({
                            file,
                            preview: URL.createObjectURL(file),
                          })),
                        ]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {retainedImages.map((img) => (
                    <div
                      key={img.publicId}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200"
                    >
                      <img
                        src={img.url}
                        alt="Plot"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRetainedImages((prev) =>
                            prev.filter((i) => i.publicId !== img.publicId)
                          )
                        }
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {newFiles.map((item, idx) => (
                    <div
                      key={item.preview}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-amber-400"
                    >
                      <img
                        src={item.preview}
                        alt="New upload"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlot(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-bold"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07162B]/70"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              Delete Plot {deletingPlot.plotNumber}?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              This will permanently remove <strong>{deletingPlot.title}</strong> and its uploaded images from the inventory.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPlot(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Delete Plot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
