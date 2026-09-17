# Security Policy

Please report security issues privately to the Vylino development team rather than posting credentials or customer data publicly.

- Keep Meta App Secret and access tokens server-side.
- Validate incoming webhook signatures.
- Human takeover disables AI at conversation level.
- Protect admin actions with capabilities and nonces.
- Treat all incoming customer messages as untrusted input.
- Never commit production credentials to Git.
