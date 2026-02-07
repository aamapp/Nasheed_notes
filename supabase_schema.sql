-- এই কোডটি Supabase এর SQL Editor এ রান করুন --

-- ১. নাসিদ টেবিল তৈরি করুন
create table public.nasheeds (
  id text not null,
  title text not null,
  lyrics text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null references auth.users(id),
  is_favorite boolean default false,
  primary key (id)
);

-- ২. সিকিউরিটি (RLS) চালু করুন
alter table public.nasheeds enable row level security;

-- ৩. পলিসি তৈরি করুন যাতে ইউজাররা শুধু নিজেদের ডাটা দেখতে ও এডিট করতে পারে

-- ডাটা দেখার পলিসি
create policy "Users can view their own nasheeds"
on public.nasheeds for select
using ( auth.uid() = user_id );

-- ডাটা সেভ করার পলিসি
create policy "Users can insert their own nasheeds"
on public.nasheeds for insert
with check ( auth.uid() = user_id );

-- ডাটা আপডেট করার পলিসি
create policy "Users can update their own nasheeds"
on public.nasheeds for update
using ( auth.uid() = user_id );

-- ডাটা ডিলিট করার পলিসি
create policy "Users can delete their own nasheeds"
on public.nasheeds for delete
using ( auth.uid() = user_id );


-- ৪. (অপশনাল) ম্যানুয়ালি একটি নাশিদ বা গজল এন্ট্রি দেওয়ার SQL কোড
-- এটি রান করার আগে অবশ্যই 'YOUR_USER_UUID_HERE' এর জায়গায় আপনার আসল User UID বসাতে হবে।
-- User UID টি আপনি Supabase এর Authentication > Users পেজে পাবেন।

/*
INSERT INTO public.nasheeds (id, title, lyrics, user_id, is_favorite, created_at, updated_at)
VALUES (
  'manual-entry-01',                                -- যেকোনো ইউনিক ID
  'আল্লাহ তুমি দয়াবান',                               -- শিরোনাম
  'আল্লাহ তুমি দয়াবান, তুমি মেহেরবান... 
তোমার দয়ায় বেঁচে আছি, ওগো রহমান।',                    -- লিরিক
  'YOUR_USER_UUID_HERE',                            -- আপনার User UID (যেমন: 'a0eebc99-9c0b...')
  false,                                            -- ফেভারিট কিনা
  now(),                                            -- তৈরির সময়
  now()                                             -- আপডেটের সময়
);
*/