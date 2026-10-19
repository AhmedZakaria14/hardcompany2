/**
 * HARD GROUP - CMS AUTOSAVE DRAFT TYPES & CONCURRENCY CONFLICT ERRORS
 */

export type DraftSaveStatus =
  | 'idle'
  | 'unsaved'
  | 'saving'
  | 'saved'
  | 'offline'
  | 'failed'
  | 'conflict';

export interface CMSDraftRecord<T = any> {
  id: string; // {entityType}_{entityId}
  entityType: string;
  entityId: string;
  sector?: string;
  data: T;
  revision: number;
  updatedAt: string;
  updatedByEmail: string;
  status: 'draft';
}

export class RevisionConflictError extends Error {
  localRevision: number;
  remoteRevision: number;
  remoteRecord: CMSDraftRecord;

  constructor(localRevision: number, remoteRevision: number, remoteRecord: CMSDraftRecord) {
    super(`Revision conflict: Local revision ${localRevision} is behind remote revision ${remoteRevision}.`);
    this.name = 'RevisionConflictError';
    this.localRevision = localRevision;
    this.remoteRevision = remoteRevision;
    this.remoteRecord = remoteRecord;
  }
}
