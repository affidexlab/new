# 🚀 Publishing DecaFlow Privacy SDK

Step-by-step guide to publish this SDK to GitHub and npm.

---

## 📋 Pre-Publishing Checklist

- [x] Package.json updated with correct name `@decaflow/privacy-sdk`
- [x] README.md is comprehensive
- [x] LICENSE file added (MIT)
- [x] .gitignore configured
- [x] .npmignore configured
- [x] Examples added
- [x] CONTRIBUTING.md added
- [x] CHANGELOG.md added
- [x] GitHub Actions workflows added

---

## 🔄 Step 1: Initialize Git and Push to GitHub

You're in: `/project/workspace/decaflow-privacy-sdk/`

### Initialize Git

```bash
cd /project/workspace/decaflow-privacy-sdk
git init
git add .
git commit -m "Initial release: DecaFlow Privacy SDK v1.0.0"
```

### Connect to GitHub Repo

```bash
git remote add origin https://github.com/affidexlab/decaflow-privacy-sdk.git
git branch -M main
git push -u origin main
```

---

## 📦 Step 2: Build the Package

```bash
cd /project/workspace/decaflow-privacy-sdk
npm install
npm run build
```

This creates `dist/` with compiled JavaScript files.

---

## 🔐 Step 3: Set Up npm Publishing

### Create npm Account (if you don't have one)

1. Go to https://www.npmjs.com/signup
2. Create account
3. Verify email

### Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

### Publish to npm

```bash
npm publish --access public
```

This publishes `@decaflow/privacy-sdk` to npm registry.

---

## 🎉 Step 4: Verify Publication

### Check npm

```bash
npm view @decaflow/privacy-sdk
```

Or visit: https://www.npmjs.com/package/@decaflow/privacy-sdk

### Test Installation

```bash
npm install @decaflow/privacy-sdk
```

---

## 📊 Step 5: Add Repository Badges

After publishing, add these badges to your README (they'll auto-update):

```markdown
[![npm version](https://img.shields.io/npm/v/@decaflow/privacy-sdk.svg)](https://www.npmjs.com/package/@decaflow/privacy-sdk)
[![Downloads](https://img.shields.io/npm/dm/@decaflow/privacy-sdk.svg)](https://www.npmjs.com/package/@decaflow/privacy-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/affidexlab/decaflow-privacy-sdk/workflows/CI/badge.svg)](https://github.com/affidexlab/decaflow-privacy-sdk/actions)
```

Your GitHub README already has placeholders for these!

---

## 🔧 Step 6: Set Up GitHub Secrets (for auto-publishing)

1. Go to: https://github.com/affidexlab/decaflow-privacy-sdk/settings/secrets/actions
2. Click "New repository secret"
3. Add `NPM_TOKEN`:
   - Get token from: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create "Automation" token
   - Copy and paste to GitHub secret

Now whenever you create a GitHub Release, it auto-publishes to npm!

---

## 📈 Step 7: Create First Release

1. Go to: https://github.com/affidexlab/decaflow-privacy-sdk/releases/new
2. Click "Choose a tag"
3. Type: `v1.0.0`
4. Click "Create new tag"
5. Release title: `v1.0.0 - Initial Release`
6. Description:
   ```markdown
   ## 🎉 Initial Release
   
   First public release of DecaFlow Privacy SDK!
   
   ### Features
   - ✅ Privacy-protected swaps with MEV protection
   - ✅ Multi-chain support (Arbitrum, Ethereum, Base, etc.)
   - ✅ React hooks and components
   - ✅ TypeScript support
   - ✅ Real-time MEV risk scoring
   
   ### Installation
   ```bash
   npm install @decaflow/privacy-sdk
   ```
   
   ### Documentation
   - [Quickstart Guide](https://docs.decaflow.xyz/sdk/quickstart)
   - [API Reference](https://docs.decaflow.xyz/sdk/api)
   - [Examples](./examples)
   
   **Full Changelog**: https://github.com/affidexlab/decaflow-privacy-sdk/blob/main/CHANGELOG.md
   ```

7. Click "Publish release"

This triggers auto-publish to npm via GitHub Actions!

---

## ✅ Verification

After publishing, verify:

1. **GitHub**: https://github.com/affidexlab/decaflow-privacy-sdk
   - [ ] Code is visible
   - [ ] README displays correctly
   - [ ] CI badge shows passing

2. **npm**: https://www.npmjs.com/package/@decaflow/privacy-sdk
   - [ ] Package is published
   - [ ] Version is 1.0.0
   - [ ] README displays

3. **Installation Test**:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install @decaflow/privacy-sdk
   node -e "console.log(require('@decaflow/privacy-sdk'))"
   ```

---

## 🎯 Post-Publishing Tasks

1. **Tweet about it**:
   ```
   🎉 DecaFlow Privacy SDK is now live!
   
   Add MEV protection to your DeFi protocol in 5 minutes.
   
   ✅ Free forever
   ✅ Open source
   ✅ Multi-chain support
   
   npm install @decaflow/privacy-sdk
   
   Docs: docs.decaflow.xyz/sdk
   GitHub: github.com/affidexlab/decaflow-privacy-sdk
   
   🧵 Thread on how it works 👇
   ```

2. **Update your website**:
   - Add installation instructions
   - Link to GitHub repo
   - Show npm download badge

3. **Share in communities**:
   - r/ethdev
   - r/ethereum  
   - Arbitrum Discord
   - DeFi developer Telegrams

4. **Start outreach**:
   - Use the protocol target list
   - Send to 30 protocols
   - Track responses

---

## 🐛 Troubleshooting

### "npm publish" fails with 403

- Check you're logged in: `npm whoami`
- Check package name isn't taken: `npm view @decaflow/privacy-sdk`
- Try: `npm publish --access public`

### "git push" fails

- Check remote: `git remote -v`
- Check auth: Use personal access token
- Try: `git push -u origin main --force` (first push only)

### Build fails

- Run: `npm install`
- Check Node version: `node --version` (need 18+)
- Run: `npm run build` and check errors

---

## 📞 Need Help?

- Email: developers@decaflow.xyz
- Discord: https://discord.gg/decaflow
- GitHub Issues: https://github.com/affidexlab/decaflow-privacy-sdk/issues

---

**Ready to publish? Follow the steps above! 🚀**
