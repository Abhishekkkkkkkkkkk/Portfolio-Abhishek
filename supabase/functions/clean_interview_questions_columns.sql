-- Drop unused columns from interview_questions to keep it fully aligned with CMS features
ALTER TABLE interview_questions DROP COLUMN IF EXISTS short_answer;
ALTER TABLE interview_questions DROP COLUMN IF EXISTS example;
ALTER TABLE interview_questions DROP COLUMN IF EXISTS code_example;
ALTER TABLE interview_questions DROP COLUMN IF EXISTS notes;
ALTER TABLE interview_questions DROP COLUMN IF EXISTS related_questions;
