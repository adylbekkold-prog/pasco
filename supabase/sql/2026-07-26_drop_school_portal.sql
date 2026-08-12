-- Removes the temporary school portal module (teacher/student tests).
-- Safe to run multiple times on PostgreSQL.

DROP TABLE IF EXISTS school_portal_activities CASCADE;
DROP TABLE IF EXISTS school_portal_attempts CASCADE;
DROP TABLE IF EXISTS school_portal_access CASCADE;
DROP TABLE IF EXISTS school_portal_tests CASCADE;
DROP TABLE IF EXISTS school_portal_users CASCADE;
DROP TABLE IF EXISTS school_portal_groups CASCADE;
DROP TABLE IF EXISTS school_portal_schools CASCADE;