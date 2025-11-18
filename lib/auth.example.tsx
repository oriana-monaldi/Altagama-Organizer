// Example auth file — safe to commit. Copy to `lib/auth.tsx` locally and fill real credentials.

export const users = [
  { username: "example_admin", password: "example_password", role: "admin", displayName: "Admin Example" },
  { username: "example_user", password: "example_password", role: "viewer", displayName: "User Example" },
];

// Example of how your auth provider can import `users`:
// import { users } from './auth.example';
// Use this file as a template; never commit real passwords.
