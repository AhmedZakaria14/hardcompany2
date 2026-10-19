import React, { useState, useEffect } from 'react';
import { FaqEntity, SectorScope, PublicationStatus } from '../../types/businessEntities';
import { Language } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BilingualFormField } from '../components/BilingualFormField';
import { HelpCircle } from 'lucide-react';

interface CMSFaqFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FaqEntity>) => Promise<void>;
  initialData?: FaqEntity | null;
  language: Language;
}

export const CMSFaqFormModal: React.FC<CMSFaqFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const isAr = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [question, setQuestion] = useState({ en: '', ar: '' });
  const [answer, setAnswer] = useState({ en: '', ar: '' });
  const [category, setCategory] = useState({ en: 'General', ar: 'عام' });
  const [sector, setSector] = useState<SectorScope>('realestate');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || { en: '', ar: '' });
      setAnswer(initialData.answer || { en: '', ar: '' });
      setCategory(initialData.category || { en: 'General', ar: 'عام' });
      setSector(initialData.sector || 'realestate');
      setOrder(initialData.order || 1);
      setStatus(initialData.status || 'published');
    } else {
      setQuestion({ en: '', ar: '' });
      setAnswer({ en: '', ar: '' });
      setCategory({ en: 'General', ar: 'عام' });
      setSector('realestate');
      setOrder(1);
      setStatus('published');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        question,
        answer,
        category,
        sector,
        order: Number(order) || 1,
        status,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? isAr ? 'تعديل السؤال الشائع' : 'Edit FAQ Item'
          : isAr ? 'إضافة سؤال شائع جديد' : 'Add New FAQ Item'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <BilingualFormField
            labelEn="Question"
            labelAr="السؤال"
            value={question}
            onChange={setQuestion}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Detailed Answer"
            labelAr="الإجابة التفصيلية"
            value={answer}
            onChange={setAnswer}
            type="textarea"
            rows={3}
            required
            language={language}
          />

          <BilingualFormField
            labelEn="Category Label"
            labelAr="تصنيف السؤال"
            value={category}
            onChange={setCategory}
            language={language}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'القطاع المخصص' : 'Assigned Sector'}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorScope)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="realestate">{isAr ? 'العقارات والوساطة' : 'Real Estate'}</option>
              <option value="construction">{isAr ? 'المقاولات والهندسة' : 'Construction'}</option>
              <option value="hvac">{isAr ? 'أنظمة التكييف' : 'HVAC Division'}</option>
              <option value="group">{isAr ? 'إدارة المجموعة' : 'Group Holding'}</option>
              <option value="all">{isAr ? 'كافة القطاعات' : 'All Sectors'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'ترتيب العرض' : 'Display Order'}
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
              min={1}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAr ? 'حالة النشر' : 'Publication Status'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="published">{isAr ? 'منشور (Published)' : 'Published'}</option>
              <option value="draft">{isAr ? 'مسودة (Draft)' : 'Draft'}</option>
              <option value="archived">{isAr ? 'مؤرشف (Archived)' : 'Archived'}</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
          >
            {isSubmitting
              ? (isAr ? 'جاري الحفظ...' : 'Saving...')
              : (isAr ? 'حفظ السؤال' : 'Save FAQ')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
