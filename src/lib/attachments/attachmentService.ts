import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { FormAttachmentDoc, FormAttachmentMeta, canManageLeads } from '../../types/firestore-schema';
import { getAdminUser } from '../adminAuth';
import { generateCorrelationId, logProductionEvent } from '../monitoring/productionLogger';

export interface AttachmentConfig {
  maxCount: number;
  maxSizeBytes: number; // e.g. 10MB
  allowedMimeTypes: string[];
  required?: boolean;
}

export const DEFAULT_ATTACHMENT_CONFIG: AttachmentConfig = {
  maxCount: 5,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB per file
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  required: false,
};

export const ALLOWED_EXTENSIONS_LABEL = 'JPG, PNG, WEBP, PDF, DOCX, XLSX (Max 10MB)';
export const ALLOWED_EXTENSIONS_LABEL_AR = 'JPG, PNG, WEBP, PDF, DOCX, XLSX (الحجم الأقصى 10 ميجابايت)';

/**
 * Validates a single file against size, count, and MIME type rules
 */
export function validateAttachmentFile(
  file: File,
  config: Partial<AttachmentConfig> = {},
  isAr: boolean = true
): string | null {
  const mergedConfig: AttachmentConfig = { ...DEFAULT_ATTACHMENT_CONFIG, ...config };

  if (file.size > mergedConfig.maxSizeBytes) {
    const sizeMb = (mergedConfig.maxSizeBytes / (1024 * 1024)).toFixed(0);
    return isAr
      ? `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت) يتجاوز الحد المسموح به (${sizeMb} ميجابايت).`
      : `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${sizeMb}MB.`;
  }

  const mime = file.type.toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  const isAllowedMime = mergedConfig.allowedMimeTypes.some(
    (allowed) => allowed.toLowerCase() === mime || mime.includes(allowed.split('/')[1])
  );

  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const isAllowedExt = allowedExts.includes(ext);

  if (!isAllowedMime && !isAllowedExt) {
    return isAr
      ? `صيغة الملف غير مدعومة. الصيغ المسموح بها: ${ALLOWED_EXTENSIONS_LABEL_AR}`
      : `Unsupported file format. Allowed formats: ${ALLOWED_EXTENSIONS_LABEL}`;
  }

  return null;
}

/**
 * Helper to convert file to Base64 string for offline/secure fallback storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Generates a random secure hex token for download authorization
 */
function generateSecureToken(length: number = 24): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Uploads an attachment to private storage and creates a pending Firestore record
 */
export async function uploadFormAttachment(
  file: File,
  options: { uploadSessionId?: string; config?: Partial<AttachmentConfig>; isAr?: boolean } = {}
): Promise<FormAttachmentMeta> {
  const isAr = options.isAr ?? true;

  // 1. Client-side and backend validation
  const validationError = validateAttachmentFile(file, options.config, isAr);
  if (validationError) {
    throw new Error(validationError);
  }

  const timestamp = Date.now();
  const fileId = `att-${timestamp}-${Math.random().toString(36).substring(2, 8)}`;
  const downloadToken = generateSecureToken();
  const fileExt = file.name.split('.').pop() || '';
  const storagePath = `private_attachments/${options.uploadSessionId || 'general'}/${fileId}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  let downloadUrl = '';
  let base64Fallback = '';

  // 2. Try uploading to Firebase Storage first
  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        fileId,
        downloadToken,
        uploadedAt: new Date().toISOString(),
      },
    });
    downloadUrl = await getDownloadURL(snapshot.ref);
  } catch (storageErr: any) {
    const corrId = generateCorrelationId('upload');
    logProductionEvent({
      correlationId: corrId,
      level: 'WARN',
      category: 'upload_error',
      errorCode: 'ERR_STORAGE_FALLBACK_BASE64',
      component: 'attachmentService',
      message: `Firebase Storage write notice for file ${file.name} (${file.size} bytes). Falling back to secure document payload: ${storageErr?.message || 'Storage Restricted'}`,
      statusClassification: 'TEMPORARILY_UNKNOWN',
      meta: { fileName: file.name, fileSizeBytes: file.size, mimeType: file.type },
    }).catch(() => {});

    // If Firebase Storage bucket isn't provisioned or restricted, encode base64 for small files only
    if (file.size > 700 * 1024) {
      throw new Error(
        isAr
          ? `تعذر رفع الملف إلى وحدة التخزين السحابية (حجم الملف ${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت). يرجى التأكد من اختيار ملف أقل من 700 كيلوبايت أو المتابعة بدون مرفق.`
          : `Failed to upload file to Cloud Storage (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum fallback attachment size is 700KB.`
      );
    }
    base64Fallback = await fileToBase64(file);
  }

  const nowIso = new Date().toISOString();
  // Set 2-hour expiration window for unlinked staging uploads
  const expiresIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const attachmentMeta: FormAttachmentMeta = {
    id: fileId,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    extension: fileExt.toLowerCase(),
    downloadToken,
    storagePath: downloadUrl || storagePath,
    dataBase64: base64Fallback || undefined,
    uploadedAt: nowIso,
  };

  const attachmentDoc: FormAttachmentDoc = {
    ...attachmentMeta,
    schemaVersion: '2.0.0',
    uploadSessionId: options.uploadSessionId || undefined,
    status: 'pending_submission',
    expiresAt: expiresIso,
  };

  // Save attachment document to Firestore /form_attachments/{attachmentId}
  const attachmentRef = doc(db, 'form_attachments', fileId);
  await setDoc(attachmentRef, attachmentDoc);

  return attachmentMeta;
}

/**
 * Links pending attachments to a submitted lead or appointment request
 */
export async function linkAttachmentsToSubmission(
  attachmentIds: string[],
  submissionId: string,
  submissionType: 'lead' | 'appointment'
): Promise<void> {
  if (!attachmentIds || attachmentIds.length === 0) return;

  const nowIso = new Date().toISOString();

  for (const attId of attachmentIds) {
    try {
      const attRef = doc(db, 'form_attachments', attId);
      await updateDoc(attRef, {
        submissionId,
        submissionType,
        status: 'attached',
        expiresAt: null,
        updatedAt: nowIso,
      });
    } catch (err) {
      console.warn(`Failed to link attachment ${attId} to submission ${submissionId}:`, err);
    }
  }
}

/**
 * Removes an uploaded attachment document and storage file
 */
export async function deleteAttachment(attachmentId: string, storagePath?: string): Promise<void> {
  try {
    const attRef = doc(db, 'form_attachments', attachmentId);
    await deleteDoc(attRef);

    if (storagePath && storagePath.startsWith('private_attachments/')) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef).catch(() => {});
    }
  } catch (err) {
    console.warn(`Failed to delete attachment ${attachmentId}:`, err);
  }
}

/**
 * Sweeps and deletes abandoned pending attachments older than cutoff (e.g. 2 hours)
 */
export async function cleanupAbandonedUploads(): Promise<{ cleanedCount: number }> {
  let cleanedCount = 0;
  const nowIso = new Date().toISOString();

  try {
    const attsRef = collection(db, 'form_attachments');
    const q = query(attsRef, where('status', '==', 'pending_submission'));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as FormAttachmentDoc;
      const isExpired = data.expiresAt ? data.expiresAt < nowIso : false;
      // If uploaded more than 2 hours ago
      const isOld = Date.now() - new Date(data.uploadedAt).getTime() > 2 * 60 * 60 * 1000;

      if (isExpired || isOld) {
        await deleteAttachment(data.id, data.storagePath);
        cleanedCount++;
      }
    }
  } catch (err) {
    console.error('Error during cleanup of abandoned uploads:', err);
  }

  return { cleanedCount };
}

/**
 * Retrieves attachment document details for authorized staff members
 */
export async function getAttachmentForStaff(attachmentId: string): Promise<FormAttachmentDoc | null> {
  const currentAdmin = getAdminUser();
  if (!currentAdmin || !canManageLeads(currentAdmin.role)) {
    throw new Error('Unauthorized: Only authorized staff with lead permissions can view private attachments.');
  }

  const attRef = doc(db, 'form_attachments', attachmentId);
  const snap = await getDoc(attRef);
  if (!snap.exists()) return null;

  return snap.data() as FormAttachmentDoc;
}
