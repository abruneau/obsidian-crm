import { getTemplateConfig, getTemplateConfigsAsArray, TemplateConfig } from "./templateConfig";

/**
 * Template loader utility class
 *
 * This class handles loading template content from files and provides
 * a unified interface for accessing template data.
 */
export class TemplateLoader {
	/**
	 * Template content cache to avoid repeated file reads
	 */
	private static templateCache: Map<string, string> = new Map();

	/**
	 * Loads template content from a file
	 * @param templateName - The name of the template to load
	 * @returns Promise<string> - The template content
	 */
	static async loadTemplate(templateName: string): Promise<string> {
		// Check cache first
		if (this.templateCache.has(templateName)) {
			const cachedContent = this.templateCache.get(templateName);
			if (cachedContent) {
				return cachedContent;
			}
		}

		const config = getTemplateConfig(templateName);
		if (!config) {
			throw new Error(`Template '${templateName}' not found`);
		}

		try {
			const content = (config as any).template;

			// Cache the content
			this.templateCache.set(templateName, content);

			return content;
		} catch (error) {
			throw new Error(
				`Failed to load template '${templateName}': ${error.message}`
			);
		}
	}

	/**
	 * Clears the template cache
	 */
	static clearCache(): void {
		this.templateCache.clear();
	}

	/**
	 * Gets all available template configurations
	 */
	static getTemplateConfigs(): TemplateConfig[] {
		return getTemplateConfigsAsArray();
	}

	/**
	 * Gets a specific template configuration
	 */
	static getTemplateConfig(templateName: string): TemplateConfig | undefined {
		return getTemplateConfig(templateName);
	}
}
