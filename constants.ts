export interface ObsidianCRMSettings {
	llmUrl: string;
	llmModel: string;
	systemPrompt: string;

	/**
	 * Maximum depth that objects will be rendered to (i.e., how many levels of subproperties
	 * will be rendered by default). This avoids infinite recursion due to self referential objects
	 * and also ensures that rendering objects is acceptably performant.
	 */
	maxRecursiveRenderDepth: number;

	/** The default format that dates are rendered in (using luxon's moment-like formatting). */
	defaultDateFormat: string;
	/** The default format that date-times are rendered in (using luxons moment-like formatting). */
	defaultDateTimeFormat: string;
	/** Markdown text for how to render null values in tables or similar. */
	renderNullAs: string;
}

export const VIEW_TYPE_MEETING_SUMMARY = "meeting-summary-view";

export const DEFAULT_SETTINGS: ObsidianCRMSettings = {
	llmUrl: "http://localhost:11434/api/generate",
	llmModel: "gemma3_ctx:latest",
	systemPrompt:
		"Please provide a concise summary of the latest topics discussed in the meetings. Only respond with the summary, no other text:",
	maxRecursiveRenderDepth: 10,
	defaultDateFormat: "yyyy-MM-dd",
	defaultDateTimeFormat: "yyyy-MM-dd HH:mm",
	renderNullAs: "-",
};

export const CSS_CLASSES = {
	RIBBON: "obsidian-crm-ribbon-class",
	FILE_INFO_CONTAINER: "file-info-container",
	DYNAMIC_CONTENT_AREA: "dynamic-content-area",
	MEETING_SUMMARY_RESULTS: "meeting-summary-results",
	CRM_VIEW_CONTAINER: "crm-view-container",
	CRM_LOADING: "crm-loading",
	CRM_ERROR: "crm-error",
	CRM_RESULT: "crm-result",
	CRM_QUERY_RESULT: "crm-query-result",
	CRM_COMPONENT_PLACEHOLDER: "crm-component-placeholder",
	CRM_JSX_CONTAINER: "crm-jsx-container",
	CRM_JSX_PLACEHOLDER: "crm-jsx-placeholder",
	CRM_JSX_HEADER: "crm-jsx-header",
	CRM_JSX_BADGE: "crm-jsx-badge",
	CRM_JSX_CODE: "crm-jsx-code",
	CRM_JSX_NOTE: "crm-jsx-note",
	CRM_JSX_ERROR: "crm-jsx-error",
} as const;

export const COMMAND_IDS = {
	OPEN_MEETING_SUMMARY_PANEL: "open-meeting-summary-panel",
} as const;
