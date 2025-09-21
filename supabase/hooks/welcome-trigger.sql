-- Create a function to send a welcome message when a new profile is created
CREATE OR REPLACE FUNCTION send_welcome_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the welcome-user function
  PERFORM net.http_post(
    url := 'http://localhost:54321/functions/v1/welcome-user',
    body := jsonb_build_object('record', NEW),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when a new profile is inserted
CREATE TRIGGER welcome_new_user
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_message();