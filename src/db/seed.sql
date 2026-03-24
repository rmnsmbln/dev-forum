-- 1. Channels
INSERT INTO channels (name, description) VALUES
  ('javascript', 'Questions about JavaScript and Node.js'),
  ('python', 'Questions about Python'),
  ('general', 'General programming questions')
ON CONFLICT (name) DO NOTHING;

-- 2. Posts
INSERT INTO posts (channel_id, title, body, author_name) VALUES
  (1, 'How does async/await work?', 'Still a bit lost on the difference between Promises and async/await. Can anyone explain it simply? My code keeps running before the data actually arrives.', 'DevRam'),
  (1, 'What is the difference between let and var?', 'Is there any real-world reason to still use "var" in 2026? I see it in old tutorials, but it feels like "let" and "const" are the way to go now.', 'RadMax'),
  (2, 'How do I read a file in Python?', 'What’s the cleanest way to open a text file? I want to make sure I don’t leave the file "open" by accident and cause a memory leak.', 'CodeNinja')
ON CONFLICT DO NOTHING;

-- 3. Replies
INSERT INTO replies (post_id, body, author_name) VALUES
  (1, 'Think of "await" as a pause button. It tells the code to wait until the promise is finished before moving to the next line.', 'TechLead_67'),
  (2, 'Just stick to "const" by default. Use "let" only if you know the value will change. You can pretty much ignore "var" now.', 'DevMaster')
ON CONFLICT DO NOTHING;