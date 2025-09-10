# CRM Templates

This folder contains the template files for the Obsidian CRM plugin. Templates are organized in separate files for better maintainability and easier addition of new templates.

## Structure

```
src/templates/
├── README.md                 # This documentation file
├── index.ts                  # Module exports
├── templateConfig.ts         # Template configuration and metadata
├── TemplateLoader.ts         # Template loading utility
└── templater/                # Individual template files
    ├── ContactTemplate.md.ts # Contact template content
    ├── CompanyTemplate.md.ts # Company template content
    ├── MeetingTemplate.md.ts # Meeting template content
    └── OpportunityTemplate.md.ts # Opportunity template content
```

## Adding New Templates

To add a new template:

1. **Create the template file**: Add a new `.md.ts` file in the `templater/` folder with your template content
2. **Update templateConfig.ts**: Add the template configuration to `TEMPLATE_CONFIGS` array
3. **Import the template**: Add the import statement for your new template constant
4. **Test**: Ensure the template appears in the settings and can be created

### Example: Adding a New Template

1. Create `src/templates/templater/ProjectTemplate.md.ts`:
```typescript
export const ProjectTemplate = `---
date_created: <% tp.file.creation_date() %>
tags:
  - project
status: active
---

# <% tp.file.title %>

Description::
Start Date::
End Date::
Team::

## Tasks
- [ ] 

## Notes
- 

<% await tp.file.move("/CRM/Projects/" + tp.file.title) %>`;
```

2. Update `templateConfig.ts`:
```typescript
import { ProjectTemplate } from "./templater/ProjectTemplate.md";

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  // ... existing templates
  {
    filename: 'ProjectTemplate.md',
    displayName: 'Project Template',
    description: 'Template for project management with tasks and timeline',
    targetFolder: 'CRM/Projects',
    template: ProjectTemplate
  }
];
```

**Note**: The current implementation loads templates directly from TypeScript files as exported constants, providing full type safety and proper integration with the build system.

## Template Features

All templates include:

- **Templater Integration**: Uses `<% %>` syntax for dynamic content
- **Auto-move**: Automatically moves files to appropriate CRM folders
- **Datacore Ready**: Proper frontmatter and tags for integration
- **Consistent Structure**: Standardized format across all templates

## Template Configuration

Each template has a configuration object with:

- `filename`: The template file name (without .ts extension)
- `displayName`: Human-readable name for the UI
- `description`: Description of the template's purpose
- `targetFolder`: Where files created from this template should be moved
- `template`: The actual template content (imported from the .md.ts file)

## Template Content

Template content is loaded through the `TemplateLoader` class, which provides:

- **TypeScript Integration**: Templates are loaded from individual `.md.ts` files as exported constants
- **Caching System**: Template content is cached for performance
- **Centralized Configuration**: All template metadata is managed in `templateConfig.ts`
- **Easy Maintenance**: Each template is in its own file for easy editing
- **Version Control**: Template changes are tracked in individual files
- **Type Safety**: Full TypeScript support throughout the loading process
- **No Code Duplication**: Single source of truth for template configuration

## Architecture

The template system uses a clean, modular architecture:

- **`templateConfig.ts`**: Central configuration file containing all template metadata and helper functions
- **`TemplateLoader.ts`**: Lightweight utility class that loads template content using the centralized configuration
- **`templater/` folder**: Individual template files as TypeScript constants
- **No Code Duplication**: All template-related logic is centralized in `templateConfig.ts`

This architecture ensures:
- **Single Source of Truth**: All template configuration is in one place
- **Easy Maintenance**: Changes only need to be made in one location
- **Type Safety**: Full TypeScript support throughout the system
- **Performance**: Template content is cached for optimal performance

## Best Practices

1. **Keep templates focused**: Each template should serve a specific purpose
2. **Use consistent formatting**: Follow the established patterns for frontmatter and structure
3. **Include proper tags**: Ensure templates have appropriate tags for Datacore integration
4. **Test thoroughly**: Verify templates work correctly before committing
5. **Document changes**: Update this README when adding or modifying templates
6. **Use the centralized functions**: Always use functions from `templateConfig.ts` rather than duplicating logic
