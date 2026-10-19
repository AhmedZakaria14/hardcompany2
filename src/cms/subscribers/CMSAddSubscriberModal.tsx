import React, { useState } from 'react';
import { X, MailCheck, Save, Mail, FileText, Globe } from 'lucide-react';
import { Language } from '../../types';

interface CMSAddSubscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (email: string, source: string, notes: string) => void;
  language: Language;
}

export const CMSAddSubscriberModal: React.FC<CMSAddSubscriberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  language,
}) => {
  const isAr = language === 'ar';
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Manual CMS Entry');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(isAr ? 'يرجى إدخال عنوان بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    onSave(cleanEmail, source.trim(), notes.trim());
    setEmail('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <MailCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display-serif">
                {isAr ? 'إضافة مشترك جديد للقائمة' : 'Add New Subscriber to Join List'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'تسجيل بريد إلكتروني جديد في قاعدة بيانات النشرات البريدية'
                  : 'Register a new email into the marketing and investment announcement list'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'البريد الإلكتروني *' : 'Email Address *'}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="e.g. investor@domain.com"
              className={`w-full px-3 py-2.5 bg-slate-50 border ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 hover:border-slate-400'
              } rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
            />
            {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'مصدر التسجيل' : 'Registration Source'}</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="Manual CMS Entry">{isAr ? 'إدخال يدوي من الإدارة (CMS)' : 'Manual CMS Entry'}</option>
              <option value="Website Footer">{isAr ? 'تذييل الموقع (Footer Form)' : 'Website Footer'}</option>
              <option value="VIP Investor Event">{isAr ? 'معرض أو لقاء مستثمرين' : 'VIP Investor Event'}</option>
              <option value="Phone / WhatsApp Inquiry">{isAr ? 'استفسار هاتفي أو واتساب' : 'Phone / WhatsApp Inquiry'}</option>
              <option value="Cityscape Global">{isAr ? 'معرض سيتي سكيب' : 'Cityscape Global'}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'ملاحظات وتفضيلات الاستثمار (اختياري)' : 'Notes & Investment Interests (Optional)'}</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isAr
                  ? 'مثال: مهتم بمشاريع الخبر تحت الإنشاء والمحافظ السكنية...'
                  : 'e.g. Interested in off-plan luxury villas and commercial yields in Al Khobar...'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ المشترك' : 'Add Subscriber'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
