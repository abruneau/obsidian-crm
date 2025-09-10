# Changelog

All notable changes to the Obsidian CRM Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Obsidian CRM Plugin
- AI-powered meeting summary generation using LLM integration
- Task management with interactive checkboxes
- Content type detection (meeting, contact, company, generic)
- Integration with Datacore plugin for data querying
- Support for Ollama (local) and OpenAI-compatible APIs
- Side panel interface with ribbon icon access
- Comprehensive settings configuration
- React-based UI components
- Hierarchical task display with proper nesting
- Real-time task status synchronization
- Meeting history filtering and sorting
- Error handling and user feedback
- Comprehensive documentation and README
- **Folder Structure Scaffolding**: One-click creation of standardized CRM folder organization
- **Non-destructive folder creation**: Only creates folders that don't already exist
- **Folder status monitoring**: Shows which folders are present or missing
- **Enhanced settings interface**: Improved settings tab with CRM setup section
- **Template File Creation**: Pre-built templates for Contacts, Companies, Meetings, and Opportunities
- **Templater Integration**: Templates use Templater syntax for dynamic content and auto-move functionality
- **Template Management**: Separate template creation and management in settings
- **Comprehensive Template Library**: Four complete templates with proper frontmatter and Datacore integration
- **Modular Template Structure**: Templates organized in separate files for better maintainability
- **Template Configuration System**: Centralized configuration for template metadata and settings
- **Easy Template Extension**: Simple process for adding new templates to the system
- **File-based Template Loading**: Templates loaded through TemplateLoader with caching and fallback support
- **Clean Architecture**: Removed duplicate template content from TemplateService for better maintainability
- **Template Loading Fix**: Resolved issue where plugin always used fallback templates instead of actual template files
- **TypeScript Template Integration**: Templates now properly load from `.md.ts` files as exported constants

### Features
- **Meeting Summaries**: Generate AI-powered summaries of meeting notes
- **Task Management**: Track and manage tasks with interactive checkboxes
- **Content Categorization**: Automatic detection of content types based on tags
- **Datacore Integration**: Seamless integration with Datacore plugin
- **Flexible LLM Support**: Works with local and cloud-based LLM services
- **Clean UI**: Intuitive side panel interface
- **Real-time Updates**: Immediate synchronization of task changes
- **Folder Scaffolding**: One-click creation of organized CRM folder structure
- **Smart Organization**: Standardized folder layout for Companies, Contacts, Interactions, and Opportunities
- **Template System**: Pre-built templates with Templater integration and auto-move functionality
- **Template Management**: Easy creation and management of CRM templates through settings
- **Modular Architecture**: Templates organized in separate files for better maintainability and extensibility
- **Clean Template Loading**: File-based template loading with caching and fallback support

### Technical Details
- Built with TypeScript and React
- Uses Obsidian's plugin API
- Integrates with Datacore for data querying
- Supports both local and cloud LLM APIs
- Follows Obsidian plugin development best practices
- Comprehensive error handling and logging

### Dependencies
- Requires Obsidian v0.15.0 or higher
- Requires Datacore plugin to be installed and enabled
- Supports Ollama, OpenAI, and other OpenAI-compatible APIs

---

## Future Releases

### Planned Features
- [ ] Enhanced task filtering and search
- [ ] Meeting template generation
- [ ] Contact relationship mapping
- [ ] Export functionality for summaries
- [ ] Integration with calendar plugins
- [ ] Advanced AI prompt customization
- [ ] Bulk task operations
- [ ] Meeting analytics and insights
- [ ] Custom content type definitions
- [ ] Plugin API for third-party integrations

### Known Issues
- None at this time

### Breaking Changes
- None in this release
