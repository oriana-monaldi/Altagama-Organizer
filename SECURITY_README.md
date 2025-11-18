Security note — auth credentials

This repository includes `lib/auth.example.tsx` as a safe template. Do NOT commit `lib/auth.tsx` with real credentials.

Recommended workflow for developers:

1. Copy the example file locally:

   cp lib/auth.example.tsx lib/auth.tsx

2. Edit `lib/auth.tsx` with your local usernames/passwords for development only.

3. Make sure `lib/auth.tsx` is ignored by git (it's listed in `.gitignore`).

4. Prefer secure alternatives for production:
   - Use Firebase Auth or another hosted auth provider.
   - Move auth logic to server-side (API route) so secrets are not exposed to client bundles.

If you already pushed `lib/auth.tsx` to a remote and need to remove it from remote history, follow the git guidance in `SECURITY_README_REMOVE.md`.
