export interface ObsidianCRMSettings {
	llmUrl: string;
	llmModel: string;
	systemPrompt: string;
}

export interface LLMConfig {
	llmUrl: string;
	llmModel: string;
	systemPrompt: string;
}

export interface ContentType {
	type: string;
	label: string;
	description: string;
}

export interface ObsidianCRMPlugin {
	settings: ObsidianCRMSettings;
	saveSettings(): Promise<void>;
}
