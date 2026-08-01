# ShakiLabs UI artifact

`shakilabs-ui-0.3.11.tgz` is the active exact artifact for `@shakilabs/ui` 0.3.11.

- Source repository: `00.root-shakilabs`
- Source commit: `657cf80b72ef4a977b7b34e765b8ddb4ce9fbef7`
- SHA-256: `2c9587d9fd74af697f0a95bc50e39bccf169fb48dcebf37afe5991926b713b54`
- Rollback artifacts: available from Git history when needed

Only the active exact artifact is committed so an isolated Vercel checkout can run `npm ci` without a private registry token.

## Verification

```sh
shasum -a 256 client/vendor/shakilabs-ui-0.3.11.tgz
```

This record is machine-checked: `client/scripts/verify-vendor-artifact.mjs` compares the
tgz filename version, the SHA-256 above, and the `file:vendor/...` reference in
`client/package.json`. When the tgz is swapped, update this file in the same commit —
otherwise CI fails.
