# HARD Group CMS - First Superadmin Provisioning Procedure

This document outlines the secure, trusted procedure for provisioning the initial Super Administrator account for the HARD Group CMS.

---

## 🔒 Security Principles

1. **No Public Escalation**: There are **no public endpoints**, "first registered user becomes admin" rules, or open registration forms in the application.
2. **UID Verification**: Admin privileges are granted strictly by binding a verified Firebase Authentication UID to `/admin_profiles/{uid}` and `/users/{uid}` in Cloud Firestore.
3. **Idempotence & Safety**: The bootstrap script can be safely re-run multiple times without overwriting permissions or escalating unauthorized accounts.
4. **Audit Logging**: Every superadmin provisioning event records an immutable security record in `/audit_events`.

---

## 🚀 One-Time Superadmin Provisioning Procedure

### Method 1: Using the Interactive CLI Script (Recommended)

Run the server-side CLI script with the target email and Firebase Auth UID:

```bash
npx tsx scripts/bootstrap-superadmin.ts <TARGET_EMAIL> <TARGET_UID>
```

**Example:**
```bash
npx tsx scripts/bootstrap-superadmin.ts azeco44@gmail.com uid_azeco44_master
```

**Expected Output:**
```text
====================================================
HARD GROUP CMS - SUPERADMIN PROVISIONING SCRIPT
====================================================

Target Email: azeco44@gmail.com
Target UID  : uid_azeco44_master
Display Name: HARD Executive Board Superadmin

✅ PROVISIONING COMPLETED SUCCESSFULLY:
   - Status : created
   - Email  : azeco44@gmail.com
   - UID    : uid_azeco44_master
   - Info   : Successfully provisioned Superadmin role for azeco44@gmail.com (uid_azeco44_master).
```

---

### Method 2: Via Environment Variables

Set environment variables before executing the script:

```bash
export SUPERADMIN_BOOTSTRAP_EMAIL="admin@hardgp.com"
export SUPERADMIN_BOOTSTRAP_UID="firebase_uid_12345"
export SUPERADMIN_DISPLAY_NAME="HARD Group Board Director"

npx tsx scripts/bootstrap-superadmin.ts
```

---

## 🛡️ Security Audit Verification

After provisioning, verify that:
1. Document `/admin_profiles/{uid}` exists with `role: "superadmin"`, `isActive: true`, and `allowedSectors: ["portal", "realestate", "construction", "hvac"]`.
2. Document `/users/{uid}` mirrors the profile for client-side Auth listeners.
3. Document `/audit_events/{eventId}` logs the `provision_superadmin` action with timestamp and target email.
