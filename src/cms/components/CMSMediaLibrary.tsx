import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Search,
  Image as ImageIcon,
  FileText,
  Lock,
  Trash2,
  Check,
  Copy,
  AlertCircle,
  Eye,
  Tag,
  SlidersHorizontal,
  X,
  Plus,
  ShieldAlert,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  Filter,
} from 'lucide-react';
import { Language } from '../../types';
import { SectorId } from '../../types/firestore-schema';
import {
  MediaAssetDoc,
  getMediaAssets,
  uploadMediaAsset,
  deleteMediaAsset,
  APPROVED_FILE_TYPES,
} from '../../lib/cmsMediaLibrary';
import { BilingualFormField } from './BilingualFormField';

interface CMSMediaLibraryProps {
  language: Language;
  onSelectAsset?: (assetUrl: string, asset: MediaAssetDoc) => void;
  isPickerMode?: boolean;
  onClosePicker?: () => void;
}

const SECTORS: { id: SectorId; nameAr: string; nameEn: string; icon: any }[] = [
  { id: 'portal', nameAr: 'المجموعة القابضة', nameEn: 'Group Main Portal', icon: Building2 },
  { id: 'realestate', nameAr: 'قطاع العقارات', nameEn: 'Real Estate', icon: Home },
  { id: 'construction', nameAr: 'قطاع المقاولات', nameEn: 'Construction', icon: HardHat },
  { id: 'hvac', nameAr: 'قطاع التكييف', nameEn: 'HVAC Engineering', icon: ThermometerSnowflake },
];

export const CMSMediaLibrary: React.FC<CMSMediaLibraryProps> = ({
  language,
  onSelectAsset,
  isPickerMode = false,
  onClosePicker,
}) => {
  const isAr = language === 'ar';

  const [assets, setAssets] = useState<MediaAssetDoc[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [activeSector, setActiveSector] = useState<SectorId | 'all'>('all');
  const [showPrivate, setShowPrivate] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Status Message
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load assets
  const fetchAssets = async () => {
    setIsLoading(true);
    const list = await getMediaAssets({
      sector: activeSector === 'all' ? undefined : activeSector,
      isPrivate: showPrivate,
      searchQuery,
    });
    setAssets(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [activeSector, showPrivate, searchQuery]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setActionStatus(null);

    try {
      const newAsset = await uploadMediaAsset({
        file,
        sector: activeSector === 'all' ? 'portal' : activeSector,
        isPrivate: showPrivate,
        onProgress: (p) => setUploadProgress(p),
      });

      setAssets([newAsset, ...assets]);
      setSelectedAsset(newAsset);
      setActionStatus({ type: 'success', text: isAr ? 'تم رفع الملف بنجاح إلى Cloud Storage' : 'Asset uploaded successfully to Cloud Storage' });
    } catch (e: any) {
      setUploadError(e?.message || (isAr ? 'فشل رفع الملف' : 'Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!window.confirm(isAr ? 'هل أنت أصل من حذف هذا الملف نهائياً؟' : 'Are you sure you want to delete this asset?')) {
      return;
    }

    const result = await deleteMediaAsset(assetId);
    if (result.success) {
      setAssets(assets.filter((a) => a.id !== assetId));
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
      setActionStatus({ type: 'success', text: isAr ? 'تم حذف الملف نهائياً' : 'Asset deleted permanently' });
    } else {
      setActionStatus({ type: 'error', text: result.blockedReason || (isAr ? 'محظور الحذف' : 'Delete blocked') });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-6 ${isPickerMode ? 'p-2' : ''}`}>
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700 font-bold">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {isAr ? 'مكتبة الوسائط والأصول السحابية (Cloud Media Library)' : 'Cloud Media & Asset Library'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'إدارة الصور والملفات الفنية، تتبع الاستخدامات، وتصفية المرفقات العامة والخاصة'
                : 'Manage Cloud Storage assets, track usage references, and organize public/private media'}
            </p>
          </div>
        </div>

        {isPickerMode && onClosePicker && (
          <button
            onClick={onClosePicker}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Sector Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveSector('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSector === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isAr ? 'كافة القطاعات' : 'All Sectors'}
            </button>
            {SECTORS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSector(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSector === sec.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? sec.nameAr : sec.nameEn}
              </button>
            ))}
          </div>

          {/* Privacy Filter Toggle & Search Input */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                showPrivate ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>{showPrivate ? (isAr ? 'المرفقات الخاصة' : 'Private Attachments') : (isAr ? 'الأصول العامة' : 'Public Assets')}</span>
            </button>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، التاج، أو الوصف...' : 'Search filename or tags...'}
                className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center space-y-3 ${
          isDragging
            ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center font-bold">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {isAr ? 'اسحب واسقط الملف هنا أو اضغط للرفع' : 'Drag & drop media files or click to upload'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'الملفات المعتمدة: JPG, PNG, WebP, SVG, PDF, DOCX (حتى 15MB)' : 'Approved formats: JPG, PNG, WebP, SVG, PDF, DOCX (Max 15MB)'}
          </p>
        </div>

        {isUploading ? (
          <div className="max-w-xs mx-auto space-y-1.5 pt-2">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-sky-700 font-bold font-mono block">
              {isAr ? `جاري الرفع... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`}
            </span>
          </div>
        ) : (
          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs">
            <span>{isAr ? 'اختيار ملف من الجهاز' : 'Select File'}</span>
            <input
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,.docx"
            />
          </label>
        )}

        {uploadError && (
          <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </p>
        )}
      </div>

      {/* Main Asset Grid + Sidebar Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assets Grid */}
        <div className={selectedAsset ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">{isAr ? 'جاري تحميل مكتبة الوسائط...' : 'Loading media assets...'}</div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">{isAr ? 'لا توجد وسائط مطابقة للبحث' : 'No media assets found'}</p>
              <p>{isAr ? 'قم برفع أول ملف أو تغيير خيارات التصفية' : 'Upload your first file or clear filters'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const isImage = asset.contentType.startsWith('image/');

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      if (isPickerMode && onSelectAsset) {
                        onSelectAsset(asset.downloadUrl, asset);
                      }
                    }}
                    className={`group relative rounded-2xl border overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer ${
                      isSelected ? 'border-sky-500 ring-2 ring-sky-400/40' : 'border-slate-200'
                    }`}
                  >
                    {/* Thumbnail View */}
                    <div className="h-32 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {isImage ? (
                        <img
                          src={asset.downloadUrl}
                          alt={asset.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-slate-400" />
                      )}

                      {asset.isPrivate && (
                        <span className="absolute top-2 left-2 p-1 rounded-md bg-amber-500/90 text-white shadow-xs">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5 space-y-1 text-start">
                      <span className="font-bold text-xs text-slate-900 truncate block">
                        {asset.fileName}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{formatFileSize(asset.fileSizeBytes)}</span>
                        {asset.dimensions && <span>{asset.dimensions.width}x{asset.dimensions.height}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Asset Sidebar Drawer */}
        {selectedAsset && (
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs sticky top-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 font-mono">
                {isAr ? 'تفاصيل وإعدادات الملف' : 'ASSET DETAILS'}
              </h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl overflow-hidden bg-slate-100 h-40 flex items-center justify-center border border-slate-200 relative">
              {selectedAsset.contentType.startsWith('image/') ? (
                <img
                  src={selectedAsset.downloadUrl}
                  alt={selectedAsset.fileName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <FileText className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 text-xs font-mono border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 block truncate">{selectedAsset.fileName}</span>
              <span className="text-slate-500 block">{selectedAsset.contentType} • {formatFileSize(selectedAsset.fileSizeBytes)}</span>
            </div>

            {/* Bilingual Alt Text */}
            <BilingualFormField
              label={isAr ? 'النص البديل (Alt Text)' : 'Alt Text'}
              value={selectedAsset.altText}
              onChange={(val) => setSelectedAsset({ ...selectedAsset, altText: val })}
              language={language}
            />

            {/* Copy Download URL & Delete Action */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedAsset.downloadUrl);
                  setActionStatus({ type: 'success', text: isAr ? 'تم نسخ الرابط بالحافظة' : 'URL copied to clipboard' });
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ رابط الملف' : 'Copy Direct URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedAsset.id)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'حذف الملف نهائياً' : 'Delete Asset'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
