# Pre-commit Hooks Setup Guide

This repository uses **Husky** + **Gitleaks** for preventing secrets from being committed and maintaining code quality.

## 🚀 Quick Setup

### 1. Install Gitleaks

#### Windows (using Chocolatey)

```powershell
choco install gitleaks
```

#### Windows (using Scoop)

```powershell
scoop install gitleaks
```

#### macOS (using Homebrew)

```bash
brew install gitleaks
```

#### Linux (using package manager)

```bash
# Ubuntu/Debian
curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | grep "browser_download_url.*linux_x64.tar.gz" | cut -d '"' -f 4 | xargs curl -L | tar -xz
sudo mv gitleaks /usr/local/bin/

# Or use go install
go install github.com/gitleaks/gitleaks/v8@latest
```

#### Manual Installation

Download the latest release from: https://github.com/gitleaks/gitleaks/releases

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Husky (done automatically)

The `prepare` script in package.json will automatically initialize Husky when you run `npm install`.

## 🔍 What Gets Checked

### Pre-commit Hook

When you commit code, the following checks run automatically:

1. **Secret Scanning (Gitleaks)**
   - Scans all staged files for API keys, tokens, passwords
   - Uses custom patterns for Polygon.io API keys
   - Blocks commits containing sensitive data

2. **Code Quality (ESLint)**
   - Lints TypeScript/JavaScript files
   - Auto-fixes fixable issues
   - Ensures code follows project standards

3. **Code Formatting (Prettier)**
   - Formats TypeScript, JavaScript, JSON, and Markdown files
   - Ensures consistent code style

4. **Type Checking (TypeScript)**
   - Validates TypeScript types
   - Prevents type errors from being committed

### Commit Message Hook

- Validates commit message format (conventional commits)
- Prevents sensitive information in commit messages
- Ensures consistent commit history

## 🛠️ Manual Commands

### Run Secret Scan

```bash
# Scan all files
npm run secret-scan

# Scan only staged files
npm run secret-scan:staged
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## 🔧 Configuration Files

- `.gitleaks.toml` - Gitleaks configuration with custom rules
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/commit-msg` - Commit message validation
- `package.json` - lint-staged configuration

## 🚨 If Secrets Are Detected

1. **Remove the secret** from your code
2. **Use environment variables** instead:
   ```typescript
   const apiKey = process.env.REACT_APP_POLYGONIO_KEY;
   ```
3. **Add to .env.example** with dummy values:
   ```
   REACT_APP_POLYGONIO_KEY=your_api_key_here
   ```
4. **Update documentation** if needed

## 🔄 Bypassing Hooks (Emergency Only)

⚠️ **Use with extreme caution!**

```bash
# Skip pre-commit hooks
git commit --no-verify -m "emergency fix"

# Skip commit message validation
git commit --no-verify -m "any message format"
```

## 🎯 Custom Patterns

The setup includes custom detection patterns for:

- Polygon.io API keys
- React environment variables with sensitive data
- Financial API endpoints with embedded keys
- High entropy strings (potential secrets)

## 📋 Troubleshooting

### Gitleaks not found

```bash
# Check if gitleaks is installed
gitleaks version

# If not found, install using one of the methods above
```

### Husky hooks not running

```bash
# Reinstall husky hooks
npx husky install
```

### Permission issues (Linux/macOS)

```bash
# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

## 🌟 Benefits

- **Prevents secret leaks** before they reach the repository
- **Maintains code quality** automatically
- **Enforces consistent formatting** across the team
- **Validates commit messages** for better project history
- **Catches type errors** before commits
- **Zero configuration** for new developers after setup

## 📚 Learn More

- [Husky Documentation](https://typicode.github.io/husky/)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [lint-staged](https://github.com/okonet/lint-staged)
