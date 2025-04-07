# Configuring Supabase Auth Settings

This guide provides instructions for configuring your Supabase authentication settings to work with the Church Connect application, including proper handling of custom domains and the base path (`/church-connect/`).

## Accessing Auth Settings

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your Church Connect project
3. In the left sidebar, click on **Authentication**
4. Navigate to **URL Configuration** within the Authentication section

## Key Settings to Update

### 1. Site URL

The Site URL is used as the base for all authentication-related redirects. 

**Current Setting**: 
- If it's set to `http://localhost:5173`, this needs to be updated.

**Recommended Setting**:
- For development: `http://localhost:5173` (or your local dev server URL)
- For production: Your actual domain (e.g., `https://yourchurch.com` or `https://bajejosh.github.io`)

### 2. Redirect URLs

These are the allowed URLs where users can be redirected after authentication.

**Required Redirect URLs to Add**:

For local development:
```
http://localhost:5173/church-connect/dashboard
http://localhost:5173/church-connect/auth/callback
http://localhost:5173/dashboard
http://localhost:5173/auth/callback
```

For production:
```
https://yourchurch.com/church-connect/dashboard
https://yourchurch.com/church-connect/auth/callback
https://yourchurch.com/dashboard
https://yourchurch.com/auth/callback
```

For GitHub Pages (if applicable):
```
https://bajejosh.github.io/church-connect/dashboard
https://bajejosh.github.io/church-connect/auth/callback
https://bajejosh.github.io/dashboard
https://bajejosh.github.io/auth/callback
```

**Recommendation**: Add a wildcard URL `*` to make development easier. This allows redirects to any URL but should only be used in development environments.

### 3. Email Templates

Email templates may contain hardcoded URLs that need to be updated.

1. Go to **Authentication** → **Email Templates**
2. For each template (Confirmation, Invite, Magic Link, Recovery), update any URLs to use your site URL and proper base path:

Replace instances of:
- `http://localhost:5173/dashboard` with `{{ .SiteURL }}/church-connect/dashboard`
- `http://localhost:5173/auth` with `{{ .SiteURL }}/church-connect/auth`

The `{{ .SiteURL }}` placeholder will be replaced with your configured Site URL.

## Troubleshooting Common Issues

### The base path error message

If you see this error:
```
The server is configured with a public base URL of /church-connect/ - did you mean to visit /church-connect/dashboard instead?
```

This means:
1. The URL doesn't include the required base path (`/church-connect/`)
2. The automatic redirection isn't working

**Solutions**:
- Ensure the frontend code uses the `pathUtils.js` utilities for all redirects
- Verify that the `main.jsx` file includes the base path check
- Make sure all links in your application use the `formatPath` function

### Email verification links don't work

If verification emails direct users to invalid URLs:

**Solutions**:
- Update email templates in the Supabase dashboard as described above
- Ensure `{{ .SiteURL }}` is used for dynamic URLs in templates
- Check that the Site URL is properly configured
- Verify that the auth redirect URLs include the necessary paths

## Testing Authentication

After updating the settings:

1. Sign up for a new test account
2. Verify that the email contains the correct verification URL (with base path)
3. Test the verification link to ensure it correctly redirects
4. Test login with the verified account
5. Test password reset functionality

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Custom Domains with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#custom-domains)
- [Auth Email Templates](https://supabase.com/docs/guides/auth/password-reset#customize-the-email-template)
