import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { FolderScaffoldService, ScaffoldResult, ScaffoldWithTemplatesResult } from '../lib/FolderScaffoldService';
import { TemplateService, TemplateResult } from '../lib/TemplateService';
import { ObsidianCRMSettings } from '../../constants';

export class ObsidianCRMSettingTab extends PluginSettingTab {
	plugin: Plugin & { settings: ObsidianCRMSettings; saveSettings(): Promise<void> };

	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
		this.plugin = plugin as Plugin & { settings: ObsidianCRMSettings; saveSettings(): Promise<void> };
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'CRM Setup'});

		// Folder Structure Section
		containerEl.createEl('h3', {text: 'Folder Structure'});
		
		const folderStatus = FolderScaffoldService.getFolderStructureStatus(this.app);
		
		new Setting(containerEl)
			.setName('Scaffold CRM Structure')
			.setDesc('Create a standardized folder structure and template files for CRM organization.')
			.addButton(button => button
				.setButtonText('Create Folders Only')
				.setCta()
				.onClick(async () => {
					await this.scaffoldFolders();
				}))
			.addButton(button => button
				.setButtonText('Create Folders + Templates')
				.setCta()
				.onClick(async () => {
					await this.scaffoldFoldersWithTemplates();
				}));

		// Show current folder status
		if (folderStatus.exists) {
			containerEl.createEl('div', {
				cls: 'setting-item-description',
				text: '✅ CRM folder structure is complete'
			});
		} else {
			const statusDiv = containerEl.createEl('div', {
				cls: 'setting-item-description'
			});
			
			if (folderStatus.present.length > 0) {
				statusDiv.createEl('div', {
					text: `✅ Present: ${folderStatus.present.join(', ')}`
				});
			}
			
			if (folderStatus.missing.length > 0) {
				statusDiv.createEl('div', {
					text: `❌ Missing: ${folderStatus.missing.join(', ')}`
				});
			}
		}

		// Template Management Section
		containerEl.createEl('h3', {text: 'Template Management'});
		
		const templateStatus = TemplateService.getTemplateStatus(this.app);
		
		new Setting(containerEl)
			.setName('Create CRM Templates')
			.setDesc('Create template files for Contacts, Companies, Meetings, and Opportunities.')
			.addButton(button => button
				.setButtonText('Create All Templates')
				.setCta()
				.onClick(async () => {
					await this.createTemplates();
				}));

		// Show current template status
		if (templateStatus.exists) {
			containerEl.createEl('div', {
				cls: 'setting-item-description',
				text: '✅ All CRM templates are present'
			});
		} else {
			const statusDiv = containerEl.createEl('div', {
				cls: 'setting-item-description'
			});
			
			if (templateStatus.present.length > 0) {
				statusDiv.createEl('div', {
					text: `✅ Present: ${templateStatus.present.join(', ')}`
				});
			}
			
			if (templateStatus.missing.length > 0) {
				statusDiv.createEl('div', {
					text: `❌ Missing: ${templateStatus.missing.join(', ')}`
				});
			}
		}

		containerEl.createEl('h2', {text: 'LLM Configuration'});

		new Setting(containerEl)
			.setName('LLM API URL')
			.setDesc('The URL endpoint for your LLM API (e.g., Ollama, OpenAI, etc.)')
			.addText(text => text
				.setPlaceholder('http://localhost:11434/api/generate')
				.setValue(this.plugin.settings.llmUrl)
				.onChange(async (value) => {
					this.plugin.settings.llmUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('LLM Model')
			.setDesc('The model name to use for generating summaries')
			.addText(text => text
				.setPlaceholder('gemma3_ctx:latest')
				.setValue(this.plugin.settings.llmModel)
				.onChange(async (value) => {
					this.plugin.settings.llmModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('System Prompt')
			.setDesc('The system prompt to send to the LLM for generating summaries')
			.addTextArea(text => text
				.setPlaceholder('Enter your system prompt here...')
				.setValue(this.plugin.settings.systemPrompt)
				.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				}));
	}

	/**
	 * Handles the folder scaffolding operation
	 */
	private async scaffoldFolders(): Promise<void> {
		try {
			const result: ScaffoldResult = await FolderScaffoldService.scaffoldCRMFolders(this.app);
			
			if (result.success) {
				let message = 'CRM folder structure created successfully!';
				
				if (result.created.length > 0) {
					message += `\nCreated: ${result.created.join(', ')}`;
				}
				
				if (result.skipped.length > 0) {
					message += `\nSkipped (already exist): ${result.skipped.join(', ')}`;
				}
				
				new Notice(message, 5000);
				
				// Refresh the settings display to show updated status
				this.display();
			} else {
				const errorMessage = `Failed to create folders:\n${result.errors.join('\n')}`;
				new Notice(errorMessage, 10000);
			}
		} catch (error) {
			new Notice(`Error creating folders: ${error.message}`, 10000);
		}
	}

	/**
	 * Handles the folder scaffolding with templates operation
	 */
	private async scaffoldFoldersWithTemplates(): Promise<void> {
		try {
			const result: ScaffoldWithTemplatesResult = await FolderScaffoldService.scaffoldCRMFoldersWithTemplates(this.app, true);
			
			if (result.success) {
				let message = 'CRM structure created successfully!';
				
				// Folder results
				if (result.folders.created.length > 0) {
					message += `\nFolders created: ${result.folders.created.join(', ')}`;
				}
				if (result.folders.skipped.length > 0) {
					message += `\nFolders skipped: ${result.folders.skipped.join(', ')}`;
				}
				
				// Template results
				if (result.templates.created.length > 0) {
					message += `\nTemplates created: ${result.templates.created.join(', ')}`;
				}
				if (result.templates.skipped.length > 0) {
					message += `\nTemplates skipped: ${result.templates.skipped.join(', ')}`;
				}
				
				new Notice(message, 5000);
				
				// Refresh the settings display to show updated status
				this.display();
			} else {
				let errorMessage = 'Failed to create CRM structure:\n';
				
				if (result.folders.errors.length > 0) {
					errorMessage += `Folder errors: ${result.folders.errors.join(', ')}\n`;
				}
				
				if (result.templates.errors.length > 0) {
					errorMessage += `Template errors: ${result.templates.errors.join(', ')}`;
				}
				
				new Notice(errorMessage, 10000);
			}
		} catch (error) {
			new Notice(`Error creating CRM structure: ${error.message}`, 10000);
		}
	}

	/**
	 * Handles the template creation operation
	 */
	private async createTemplates(): Promise<void> {
		try {
			const result: TemplateResult = await TemplateService.createCRMTemplates(this.app);
			
			if (result.success) {
				let message = 'CRM templates created successfully!';
				
				if (result.created.length > 0) {
					message += `\nCreated: ${result.created.join(', ')}`;
				}
				
				if (result.skipped.length > 0) {
					message += `\nSkipped (already exist): ${result.skipped.join(', ')}`;
				}
				
				new Notice(message, 5000);
				
				// Refresh the settings display to show updated status
				this.display();
			} else {
				const errorMessage = `Failed to create templates:\n${result.errors.join('\n')}`;
				new Notice(errorMessage, 10000);
			}
		} catch (error) {
			new Notice(`Error creating templates: ${error.message}`, 10000);
		}
	}
}
