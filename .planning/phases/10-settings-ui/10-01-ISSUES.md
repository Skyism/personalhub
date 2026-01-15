# UAT Issues: Phase 10 Plan 1

**Tested:** 2026-01-15
**Source:** .planning/phases/10-settings-ui/10-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Foreign key constraint violation on settings save

**Discovered:** 2026-01-15
**Phase/Plan:** 10-01
**Severity:** Blocker
**Feature:** Morning reminder form submission
**Description:** When attempting to save morning reminder settings, the form fails with error: "insert or update on table 'skincare_settings' violates foreign key constraint 'skincare_settings_user_id_fkey'"
**Expected:** Settings save successfully to database and success message appears
**Actual:** Database constraint violation error - settings do not save
**Repro:**
1. Navigate to /skincare/settings
2. Fill out morning reminder form (toggle ON, time 08:00, message "Morning skincare time!")
3. Click Save button
4. Error appears instead of success

**Root Cause Analysis:** The TEMP_USER_ID constant ('00000000-0000-0000-0000-000000000000') used in the settings page doesn't exist in the `auth.users` table that `skincare_settings.user_id` references. The foreign key constraint prevents inserting settings for a non-existent user.

**Fix Required:** Either:
- Create the TEMP_USER_ID in auth.users table (if using Supabase auth schema)
- Remove foreign key constraint and rely on application-level validation
- Use actual authenticated user_id instead of TEMP_USER_ID

## Resolved Issues

### UAT-001: Foreign key constraint violation on settings save

**Resolved:** 2026-01-15 - Fixed during UAT session
**Fix:** Created migration `20260115_add_temp_user.sql` that inserts TEMP_USER_ID into auth.users table
**Migration Applied:** Via Supabase MCP tool
**Verification:** Settings now save successfully, both INSERT and UPDATE operations work correctly

---
*Phase: 10-settings-ui*
*Plan: 01*
*Tested: 2026-01-15*
