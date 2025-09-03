# Release Checklist

Use this checklist to ensure a smooth release of the Obsidian CRM Plugin.

## Pre-Release Checklist

### Code Quality
- [ ] All code has been reviewed and tested
- [ ] No linting errors or warnings
- [ ] TypeScript compilation successful
- [ ] Build process completes without errors
- [ ] All features are documented

### Documentation
- [ ] README.md is comprehensive and up-to-date
- [ ] CHANGELOG.md reflects all changes
- [ ] Code comments are clear and helpful
- [ ] Installation instructions are accurate
- [ ] Configuration examples are provided

### Configuration Files
- [ ] manifest.json has correct version and metadata
- [ ] package.json has proper author and repository info
- [ ] LICENSE file is present and correct
- [ ] .gitignore excludes build artifacts

### Testing
- [ ] Plugin loads without errors in Obsidian
- [ ] All features work as expected
- [ ] Datacore integration functions properly
- [ ] LLM integration works with test APIs
- [ ] UI components render correctly
- [ ] Settings can be configured and saved

## Release Process

### 1. Version Update
- [ ] Update version in manifest.json
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with new version
- [ ] Commit version changes

### 2. Build and Test
- [ ] Run `npm run build` to create main.js
- [ ] Test the built plugin in Obsidian
- [ ] Verify all functionality works
- [ ] Test with different Obsidian versions

### 3. Git Operations
- [ ] Add all new files: `git add .`
- [ ] Commit changes: `git commit -m "Release v1.0.0"`
- [ ] Tag the release: `git tag -a v1.0.0 -m "Release version 1.0.0"`
- [ ] Push to repository: `git push origin master --tags`

### 4. Create Release
- [ ] Go to GitHub repository
- [ ] Click "Releases" → "Create a new release"
- [ ] Select the tag created above
- [ ] Add release title: "Obsidian CRM Plugin v1.0.0"
- [ ] Add release notes from CHANGELOG.md
- [ ] Upload main.js, manifest.json, and styles.css as release assets
- [ ] Publish the release

### 5. Post-Release
- [ ] Update any documentation that references version numbers
- [ ] Announce the release on relevant forums/communities
- [ ] Monitor for user feedback and issues
- [ ] Update any plugin directories or listings

## File Structure for Release

The release should include these files:
```
obsidian-crm/
├── main.js              # Built plugin file
├── manifest.json        # Plugin manifest
├── styles.css          # Plugin styles
├── README.md           # Documentation
├── LICENSE             # License file
└── CHANGELOG.md        # Version history
```

## Community Plugin Submission

If submitting to Obsidian Community Plugins:

### Requirements
- [ ] Plugin follows Obsidian plugin guidelines
- [ ] Code is open source with appropriate license
- [ ] README includes installation instructions
- [ ] Plugin has been tested thoroughly
- [ ] No malicious or harmful functionality

### Submission Process
- [ ] Create GitHub repository (if not already done)
- [ ] Ensure all files are properly organized
- [ ] Submit to Obsidian Community Plugins via their process
- [ ] Respond to any feedback or requests for changes
- [ ] Maintain the plugin with updates and bug fixes

## Maintenance

### Ongoing Tasks
- [ ] Monitor GitHub issues and pull requests
- [ ] Respond to user questions and feedback
- [ ] Fix bugs and release patches as needed
- [ ] Add new features based on user requests
- [ ] Keep dependencies updated
- [ ] Test with new Obsidian versions

### Version Management
- [ ] Use semantic versioning (MAJOR.MINOR.PATCH)
- [ ] Update CHANGELOG.md for each release
- [ ] Tag releases in Git
- [ ] Maintain backward compatibility when possible
- [ ] Document breaking changes clearly

## Emergency Procedures

### Critical Bug Fix
- [ ] Identify and reproduce the bug
- [ ] Create a hotfix branch
- [ ] Implement the fix
- [ ] Test thoroughly
- [ ] Release patch version immediately
- [ ] Notify users of the fix

### Security Issues
- [ ] Assess the security impact
- [ ] Fix the issue immediately
- [ ] Release security patch
- [ ] Notify users of the security update
- [ ] Consider temporary removal from plugin directory if severe
