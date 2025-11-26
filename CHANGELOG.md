# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ Interactive form with text checking and detailed results
- ⚡ Instant clipboard check and paste (background mode)
- 🌍 Support for 30+ languages with auto-detection
- 🎯 Frecency-based language sorting (most used appear first)
- 💾 Persistent language preference (remembers your choice)
- 🔧 Advanced options with 12 configurable parameters:
  - Check Level (Default/Picky)
  - Mother Tongue (false friends detection)
  - Preferred Variants (for auto-detection)
  - Enabled/Disabled Rules
  - Enabled/Disabled Categories
  - Enable Only Specified Rules toggle
- 👑 Automatic Premium account integration
- 📊 Detailed results view with metadata
- 🎨 Apply corrections individually or all at once
- ⌨️ Keyboard shortcuts for quick actions
- 🔄 Reset corrections functionality
- 📋 Copy/Paste corrected text actions
- 📖 Comprehensive documentation (README + Advanced Options guide)

### Architecture
- 🏗️ Clean architecture with separation of concerns:
  - Components layer (UI)
  - Hooks layer (state management)
  - Services layer (API integration)
  - Utils layer (pure functions)
- 🎣 Custom React hooks for text corrections
- 🔧 Centralized API service with Premium support
- 📦 Reusable pure functions for text processing
- 💪 Full TypeScript type safety
- ✅ Zero linter errors

### Developer Experience
- 🛠️ Modern development setup with TypeScript
- 🔍 Type-safe API client
- 📝 JSDoc documentation
- 🎨 Prettier configuration
- 🧹 ESLint configuration
- 🚀 Hot reload in development

## [1.0.0] - 2025-11-26

### Initial Release
- 🎉 First public release
- Basic text checking functionality
- LanguageTool API integration

---

## Contributing

See [README.md](./README.md) for contribution guidelines.

## Links

- [GitHub Repository](https://github.com/lucastaonline/raycast-language-tool)
- [Raycast Store](https://raycast.com/store)
- [LanguageTool API](https://languagetool.org/http-api/)
