import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { FormAttachmentMeta } from '../../types/firestore-schema';
import {
  uploadFormAttachment,
  validateAttachmentFile,
  deleteAttachment,
  AttachmentConfig,
  DEFAULT_ATTACHMENT_CONFIG,
  ALLOWED_EXTENSIONS_LABEL,
  ALLOWED_EXTENSIONS_LABEL_AR,
} from '../../lib/attachments/attachmentService';

interface FileUploadZoneProps {
  uploadSessionId?: string;
  config?: Partial<AttachmentConfig>;
  attachments: FormAttachmentMeta[];
  onChange: (attachments: FormAttachmentMeta[]) => void;
  language?: 'ar' | 'en';
  labelEn?: string;
  labelAr?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  uploadSessionId,
  config,
  attachments,
  onChange,
  language = 'ar',
  labelEn = 'Attach Photos, Plans or Supporting Documents',
  labelAr = 'إرفاق صور العقار، المخططات أو المستندات الداعمة',
  helpTextEn = 'Optional. You can upload up to 5 files (max 10MB each).',
  helpTextAr = 'اختياري. يمكنك إرفاق حتى 5 ملفات (بحد أقصى 10 ميجابايت للملف).',
  disabled = false,
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mergedConfig: AttachmentConfig = { ...DEFAULT_ATTACHMENT_CONFIG, ...config };
  const currentCount = attachments.length;
  const isMaxReached = currentCount >= mergedConfig.maxCount;

  const processFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    if (disabled || isMaxReached) return;

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (currentCount + fileList.length > mergedConfig.maxCount) {
      setUploadError(
        isAr
          ? `يمكنك إرفاق حتى ${mergedConfig.maxCount} ملفات فقط كحد أقصى.`
          : `You can only attach a maximum of ${mergedConfig.maxCount} files.`
      );
      return;
    }

    setIsUploading(true);
    const newAttachments: FormAttachmentMeta[] = [...attachments];

    try {
      for (const file of fileList) {
        const error = validateAttachmentFile(file, mergedConfig, isAr);
        if (error) {
          setUploadError(error);
          setIsUploading(false);
          return;
        }

        const uploadedMeta = await uploadFormAttachment(file, {
          uploadSessionId,
          config: mergedConfig,
          isAr,
        });

        newAttachments.push(uploadedMeta);
      }

      onChange(newAttachments);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err?.message || (isAr ? 'حدث خطأ أثناء رفع الملف.' : 'Error uploading file.'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isMaxReached) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && !isMaxReached && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = async (index: React.MouseEvent, att: FormAttachmentMeta) => {
    index.stopPropagation();
    try {
      await deleteAttachment(att.id, att.storagePath);
    } catch (e) {
      // Non-blocking local filter
    }
    const updated = attachments.filter((item) => item.id !== att.id);
    onChange(updated);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-600" />;
    return <File className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? labelAr : labelEn}</span>
        </label>
        <span className="text-xs text-slate-500 font-mono">
          {currentCount}/{mergedConfig.maxCount} {isAr ? 'ملفات' : 'files'}
        </span>
      </div>

      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isMaxReached && !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : isMaxReached || disabled
            ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed opacity-75'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={mergedConfig.allowedMimeTypes.join(',')}
          onChange={handleFileChange}
          disabled={disabled || isMaxReached || isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="flex items-center gap-2 text-emerald-600 py-1">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">{isAr ? 'جاري رفع وتشفير الملف...' : 'Uploading file...'}</span>
            </div>
          ) : isMaxReached ? (
            <div className="flex items-center gap-2 text-slate-500 py-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-medium">
                {isAr ? 'وصلت للحد الأقصى المسموح به للمرفقات.' : 'Maximum attachment count reached.'}
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isAr ? 'انقر لاختيار الملفات أو اسحبها إلى هنا' : 'Click to select or drag and drop files here'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? helpTextAr : helpTextEn} ({isAr ? ALLOWED_EXTENSIONS_LABEL_AR : ALLOWED_EXTENSIONS_LABEL})
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Validation Error Banner */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-lg text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isAr ? 'المرفقات الجاهزة للإرسال:' : 'Attached Files Ready for Submission:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {getFileIcon(att.mimeType)}
                  <div className="truncate text-right">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate dir-ltr">
                      {att.fileName}
                    </p>
                    <span className="text-[10px] text-slate-500">{formatFileSize(att.fileSizeBytes)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemoveAttachment(e, att)}
                  title={isAr ? 'إزالة الملف' : 'Remove file'}
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
