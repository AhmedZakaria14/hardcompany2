import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { storage, db } from './firebase';
import { LocalizedText, SectorId } from '../types/firestore-schema';
import { sanitizePayload, withServerTimestamps } from './firebase/serializers';

export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const APPROVED_FILE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface MediaUsageReference {
  collectionName: string;
  documentId: string;
  documentTitle: string;
}

export interface MediaAssetDoc {
  id: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  fileSizeBytes: number;
  contentType: AllowedMimeType | string;
  dimensions?: { width: number; height: number };
  altText: LocalizedText;
  caption?: LocalizedText;
  sector: SectorId;
  tags: string[];
  isPrivate: boolean;
  references: MediaUsageReference[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates if a file type and size are within approved CMS bounds.
 */
export function validateMediaUpload(file: File): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: 'No file provided' };

  if (!APPROVED_FILE_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not allowed. Approved types: JPG, PNG, WebP, SVG, PDF, DOCX`,
    };
  }

  // 15MB limit
  const maxSizeBytes = 15 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: 'File size exceeds maximum allowed 15MB limit' };
  }

  return { isValid: true };
}

/**
 * Extracts image dimensions (width & height) from a file.
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads media asset with upload progress callback and saves Firestore metadata.
 */
export async function uploadMediaAsset({
  file,
  sector = 'portal',
  tags = ['general'],
  altText = { ar: '', en: '' },
  caption = { ar: '', en: '' },
  isPrivate = false,
  uploadedBy = 'admin',
  onProgress,
}: {
  file: File;
  sector?: SectorId;
  tags?: string[];
  altText?: LocalizedText;
  caption?: LocalizedText;
  isPrivate?: boolean;
  uploadedBy?: string;
  onProgress?: (progressPercent: number) => void;
}): Promise<MediaAssetDoc> {
  const validation = validateMediaUpload(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const dimensions = await getImageDimensions(file);
  const mediaId = `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Public vs Private path separation
  const folderPath = isPrivate ? 'private_attachments' : `public_media/${sector}`;
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${folderPath}/${mediaId}_${sanitizedFileName}`;

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: { sector, isPrivate: String(isPrivate) },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      async (error) => {
        console.error('[uploadMediaAsset] Storage error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

          const assetDoc: MediaAssetDoc = {
            id: mediaId,
            fileName: file.name,
            storagePath,
            downloadUrl,
            thumbnailUrl: downloadUrl, // Primary image or derivative
            fileSizeBytes: file.size,
            contentType: file.type,
            dimensions,
            altText: {
              ar: altText.ar || file.name.split('.')[0],
              en: altText.en || file.name.split('.')[0],
            },
            caption,
            sector,
            tags,
            isPrivate,
            references: [],
            uploadedBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Save metadata to Firestore /media_metadata
          const docRef = doc(db, 'media_metadata', mediaId);
          await setDoc(docRef, withServerTimestamps(assetDoc));
          resolve(assetDoc);
        } catch (dbErr) {
          // Clean up failed storage object safely
          try {
            await deleteObject(storageRef);
          } catch (cleanErr) {
            console.warn('[uploadMediaAsset] Storage cleanup warning:', cleanErr);
          }
          reject(dbErr);
        }
      }
    );
  });
}

/**
 * Fetches all media metadata documents with filtering.
 */
export async function getMediaAssets(filters?: {
  sector?: SectorId;
  isPrivate?: boolean;
  searchQuery?: string;
}): Promise<MediaAssetDoc[]> {
  try {
    const colRef = collection(db, 'media_metadata');
    const snap = await getDocs(colRef);
    let items = snap.docs.map((d) => d.data() as MediaAssetDoc);

    if (filters?.sector) {
      items = items.filter((i) => i.sector === filters.sector || i.sector === 'portal');
    }
    if (filters?.isPrivate !== undefined) {
      items = items.filter((i) => Boolean(i.isPrivate) === filters.isPrivate);
    }
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.fileName.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.altText?.ar?.toLowerCase().includes(q) ||
          i.altText?.en?.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.warn('[getMediaAssets] Error fetching assets:', e);
    return [];
  }
}

/**
 * Safely deletes a media asset if it has no published references.
 */
export async function deleteMediaAsset(assetId: string): Promise<{ success: boolean; blockedReason?: string }> {
  const docRef = doc(db, 'media_metadata', assetId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return { success: false, blockedReason: 'Asset metadata not found' };
  }

  const asset = snap.data() as MediaAssetDoc;

  // Block deletion if asset is referenced by active content
  if (asset.references && asset.references.length > 0) {
    return {
      success: false,
      blockedReason: `Asset is referenced in ${asset.references.length} published document(s). Remove references first.`,
    };
  }

  // Delete from Cloud Storage
  try {
    const storageRef = ref(storage, asset.storagePath);
    await deleteObject(storageRef);
  } catch (e) {
    console.warn('[deleteMediaAsset] Cloud Storage deletion warning:', e);
  }

  // Delete metadata from Firestore
  await deleteDoc(docRef);
  return { success: true };
}
