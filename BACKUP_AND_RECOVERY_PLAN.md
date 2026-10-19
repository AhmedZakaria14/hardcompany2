# HARD GROUP - BACKUP, DISASTER RECOVERY & ARCHIVAL PLAN

**System Name:** HARD Group Integrated Multi-Sector Enterprise Portal  
**Primary Database:** Google Cloud Firestore (`ai-studio-airealestate-4f5d4a08-7587-413f-8832-6058c6011951`)  
**Media Asset Storage:** Google Cloud Storage (`gs://hard-group-media-prod`)  
**Auth Provider:** Firebase Authentication (Custom Claims & `user_roles` collection)  
**Document Classification:** Confidential - Infrastructure & Security Standard  

---

## 1. Executive Summary & Core Principles

This document establishes the verified backup, disaster recovery, and data retention architecture for HARD Group. The platform hosts high-value real estate listings, construction projects, HVAC service catalogs, customer inquiries, and administrative audit logs. 

To ensure continuous operational availability and data resilience, the backup strategy strictly enforces:
1. **Separation of State:** Clear technical distinction between **Structured Database State** (Firestore documents, JSON metadata, relations) and **Binary Media Blobs** (JPEG/PNG images, PDF floorplans, vector SVGs).
2. **Zero Data Destruction:** Deletion operations are recoverable (trash bin/soft-delete). Database restorations preserve customer leads and audit logs without cascading deletions.
3. **Restoration Verification:** Backups are NOT claimed active until their automated execution, schema integrity, and non-production restoration dry-runs are verified.

---

## 2. Distinction Between Database Snapshots vs. Media Asset Backups

| Feature Component | Firestore Database Snapshots | Google Cloud Storage (GCS) Media Assets |
| :--- | :--- | :--- |
| **Data Nature** | Structured BSON/JSON document trees, indexes, subcollections, metadata | Binary object blobs (JPEG, WebP, PNG, PDF floorplans, brand logos) |
| **Primary Collections** | `properties`, `projects`, `blog_posts`, `leads`, `pages`, `trash_bin`, `audit_logs` | `gs://hard-group-media-prod/properties/`, `gs://hard-group-media-prod/cms/` |
| **Backup Mechanism** | Automated Managed Export (`gcloud firestore export`) & 7-Day PITR | GCS Object Versioning & 7-Day Soft-Delete Retention Policy |
| **Restoration Impact** | Restores entity records, properties, status, relations, and text fields | Restores actual image file content referenced by database URIs |
| **Storage Class** | GCS Nearline Bucket (`gs://hard-group-backups-production-prod`) | GCS Standard / Dual-Region Replicated Bucket (`me-central1` & `europe-west3`) |

> **Key Rule:** A Firestore database export contains ONLY string URIs (e.g. `https://storage.googleapis.com/.../img1.jpg`) pointing to media assets. Restoring a Firestore backup without GCS Object Versioning will result in broken image links if the underlying storage blobs were deleted.

---

## 3. Active Backup Mechanisms & Schedule Configuration

### 3.1 Cloud Firestore Automated Exports & PITR
- **Point-in-Time Recovery (PITR):**
  - **Status:** Enabled (7-Day Rolling Transaction Log Window).
  - **Capability:** Allows rolling back the database to any exact second within the last 7 days.
- **Daily Scheduled Exports:**
  - **Tooling:** Cloud Scheduler + Cloud Workflows + Firestore Admin API.
  - **Target Bucket:** `gs://hard-group-backups-production-prod/daily/`
  - **Schedule:** Every day at `02:00 UTC` (`cron: 0 2 * * *`).
  - **Retention:** 30 days automatic expiration via GCS Lifecycle Rule.
- **Monthly Archival Exports:**
  - **Target Bucket:** `gs://hard-group-backups-production-prod/monthly/`
  - **Schedule:** 1st day of every month at `03:00 UTC`.
  - **Retention:** 365 days in GCS Coldline Storage.

### 3.2 Storage Media Asset Protection (GCS)
- **Object Versioning:** Enabled on `gs://hard-group-media-prod`. Overwritten or deleted media files maintain historical version IDs for 30 days.
- **Soft-Delete Policy:** Enabled with a 7-day retention buffer before permanent object purging.
- **Cross-Region Replication:** Asynchronous dual-region replication between primary (`me-central1`) and secondary (`europe-west3`) storage nodes.

### 3.3 Firebase Authentication Administration & User Export
- **User Roster Export:**
  - Executed weekly via Firebase CLI or Admin SDK script:
    ```bash
    firebase auth:export users_backup_latest.json --format=json --project=ai-studio-airealestate-4f5d4a08
    ```
  - **Password Salt Preservation:** Preserves `scrypt` hashing parameters (`hash_key`, `salt_separator`, `rounds`, `mem_cost`) enabling seamless user account restoration without requiring password resets.
- **Role Mapping Security:** Backs up both Custom Claims (`role: superadmin | admin | editor`) and the Firestore `user_roles` collection.

### 3.4 Project Configuration & Manifest Infrastructure
- **Source Control Tracking:**
  - `firestore.rules` (Security Rules)
  - `firebase-blueprint.json` (Database Intermediate Representation Schema)
  - `firebase.json` & `firebase-applet-config.json` (Project bindings)
  - `.env.example` (Config placeholders)
- **CMS Brand Settings:** Included in both Git repository commits and live Firestore `settings` collection snapshots.

---

## 4. Access Control (IAM), Encryption & Retention Policy

### 4.1 Restricted IAM Permissions (Least Privilege)
Access to backup buckets and export APIs is strictly restricted:
- **Service Account Role:** `roles/datastore.importExportAdmin` (For Firestore export/import operations).
- **Storage Service Account Role:** `roles/storage.admin` (Assigned only to the backup pipeline service account `sa-backup-manager@...`).
- **CMS In-App Access:** Restricted exclusively to authorized users with the `superadmin` role.

### 4.2 Encryption at Rest & in Transit
- **Data in Transit:** TLS 1.3 enforced for all client-to-Firestore and GCS traffic.
- **Data at Rest:** Customer-Managed Encryption Keys (CMEK) via Cloud KMS (`projects/hard-group/locations/global/keyRings/backup-ring/cryptoKeys/backup-key`).

### 4.3 Retention Policy Summary
```
+--------------------------+---------------------+-------------------+---------------------+
| Backup Type              | Frequency           | Target Location   | Retention Period    |
+--------------------------+---------------------+-------------------+---------------------+
| Firestore PITR           | Continuous (Realtime)| Firestore Internal| 7 Days              |
| Daily Firestore Export   | Daily @ 02:00 UTC   | GCS Nearline      | 30 Days             |
| Monthly Firestore Export | Monthly (1st @ 03:00| GCS Coldline      | 365 Days            |
| Storage Media Versioning | On Mutation/Delete  | GCS Media Bucket  | 30 Days (7-d Soft)  |
| Auth User Accounts       | Weekly              | GCS Secured Bucket| 90 Days             |
| Local JSON Snapshot      | On-Demand (CMS)     | Local / Offline   | Admin Defined       |
+--------------------------+---------------------+-------------------+---------------------+
```

---

## 5. Non-Production Safe Restoration Drill & Exercise Guide

### 5.1 Step-by-Step Restoration Verification Procedure
Restorations MUST NEVER be performed directly in production without a dry-run validation in a non-production sandbox environment (`hard-realestate-staging`).

#### Step 1: Provision / Select Non-Production Target
Ensure the target project is configured (e.g., `ai-studio-airealestate-staging`).

#### Step 2: Import Firestore Collections in Sandbox
Execute the import command via `gcloud`:
```bash
gcloud firestore import gs://hard-group-backups-production-prod/daily/2026-10-10T02:00:00_backup/ \
  --project=ai-studio-airealestate-staging
```

#### Step 3: Import User Roster in Sandbox Auth
Restore user credentials without resetting user passwords:
```bash
firebase auth:import users_backup_latest.json \
  --hash-algo=SCRYPT \
  --hash-key=<BASE64_HASH_KEY> \
  --salt-separator=<BASE64_SALT_SEPARATOR> \
  --rounds=8 \
  --mem-cost=14 \
  --project=ai-studio-airealestate-staging
```

#### Step 4: Validate Schema Integrity & Media Links
Run the in-app CMS Backup & Disaster Recovery tool (`CMSBackupManager` -> *Restoration Drill*):
1. Navigate to **CMS Dashboard -> Settings -> Backup & Disaster Recovery Center**.
2. Select **Restoration Drill**.
3. Upload the target JSON snapshot or click **Test Current Live Snapshot in Sandbox**.
4. Review the **Pre-Restoration Impact Analysis Report**:
   - Verify entity diff counts (entities to create, update, or retain).
   - Check the **Media Reference Audit Scorecard** for broken image URIs.
5. Click **Execute Staged Restoration Drill**.

#### Step 5: Post-Restoration Acceptance Verification
- Confirm published properties render correctly on public pages.
- Verify customer lead records (`leads` collection) remain intact without unintended deletion.
- Verify security rules (`firestore.rules`) enforce role-based access in the sandbox.

---

## 6. Emergency Contacts & Escalation Matrix

- **Lead Cloud Architect:** `architect@hard.sa`
- **Super Administrator Governance:** `admin@hard.sa`
- **GCP Incident Escalation:** Google Cloud Support Portal (Severity 1 - Critical Outage)
