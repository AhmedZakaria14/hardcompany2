import React, { useState, useRef } from 'react';
import { Upload, Link2, X, Image as ImageIcon, Check, Trash2, Plus, Sparkles, FolderOpen } from 'lucide-react';
import { Language } from '../../types';
import { uploadCmsFile } from '../../lib/firebaseService';
import { CMSMediaLibrary } from './CMSMediaLibrary';

interface SingleImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  label?: string;
  description?: string;
  placeholder?: string;
  aspectRatio?: 'video' | 'square' | 'avatar' | 'wide';
  presets?: { label: string; url: string }[];
  required?: boolean;
}

export const CMSImageUpload: React.FC<SingleImageUploadProps> = ({
  value,
  onChange,
  language,
  label,
  description,
  placeholder = 'https://images.unsplash.com/...',
  aspectRatio = 'video',
  presets,
  required = false,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && value.startsWith('http') ? value : '');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(isAr ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)' : 'Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 10MB)' : 'File size exceeds 10MB limit');
      return;
    }

    setError(null);
    setFileName(file.name);

    try {
      const downloadUrl = await uploadCmsFile(file, 'property_cms');
      onChange(downloadUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setError(null);
      setFileName(null);
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[200px]';
      case 'avatar':
        return 'w-24 h-24 rounded-full';
      case 'wide':
        return 'aspect-21/9 max-w-xl';
      case 'video':
      default:
        return 'aspect-video max-w-md';
    }
  };

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 text-start flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
          {description && (
            <span className="text-[11px] text-slate-400">{description}</span>
          )}
        </div>
      )}

      {/* Tabs for Upload vs URL vs Media Library */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isAr ? 'رفع من الجهاز' : 'Upload from Device'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'رابط ويب (URL)' : 'Web URL'}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsMediaLibraryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>{isAr ? 'مكتبة الوسائط' : 'Media Library'}</span>
        </button>
      </div>

      {/* Media Library Picker Modal */}
      {isMediaLibraryOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <CMSMediaLibrary
              language={language}
              isPickerMode
              onClosePicker={() => setIsMediaLibraryOpen(false)}
              onSelectAsset={(url) => {
                onChange(url);
                setIsMediaLibraryOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Tab 1: Upload from Computer */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                {isAr
                  ? 'انقر لاختيار صورة من جهازك أو اسحبها هنا'
                  : 'Click to select from your computer or drag & drop'}
              </p>
              <p className="text-[10px] text-slate-500">
                {isAr
                  ? 'يدعم صيغ PNG, JPG, JPEG, WebP, SVG (حتى 10 ميجابايت)'
                  : 'Supports PNG, JPG, JPEG, WebP, SVG (up to 10MB)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Web URL */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-start dir-ltr"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isAr ? 'تطبيق' : 'Apply'}</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 font-medium animate-in fade-in text-start">
          {error}
        </p>
      )}

      {/* Presets if provided */}
      {presets && presets.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5 text-start">
            {isAr ? 'أو اختر من النماذج الجاهزة:' : 'Or choose from presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(preset.url);
                  setUrlInput(preset.url);
                  setFileName(null);
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  value === preset.url
                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400/30 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Card */}
      {value && (
        <div className="pt-1">
          <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div
              className={`relative overflow-hidden border border-slate-200/80 bg-slate-900 shrink-0 ${getAspectClass()} ${
                aspectRatio === 'avatar' ? 'rounded-full' : 'rounded-xl'
              }`}
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <Check className="w-3 h-3" />
                    <span>{isAr ? 'تم تحديد الصورة' : 'Image Ready'}</span>
                  </span>
                  {fileName && (
                    <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                      {fileName}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-xs dir-ltr text-start">
                  {value.startsWith('data:') ? 'Local file uploaded (Data URL)' : value}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إزالة الصورة' : 'Remove Image'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MultiImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  language: Language;
  label?: string;
  description?: string;
}

export const CMSMultiImageGallery: React.FC<MultiImageGalleryProps> = ({
  images,
  onChange,
  language,
  label,
  description,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [newUrl, setNewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError(isAr ? 'يرجى اختيار ملفات صور صالحة' : 'Please select valid image files');
      return;
    }

    setError(null);
    const newImagesList: string[] = [];
    let processedCount = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) {
          newImagesList.push(res);
        }
        processedCount++;
        if (processedCount === imageFiles.length) {
          onChange([...images, ...newImagesList]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const handleAddUrl = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl('');
      setError(null);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 text-start flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-extrabold">
              {images.length}
            </span>
          </label>
          {description && (
            <span className="text-[11px] text-slate-400">{description}</span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isAr ? 'رفع صور من الجهاز (دفعة واحدة)' : 'Upload from Device (Batch)'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة برابط ويب (URL)' : 'Add Web URL'}</span>
        </button>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                {isAr
                  ? 'انقر لتحديد عدة صور معاً من جهازك أو اسحبها هنا'
                  : 'Click to select multiple images from your computer or drag & drop'}
              </p>
              <p className="text-[10px] text-slate-500">
                {isAr
                  ? 'يمكنك تحديد حتى 20 صورة دفعة واحدة (PNG, JPG, WebP)'
                  : 'Select up to 20 images at once (PNG, JPG, WebP)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-start dir-ltr"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة' : 'Add Image'}</span>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 font-medium animate-in fade-in text-start">
          {error}
        </p>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">
              {isAr
                ? 'معرض الصور (الصورة الأولى هي الغلاف الرئيسي):'
                : 'Gallery Items (First photo is Cover):'}
            </span>
            <span className="text-[11px]">
              {isAr ? 'انقر على أي صورة لجعلها الغلاف' : 'Click "Make Cover" to reorder'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-2xl overflow-hidden border aspect-video bg-slate-900 shadow-xs transition-all ${
                  idx === 0
                    ? 'ring-2 ring-blue-500 border-blue-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Cover Badge */}
                {idx === 0 ? (
                  <span className="absolute top-2 start-2 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{isAr ? 'الغلاف الرئيسي' : 'Cover'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-2 start-2 bg-slate-900/80 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isAr ? 'تعيين كغلاف' : 'Make Cover'}
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 end-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  title={isAr ? 'حذف الصورة' : 'Delete photo'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
