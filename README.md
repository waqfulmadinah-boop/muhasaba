# মুহাসাবত্র

দৈনন্দিন কাজের হিসাব রাখার সুন্দর ও সমৃদ্ধ অ্যাপ্লিকেশন।  
**Live:** Supabase (Database + Auth) + Vercel (Frontend)

## ফিচারসমূহ

- ইমেইল দিয়ে লগইন/রেজিস্ট্রেশন (Supabase Auth)
- দৈনিক কাজ যোগ, সম্পন্ন চিহ্নিত ও মুছে ফেলা
- ড্যাশবোর্ডে কাজের পারসেন্টেজ ও মোটিভেশনাল মন্তব্য
- নোট/ডায়েরি, ডার্ক মোড, ক্যালেন্ডার ভিউ
- স্ট্রিক কাউন্টার, ব্যাজ/অ্যাচিভমেন্ট, সার্চ ও ফিল্টার
- প্রোফাইল সেটিংস (নাম ও পাসওয়ার্ড পরিবর্তন)

## Supabase সেটআপ

1. https://supabase.com এ গিয়ে ফ্রি প্রজেক্ট তৈরি করুন
2. **SQL Editor** এ `supabase-schema.sql` ফাইলের SQL চালান
3. **Settings > API** থেকে `Project URL` ও `anon key` কপি করুন
4. `client/.env` ফাইলে বসান:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```

## লোকালে চালানো

```bash
cd client
npm install
npm run dev
```

ব্রাউজারে খুলুন: http://localhost:5173

## Vercel-এ deploy

1. GitHub repo Vercel-এ import করুন (Root Directory: `client`)
2. Environment Variables যোগ করুন:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

## প্রয়ুক্তি

- React 18 + Vite
- Supabase (PostgreSQL + Auth)
- Vercel (Hosting)
