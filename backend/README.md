# Backend / Database

Folder ini berisi migration Supabase untuk EMI UMKM.

## Isi Folder

```txt
supabase/
`-- migrations/   # SQL schema, RLS policy, dan tabel workspace multiuser
```

Jalankan migration secara berurutan di Supabase SQL Editor atau Supabase CLI. Schema memakai `auth.users` dan Row Level Security agar setiap UMKM hanya bisa mengelola data miliknya sendiri.

Tabel utama:

- `profiles`
- `transactions`
- `stocks`
- `articles`
- `businesses`
- `report_notes`
- `export_logs`