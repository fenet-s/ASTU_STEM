import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { ticketService } from '../services/api';

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Internet', 'Dormitory', 'Lab Equipment', 'Classroom', 'Other'] as const;

export const SubmitTicketModal: React.FC<SubmitTicketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Internet',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be less than 5MB');
        return;
      }
      setImageFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await ticketService.submitTicket(data as any);
      setSubmitted(true);
      onSuccess();
      // Auto-close after 2s
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setError('');
      setImageFile(null);
      setImagePreview(null);
      setFormData({ title: '', description: '', category: 'Internet' });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList size={24} />
                <h2 className="text-xl font-bold">Submit Complaint</h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Success state */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Complaint Submitted!</h3>
                <p className="text-slate-500 text-sm">
                  Your complaint has been received. We'll review it and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                    placeholder="Brief summary of the issue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all resize-none text-sm"
                    placeholder="Provide more details about the problem..."
                  />
                </div>

                {/* Optional Image/File Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex justify-between">
                    <span>Attach File</span>
                    <span className="text-slate-400 font-normal">Optional</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-brand-blue/50 transition-all cursor-pointer text-center group">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <span className="text-sm text-slate-500 font-medium group-hover:text-brand-blue transition-colors">
                        Click to upload a file
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Image, PDF, Word (Max 5MB)</p>
                    </label>
                    {imageFile && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-slate-600 font-medium text-xs break-all text-center line-clamp-3 leading-snug">
                            {imageFile.name}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.title.trim() || !formData.description.trim()}
                    className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
