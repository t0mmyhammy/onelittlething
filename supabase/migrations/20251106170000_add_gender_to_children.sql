-- Add gender field to children table
ALTER TABLE children 
ADD COLUMN gender TEXT CHECK (gender IN ('boy', 'girl'));

