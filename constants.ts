export interface ObsidianCRMSettings {
	llmUrl: string;
	llmModel: string;
	systemPrompt: string;
}

export const VIEW_TYPE_MEETING_SUMMARY = "meeting-summary-view";

export const DEFAULT_SETTINGS: ObsidianCRMSettings = {
	llmUrl: 'http://localhost:11434/api/generate',
	llmModel: 'gemma3_ctx:latest',
	systemPrompt: 'Please provide a concise summary of the latest topics discussed in the meetings. Only respond with the summary, no other text:'
};

export const CSS_CLASSES = {
	RIBBON: 'obsidian-crm-ribbon-class',
	FILE_INFO_CONTAINER: 'file-info-container',
	DYNAMIC_CONTENT_AREA: 'dynamic-content-area',
	MEETING_SUMMARY_RESULTS: 'meeting-summary-results'
} as const;

export const COMMAND_IDS = {
	OPEN_MEETING_SUMMARY_PANEL: 'open-meeting-summary-panel'
} as const;
