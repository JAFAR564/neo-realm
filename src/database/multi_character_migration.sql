ALTER TABLE profiles
DROP CONSTRAINT profiles_id_fkey;

ALTER TABLE profiles
RENAME COLUMN id TO user_id;

ALTER TABLE profiles
ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
