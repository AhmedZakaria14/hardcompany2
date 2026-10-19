# HARD Group CMS - Role-Based & Sector-Scoped Access Control (RBAC) Matrix

This matrix documents the security controls, permissions, sector scoping rules, and enforcement boundaries implemented across the **HARD Group CMS** (Portal, Real Estate, Construction, and HVAC).

---

## 👥 Administrative Roles & Capabilities

| Role | Role Key | Allowed Actions | Sectors Scope | Self Role Modification |
| :--- | :--- | :--- | :--- | :---: |
| **Super Administrator** | `superadmin` | Unrestricted full access to all content, settings, lead management, user profiles, and audit logs. | All Sectors (`portal`, `realestate`, `construction`, `hvac`) | ❌ Forbidden (Only via script/superadmin) |
| **Publisher** | `publisher` | Create, edit, save drafts, publish content, and view leads. Cannot manage user profiles or site settings. | Scoped to assigned `allowedSectors` | ❌ Forbidden |
| **Content Editor** | `editor` | Create, edit, and save content drafts. **Cannot publish** (requires publisher/superadmin approval). Cannot view leads or settings. | Scoped to assigned `allowedSectors` | ❌ Forbidden |
| **Lead Manager** | `lead_manager` | View, update status, assign, and manage customer leads, viewing appointments, and newsletter subscribers. Cannot edit content or settings. | Scoped to assigned `allowedSectors` | ❌ Forbidden |

---

## 🏢 Sector Scoping Rules

Permissions are strictly scoped to one or more assigned sectors (`allowedSectors: SectorId[]`):
1. **`realestate`**: Property listings, virtual tours, real estate market reports, and property viewing leads.
2. **`construction`**: Contracting projects, project progress, milestones, and cost estimator requests.
3. **`hvac`**: Maintenance service packages, HVAC capacity surveys, and service booking requests.
4. **`portal` / `global`**: Group-wide announcements, leadership profiles, global site settings, and contact forms.

---

## 🛡️ Permission Enforcement Matrix

| Feature / Collection | Superadmin | Publisher | Content Editor | Lead Manager | Unauthenticated Visitor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Published Content** (`/properties`, `/projects`, etc.) | Read / Write | Read / Write (In Sector) | Read / Write Draft (In Sector) | Read Only | **Read Only (Published)** |
| **Publish Content** (`publicationStatus = 'published'`) | ✅ Allowed | ✅ Allowed (In Sector) | ❌ **Denied** | ❌ **Denied** | ❌ **Denied** |
| **Customer Leads** (`/leads`, `/appointment_requests`) | Read / Write / Delete | Read / Update (In Sector) | ❌ **Denied** | Read / Update (In Sector) | **Create Only (Submissions)** |
| **Newsletter Join List** (`/subscribers`) | Read / Write / Delete | Read / Update | ❌ **Denied** | Read / Update | **Create Only (Submissions)** |
| **Admin User Profiles** (`/admin_profiles`, `/users`) | Read / Write / Delete | Read Self Only | Read Self Only | Read Self Only | ❌ **Denied** |
| **Role & Sector Scope Modifications** | ✅ Allowed | ❌ **Denied** | ❌ **Denied** | ❌ **Denied** | ❌ **Denied** |
| **System Settings** (`/site_settings`, `/offices`) | Read / Write | Read Only | Read Only | Read Only | Read Only |
| **Security Audit Logs** (`/audit_events`) | Read / Write (Append) | ❌ **Denied** | ❌ **Denied** | ❌ **Denied** | ❌ **Denied** |

---

## 🔒 Security & Security Rules Enforcement

1. **Firestore Security Rules (`firestore.rules`)**:
   - `isRoleAndSectorUnchanged()` helper function ensures that when non-superadmin users update their profile, their `role` and `allowedSectors` fields cannot be altered.
   - `hasSectorScope(sector)` verifies that the signed-in admin's profile includes the target sector before permitting write or lead read operations.

2. **Interface UI Adaptation (`CMSLayout.tsx` & `CMSSiteContentEditor.tsx`)**:
   - Navigation tabs automatically filter based on role capabilities (`canEditContent`, `canManageLeads`, `canManageSettings`).
   - "Publish" action buttons are hidden for `editor` roles, defaulting exclusively to "Save Draft".
