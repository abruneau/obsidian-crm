import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

export class ObsidianCRMSettingTab extends PluginSettingTab {
	plugin: Plugin & { settings: any; saveSettings(): Promise<void> };

	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
		this.plugin = plugin as any;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

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
}
