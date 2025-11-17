-- Update the Hamilton Family baby prep list to correctly set is_second_child flag
UPDATE baby_prep_lists
SET is_second_child = true,
    updated_at = NOW()
WHERE family_id = 'e1b65436-4859-4bbc-b225-0ce8294f3ebe';

-- Verify the update
SELECT
  bpl.id,
  f.name as family_name,
  bpl.stage,
  bpl.is_second_child,
  (SELECT COUNT(*) FROM children WHERE family_id = f.id) as total_children,
  (SELECT COUNT(*) FROM children WHERE family_id = f.id AND birthdate <= NOW()) as born_children
FROM baby_prep_lists bpl
JOIN families f ON f.id = bpl.family_id
WHERE f.id = 'e1b65436-4859-4bbc-b225-0ce8294f3ebe';
