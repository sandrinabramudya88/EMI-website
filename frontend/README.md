# Frontend

Aplikasi Next.js untuk UI EMI UMKM. Folder ini adalah Root Directory yang dipilih saat deploy ke Vercel.

## Isi Folder

```txt
src/
|-- app/          # Routing, layout, dan halaman Next.js
|-- components/   # Komponen UI/layout/chart reusable
|-- features/     # Modul fitur berdasarkan domain aplikasi
`-- lib/          # Store, tipe data, mock data, helper, Supabase client
```

## Perintah

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Vercel

Set `Root Directory` ke `frontend`, lalu gunakan default build Next.js (`npm run build`).