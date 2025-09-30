ALTER TABLE messages
ADD COLUMN parent_id BIGINT REFERENCES messages(id);
