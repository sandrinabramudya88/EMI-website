-- Bucket penyimpanan foto artikel dan dokumentasi UMKM.
-- File disimpan di Supabase Storage, URL publiknya disimpan di tabel articles.cover_url / businesses.image_url.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'emi-media',
  'emi-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'emi media public read') then
    create policy "emi media public read"
      on storage.objects for select
      using (bucket_id = 'emi-media');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'emi media owner insert') then
    create policy "emi media owner insert"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'emi-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'emi media owner update') then
    create policy "emi media owner update"
      on storage.objects for update to authenticated
      using (bucket_id = 'emi-media' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'emi-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'emi media owner delete') then
    create policy "emi media owner delete"
      on storage.objects for delete to authenticated
      using (bucket_id = 'emi-media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;