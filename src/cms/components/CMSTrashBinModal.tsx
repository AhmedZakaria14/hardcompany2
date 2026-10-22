/**
 * HARD GROUP - CMS TRASH BIN, ARCHIVAL & RECOVERY MANAGEMENT MODAL
 * 
 * Provides an authorized workflow to view soft-deleted content, inspect pre-deletion
 * reference warnings, restore items as CMS drafts, or execute deliberate permanent deletion.
 */

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  ShieldCheck,
  X,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  FileText,
  Building,
  Key,
  Layers,
  Image as ImageIcon,
  FolderTree,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import { PublisherUser } from '../../lib/cms/publicationTypes';
import { TrashItem, TrashEntityType } from '../../lib/cms/archivalTypes';
import {
  fetchTrashBinItems,
  restoreFromTrash,
  permanentlyDeleteFromTrash,
  purgeExpiredTrash,
} from '../../lib/cms/archivalService';

interface CMSTrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: PublisherUser;
  onRestoreSuccess?: (restoredItem: TrashItem) => void;
}

export const CMSTrashBinModal: React.FC<CMSTrashBinModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onRestoreSuccess,
}) => {
  const isAr = language === 'ar';

  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Permanent Delete Confirmation Modal state
  const [itemToPermanentDelete, setItemToPermanentDelete] = useState<TrashItem | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTrashBin();
    } else {
      setActionMessage(null);
      setItemToPermanentDelete(null);
      setConfirmText('');
    }
  }, [isOpen]);

  const loadTrashBin = async () => {
    setIsLoading(true);
    try {
      const items = await fetchTrashBinItems();
      setTrashItems(items);
    } catch (err) {
      console.error('[CMSTrashBinModal] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item: TrashItem) => {
    setIsRestoringId(item.id);
    setActionMessage(null);

    try {
      await restoreFromTrash(item.id, currentUser.email);
      const titleStr = getLocalizedText(item.title, isAr ? 'ar' : 'en') || 'Item';
      
      const msg = isAr
        ? `تم استرجاع "${titleStr}" بنجاح إلى مسودات إدارة المحتوى (Drafts).`
        : `Successfully restored "${titleStr}" back to CMS drafts.`;

      setActionMessage({ type: 'success', text: msg });

      if (onRestoreSuccess) {
        onRestoreSuccess(item);
      }

      await loadTrashBin();
    } catch (err: any) {
      console.error('[CMSTrashBinModal] Restore error:', err);
      setActionMessage({
        type: 'error',
        text: isAr ? 'فشل استرجاع العنصر. يرجى المحاولة لاحقاً.' : 'Failed to restore item. Please try again.',
      });
    } finally {
      setIsRestoringId(null);
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!itemToPermanentDelete) return;

    if (confirmText.trim().toUpperCase() !== 'PERMANENT DELETE') {
      setActionMessage({
        type: 'error',
        text: isAr
          ? 'يرجى كتابة "PERMANENT DELETE" بالإنجليزية لتأكيد الحذف النهائي.'
          : 'Please type "PERMANENT DELETE" to confirm permanent removal.',
      });
      return;
    }

    setIsDeleting(true);
    setActionMessage(null);

    try {
      await permanentlyDeleteFromTrash(itemToPermanentDelete.id, currentUser);
      
      const titleStr = getLocalizedText(itemToPermanentDelete.title, isAr ? 'ar' : 'en') || 'Item';

      setActionMessage({
        type: 'success',
        text: isAr
          ? `تم حذف "${titleStr}" نهائياً. تبقى جميع سجلات العملاء والاستفسارات محفوظة بشكل دائم.`
          : `Permanently deleted "${titleStr}". All customer leads remain safely preserved.`,
      });

      setItemToPermanentDelete(null);
      setConfirmText('');
      await loadTrashBin();
    } catch (err: any) {
      console.error('[CMSTrashBinModal] Permanent delete error:', err);
      setActionMessage({
        type: 'error',
        text: err.message || (isAr ? 'فشل الحذف النهائي. تأكد من صلاحيات المشرف الأكبر.' : 'Failed permanent deletion.'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePurgeExpired = async () => {
    if (!window.confirm(isAr ? 'هل أنت أصلح لتنظيف وحذف جميع العناصر المنتهية صلاحيتها تلقائياً؟' : 'Purge all expired items past retention date?')) {
      return;
    }

    setIsLoading(true);
    try {
      const purgedCount = await purgeExpiredTrash();
      setActionMessage({
        type: 'success',
        text: isAr
          ? `تم تنظيف وحذف ${purgedCount} عنصر منتهي الصلاحية نهائياً.`
          : `Successfully purged ${purgedCount} expired trash items.`,
      });
      await loadTrashBin();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء تنظيف سلة المهملات.' : 'Error purging expired trash.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = trashItems.filter((item) => {
    if (selectedCategory !== 'all' && item.entityType !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleStr = `${getLocalizedText(item.title, 'ar')} ${getLocalizedText(item.title, 'en')}`;
      return (
        titleStr.toLowerCase().includes(q) ||
        item.entityId.toLowerCase().includes(q) ||
        item.deletedBy.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getEntityIcon = (type: TrashEntityType) => {
    switch (type) {
      case 'property':
        return <Key className="w-4 h-4 text-emerald-400" />;
      case 'project':
        return <Building className="w-4 h-4 text-sky-400" />;
      case 'page_document':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'category':
        return <FolderTree className="w-4 h-4 text-amber-400" />;
      case 'asset':
        return <ImageIcon className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRemainingDays = (expiresIso: string) => {
    const diff = new Date(expiresIso).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                <span>{isAr ? 'سلة المهملات والأرشيف المسترجع' : 'CMS Trash & Recovery Center'}</span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {trashItems.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'استرجاع العناصر المحذوفة كمسودات قابلة للتعديل دون الإضرار بسجلات العملاء'
                  : 'Recover deleted content back to CMS drafts with customer lead preservation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePurgeExpired}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنظيف المنتهي' : 'Purge Expired'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div
            className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All Types' },
              { id: 'property', labelAr: 'عقارات', labelEn: 'Properties' },
              { id: 'project', labelAr: 'مشاريع', labelEn: 'Projects' },
              { id: 'page_document', labelAr: 'صفحات', labelEn: 'Pages' },
              { id: 'category', labelAr: 'تصنيفات', labelEn: 'Categories' },
              { id: 'asset', labelAr: 'وسائط', labelEn: 'Assets' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في سلة المهملات...' : 'Search trash items...'}
              className="w-full bg-slate-950 text-xs text-white pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl border border-slate-800 focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Trash Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <span className="text-sm">{isAr ? 'جاري تحميل عناصر سلة المهملات...' : 'Loading trash items...'}</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-800/30 border border-slate-800 space-y-3">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
              <p className="text-sm text-slate-400 font-bold">
                {isAr ? 'سلة المهملات فارغة حالياً.' : 'Trash bin is currently empty.'}
              </p>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'العناصر المحذوفة من إدارة المحتوى ستظهر هنا مع إمكانية استرجاعها خلال 30 يوماً.'
                  : 'Soft-deleted content will appear here with 30-day recoverable window.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const remainingDays = getRemainingDays(item.retentionExpiresAt);
              const isExpired = remainingDays <= 0;
              const titleText = getLocalizedText(item.title, isAr ? 'ar' : 'en') || 'Item';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {getEntityIcon(item.entityType)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{titleText}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-900 text-slate-300 border border-slate-800 uppercase">
                          {item.entityType}
                        </span>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                            isExpired
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {isExpired
                            ? isAr
                              ? 'منتهي الصلاحية'
                              : 'Expired'
                            : isAr
                            ? `ينتهي بعد ${remainingDays} يوم`
                            : `Expires in ${remainingDays}d`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.deletedBy}</span>
                        </span>

                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(item.deletedAt).toLocaleDateString()}</span>
                        </span>

                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isAr ? 'سجلات العملاء محفوظة' : 'Customer Leads Safe'}</span>
                        </span>
                      </div>

                      {item.referenceWarningsOnDelete && item.referenceWarningsOnDelete.length > 0 && (
                        <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.referenceWarningsOnDelete[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={isRestoringId === item.id}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRestoringId === item.id ? 'animate-spin' : ''}`} />
                      <span>{isAr ? 'استرجاع كمسودة' : 'Restore Draft'}</span>
                    </button>

                    <button
                      onClick={() => setItemToPermanentDelete(item)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حذف نهائي' : 'Permanent Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Permanent Deletion Confirmation Modal Sub-overlay */}
        {itemToPermanentDelete && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? 'تأكيد الحذف النهائي القاطع' : 'Permanent Deletion Confirmation'}
                  </h3>
                  <p className="text-xs text-rose-400">
                    {isAr ? 'يتطلب صلاحيات المشرف الأكبر (Super Admin)' : 'Requires Super Admin Permission'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح بيانات هذا العنصر كلياً من سلة المهملات. ملاحظة: جميع سجلات العملاء والاستفسارات المرتبطة ستظل محفوظة بشكل آمن.'
                  : 'This action is irreversible and permanently purges this entity. Note: Linked customer inquiry records remain permanently preserved.'}
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'اكتب عبارة التأكيد:' : 'Type to confirm:'}</span>
                <span className="text-xs font-mono font-bold text-amber-400">PERMANENT DELETE</span>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="PERMANENT DELETE"
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 font-mono mt-1 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setItemToPermanentDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  onClick={handlePermanentDeleteConfirm}
                  disabled={isDeleting || confirmText.trim().toUpperCase() !== 'PERMANENT DELETE'}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? (isAr ? 'جاري الحذف...' : 'Purging...') : isAr ? 'حذف نهائي الآن' : 'Purge Permanently'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
