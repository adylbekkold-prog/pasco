ALTER TABLE labs
ADD COLUMN IF NOT EXISTS duration_minutes integer;

ALTER TABLE labs
DROP CONSTRAINT IF EXISTS labs_duration_minutes_check;

ALTER TABLE labs
ADD CONSTRAINT labs_duration_minutes_check
CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 5 AND 480);
