-- =====================================================================
-- Sample/dev seed data for Rapido Profit Tracker
--
-- Usage:
--   1. Sign up in the app once so a row exists in auth.users.
--   2. Find your user id: Supabase Dashboard -> Authentication -> Users.
--   3. Replace 'YOUR_USER_ID' below with that UUID.
--   4. Run this file in the Supabase SQL Editor.
--
-- Expected totals after seeding (verified in src/utils/calculations.test.ts):
--   Earnings         = 500 + 750 + 900          = ₹2,150
--   Petrol           = 200 + 250 + 300           = ₹750
--   Other Expenses   = 100 + 80                  = ₹180
--   Total Expenses   = 750 + 180                 = ₹930
--   Net Profit       = 2150 - 930                = ₹1,220
-- =====================================================================

insert into public.earnings (user_id, amount, date, note) values
  ('YOUR_USER_ID', 500, current_date, 'Rapido earning'),
  ('YOUR_USER_ID', 750, current_date - interval '1 day', 'Rapido earning'),
  ('YOUR_USER_ID', 900, current_date - interval '2 day', 'Rapido earning');

insert into public.petrol_entries (user_id, amount, date, litres, price_per_litre, petrol_station, note) values
  ('YOUR_USER_ID', 200, current_date, 2.1, 95, 'HP Petrol Pump', 'Morning petrol'),
  ('YOUR_USER_ID', 250, current_date - interval '1 day', 2.6, 96, null, null),
  ('YOUR_USER_ID', 300, current_date - interval '2 day', 3.1, 96.5, null, null);

insert into public.expenses (user_id, amount, category, date, note) values
  ('YOUR_USER_ID', 100, 'Food', current_date, 'Lunch'),
  ('YOUR_USER_ID', 80, 'Parking', current_date - interval '1 day', null);
