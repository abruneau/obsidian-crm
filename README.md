# Obsidian CRM Plugin

A comprehensive Customer Relationship Management (CRM) plugin for Obsidian that provides AI-powered meeting summaries, task management, and contact organization using LLM integration.

## 🚀 Features

- **AI-Powered Meeting Summaries**: Automatically generate concise summaries of meeting notes using local or cloud-based LLM APIs
- **Smart Task Management**: Track and manage tasks with interactive checkboxes that sync with your original files
- **Content Type Detection**: Automatically categorizes content as meetings, contacts, companies, or generic content
- **Datacore Integration**: Seamlessly integrates with the Datacore plugin for advanced data querying and management
- **Side Panel Interface**: Clean, intuitive interface accessible via ribbon icon or command palette
- **Flexible LLM Support**: Works with Ollama (local), OpenAI, and other OpenAI-compatible APIs
- **Folder Structure Scaffolding**: One-click creation of standardized CRM folder organization
- **Template File Creation**: Pre-built templates for Contacts, Companies, Meetings, and Opportunities

## 📋 Requirements

### Essential Dependencies
- **Datacore Plugin**: Must be installed and enabled (this plugin depends on Datacore for data querying)

### LLM Integration
- **Local Option**: Ollama instance running locally
- **Cloud Option**: OpenAI API key or other OpenAI-compatible service
- **Internet Connection**: Required for cloud-based LLM services

## 🛠️ Installation

### Method 1: Manual Installation
1. Download the latest release from the [releases page](https://github.com/yourusername/obsidian-crm/releases)
2. Extract the plugin folder to your Obsidian vault's `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian's Community Plugins settings

### Method 2: Community Plugins (Future)
*This plugin will be submitted to the Obsidian Community Plugins directory*

## ⚙️ Configuration

### 1. Install and Configure Datacore

**CRITICAL**: This plugin requires the [Datacore plugin](https://github.com/blacksmithgu/datacore) to function properly.

### 2. Set Up CRM Folder Structure

The plugin includes a convenient folder scaffolding feature to help you organize your CRM data:

1. **Access Settings**: Go to **Settings** → **Community Plugins** → **Obsidian CRM**
2. **Choose Scaffolding Option**:
   - **"Create Folders Only"**: Creates just the folder structure
   - **"Create Folders + Templates"**: Creates folders and template files
3. **Folder Structure**: This creates the following organization:
   ```
   CRM/
   ├── Companies/     # Company information and profiles
   ├── Contacts/      # Contact details and relationships
   ├── Interactions/  # Meeting notes and communications
   └── Opportunities/ # Sales opportunities and deals
   
   Settings/
   ├── Scripts/       # Custom automation scripts
   └── Templates/     # Pre-built template files
       ├── Contact Template.md
       ├── Company Template.md
       ├── Meeting Template.md
       └── Opportunity Template.md
   ```

**Note**: The scaffolding is non-destructive - it only creates folders and files that don't already exist.

### 3. Using CRM Templates

The plugin creates pre-built templates to help you get started:

#### **Contact Template**
- Includes fields for company, team, role, email, phone, LinkedIn, manager, and location
- Automatically moves new contacts to the `CRM/Contacts/` folder
- Includes Datacore integration for contact information display

#### **Company Template**
- Fields for industry, size, website, address, phone, founded date, and description
- Sections for key contacts, opportunities, and notes
- Automatically moves to the `CRM/Companies/` folder

#### **Meeting Template**
- Pre-configured with meeting details, attendees, agenda, and action items
- Includes start_date field for proper Datacore integration
- Automatically moves to the `CRM/Interactions/` folder

#### **Opportunity Template**
- Tracks opportunity details, value, probability, and close date
- Includes sections for requirements, competition, and next steps
- Automatically moves to the `CRM/Opportunities/` folder

**Template Features**:
- **Templater Integration**: Uses Templater syntax for dynamic content
- **Auto-move**: Templates automatically move files to appropriate CRM folders
- **Datacore Ready**: Includes proper frontmatter and tags for Datacore integration
- **Customizable**: Edit templates to match your specific workflow needs

### 4. Configure LLM Settings

Access the plugin settings through: **Settings** → **Community Plugins** → **Obsidian CRM**

#### For Ollama (Local LLM)
- **LLM API URL**: `http://localhost:11434/api/generate`
- **LLM Model**: `gemma3_ctx:latest` (or your preferred model)
- **System Prompt**: Customize how the AI should generate summaries

#### For OpenAI/Cloud APIs
- **LLM API URL**: Your API endpoint (e.g., `https://api.openai.com/v1/chat/completions`)
- **LLM Model**: Your model name (e.g., `gpt-3.5-turbo`, `gpt-4`)
- **System Prompt**: Instructions for the AI model

## 📖 Usage

### Accessing the CRM Panel

1. **Ribbon Icon**: Click the brain icon in the left sidebar
2. **Command Palette**: `Ctrl/Cmd + Shift + P` → "Open CRM Panel"

### Content Types and Features

#### 📅 Meeting Content (`#meeting` tag)
- **Task Management**: View and manage tasks linked to the meeting
- **Interactive Checkboxes**: Toggle task completion status
- **Hierarchical Display**: Tasks are shown with proper indentation and nesting

#### 👥 Contact Content (`#contact*`, `#person*`, `#individual*` tags)
- **Meeting Summaries**: Generate AI summaries of past meetings with this contact

#### 🏢 Company Content (`#company*`, `#BU*`, `#oppy` tags)
- **Business Summaries**: Generate comprehensive meeting summaries for the company
- **Meeting Aggregation**: Combines multiple meetings for broader insights
- **Historical Analysis**: Focuses on past meetings for actionable insights

#### 📄 Generic Content
- **File Information**: Displays basic file metadata
- **Content Analysis**: Shows file path, size, and modification date

## 🔧 Advanced Configuration

### Datacore Query Examples

The plugin uses Datacore queries to find relevant content:

```javascript
// Find meetings linked to current page
@page and #meeting and linksto([[current-page]]) and start_date != ""

// Find incomplete tasks for an account
@task and childOf([[account]]) and $completed = false
```

### Custom System Prompts

Customize the AI behavior with system prompts:

```
Default: "Please provide a concise summary of the latest topics discussed in the meetings. Only respond with the summary, no other text:"

Custom: "Analyze the following meetings and provide:
1. Key decisions made
2. Action items and owners
3. Next steps and deadlines
4. Important risks or concerns"
```

## 🐛 Troubleshooting

### Common Issues

#### "Datacore is not available"
- **Solution**: Install and enable the Datacore plugin
- **Check**: Ensure Datacore is properly configured and your files are indexed

#### "No meetings found"
- **Solution**: Verify your document exists in Datacore and has linked meeting notes
- **Check**: Ensure meetings are tagged with `#meeting` and have `start_date` fields

#### "API errors" or "Failed to generate summary"
- **Check LLM Configuration**: Verify your API URL and model name
- **Test API Access**: Ensure your API endpoint is accessible
- **Check Internet Connection**: Required for cloud-based APIs
- **Verify API Key**: Ensure your API key is valid and has sufficient credits

#### "Empty summaries"
- **Check System Prompt**: Ensure your prompt is clear and specific
- **Verify Model**: Test your LLM model independently
- **Check Content**: Ensure meeting notes contain substantial content

### Ollama Setup Guide

If using Ollama locally:

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Pull a Model**: 
   ```bash
   ollama pull gemma3_ctx:latest
   # or
   ollama pull llama2
   ```
3. **Start Ollama**: 
   ```bash
   ollama serve
   ```
4. **Configure Plugin**: Use `http://localhost:11434/api/generate` as API URL

### Datacore Setup Guide

1. **Install Datacore**: From Community Plugins
2. **Configure Indexing**: Ensure your vault is properly indexed
3. **Add Frontmatter**: Include relevant fields in your documents
4. **Test Queries**: Use Datacore's query interface to verify data

## 🏗️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/obsidian-crm.git
cd obsidian-crm

# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode with watch
npm run dev
```

### Project Structure

```
obsidian-crm/
├── main.ts                 # Main plugin entry point
├── manifest.json          # Plugin manifest
├── src/
│   ├── component/         # React components
│   │   ├── CRMComponent.tsx
│   │   ├── TaskListComponent.tsx
│   │   └── MeetingSummaryComponent.tsx
│   ├── lib/              # Core services
│   │   ├── DatacoreService.ts
│   │   ├── TaskService.ts
│   │   ├── TemplateService.ts
│   │   ├── FolderScaffoldService.ts
│   │   └── AppContext.ts
│   ├── model/            # Data models and utilities
│   │   ├── ContentManager.ts
│   │   └── types.ts
│   ├── settings/         # Settings management
│   │   └── SettingsTab.ts
│   ├── sidebar/          # Sidebar views
│   │   ├── CRMSideBarView.tsx
│   │   ├── MeetingView.tsx
│   │   ├── ContactView.tsx
│   │   └── CompanyView.tsx
│   └── templates/        # Template files and configuration
│       ├── README.md
│       ├── templateConfig.ts
│       ├── TemplateLoader.ts
│       ├── ContactTemplate.md.ts
│       ├── CompanyTemplate.md.ts
│       ├── MeetingTemplate.md.ts
│       └── OpportunityTemplate.md.ts
├── styles.css            # Plugin styles
└── package.json          # Dependencies and scripts
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Datacore Plugin**: For providing the data querying foundation
- **Obsidian Community**: For the excellent plugin development ecosystem
- **React Team**: For the powerful UI framework
- **LLM Providers**: For making AI-powered features accessible

## 📞 Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yourusername/obsidian-crm/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/yourusername/obsidian-crm/discussions)
- **Documentation**: Check the [Wiki](https://github.com/yourusername/obsidian-crm/wiki) for detailed guides

---

**Note**: This plugin is in active development. Features and APIs may change between versions. Please check the changelog for updates.
