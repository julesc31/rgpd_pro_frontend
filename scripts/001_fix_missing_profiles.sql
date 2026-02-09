-- Script pour créer les profils manquants des utilisateurs existants
-- À lancer une seule fois pour corriger les comptes sans profil

-- Créer les profils pour tous les utilisateurs auth qui n'ont pas de profil
INSERT INTO public.profiles (id, email, full_name, company, role, subscription_status)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'company', ''),
  'user',
  'active'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Afficher le résultat
SELECT 
  'Profils créés: ' || COUNT(*) as message
FROM public.profiles;
