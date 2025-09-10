import { App } from 'obsidian';
import { getTemplateConfigsAsArray, TemplateConfig } from '../templates/templateConfig';
import { TemplateLoader } from '../templates/TemplateLoader';

/**
 * Service class for creating CRM template files
 * 
 * This service creates standardized template files to help users
 * get started with their CRM organization and data entry.
 * Templates are now loaded from separate files for better maintainability.
 */
export class TemplateService {

	/**
	 * Creates all CRM template files in the Settings/Templates folder
	 * @param app - The Obsidian App instance
	 * @returns Promise<TemplateResult> - Result of the template creation operation
	 */
	static async createCRMTemplates(app: App): Promise<TemplateResult> {
		const result: TemplateResult = {
			success: true,
			created: [],
			skipped: [],
			errors: []
		};

		const templatesPath = 'Settings/Templates';
		
		// Check if Templates folder exists
		const templatesFolder = app.vault.getAbstractFileByPath(templatesPath);
		if (!templatesFolder) {
			result.errors.push(`Templates folder '${templatesPath}' does not exist. Please run folder scaffolding first.`);
			result.success = false;
			return result;
		}

		try {
			const templateConfigs = getTemplateConfigsAsArray();
			
			for (const config of templateConfigs) {
				const filePath = `${templatesPath}/${config.filename}`;
				
				// Check if template already exists
				const existingFile = app.vault.getAbstractFileByPath(filePath);
				
				if (existingFile) {
					result.skipped.push(config.displayName);
				} else {
					try {
						// Load template content from file
						const content = await TemplateLoader.loadTemplate(config.displayName);
						
						if (!content) {
							result.errors.push(`Template content not found for '${config.displayName}'`);
							continue;
						}
						
						// Create the template file
						await app.vault.create(filePath, content);
						result.created.push(config.displayName);
					} catch (loadError) {
						result.errors.push(`Failed to load template '${config.displayName}': ${loadError.message}`);
					}
				}
			}
		} catch (error) {
			result.success = false;
			result.errors.push(`Failed to create templates: ${error.message}`);
		}

		return result;
	}

	/**
	 * Creates a specific template file
	 * @param app - The Obsidian App instance
	 * @param templateName - Name of the template to create
	 * @returns Promise<TemplateResult> - Result of the template creation operation
	 */
	static async createTemplate(app: App, templateName: string): Promise<TemplateResult> {
		const result: TemplateResult = {
			success: true,
			created: [],
			skipped: [],
			errors: []
		};

		const config = getTemplateConfigsAsArray().find((config: TemplateConfig) => config.displayName === templateName);
		if (!config) {
			result.success = false;
			result.errors.push(`Template '${templateName}' not found`);
			return result;
		}

		const templatesPath = 'Settings/Templates';
		const filePath = `${templatesPath}/${config.filename}`;
		
		try {
			// Check if template already exists
			const existingFile = app.vault.getAbstractFileByPath(filePath);
			
			if (existingFile) {
				result.skipped.push(templateName);
			} else {
				try {
					// Load template content from file
					const content = await TemplateLoader.loadTemplate(templateName);
					
					if (!content) {
						result.success = false;
						result.errors.push(`Template content not found for '${templateName}'`);
						return result;
					}
					
					// Create the template file
					await app.vault.create(filePath, content);
					result.created.push(templateName);
				} catch (loadError) {
					result.success = false;
					result.errors.push(`Failed to load template '${templateName}': ${loadError.message}`);
				}
			}
		} catch (error) {
			result.success = false;
			result.errors.push(`Failed to create template '${templateName}': ${error.message}`);
		}

		return result;
	}

	/**
	 * Gets the list of available templates
	 * @returns Array of template names
	 */
	static getAvailableTemplates(): string[] {
		return getTemplateConfigsAsArray().map((config: TemplateConfig) => config.displayName);
	}

	/**
	 * Checks if templates already exist
	 * @param app - The Obsidian App instance
	 * @returns TemplateStatus - Status of existing templates
	 */
	static getTemplateStatus(app: App): TemplateStatus {
		const status: TemplateStatus = {
			exists: false,
			missing: [],
			present: []
		};

		const templatesPath = 'Settings/Templates';
		
		// Check if Templates folder exists
		const templatesFolder = app.vault.getAbstractFileByPath(templatesPath);
		if (!templatesFolder) {
			status.missing = getTemplateConfigsAsArray().map((config: TemplateConfig) => config.displayName);
			return status;
		}

		// Check each template
		const templateConfigs = getTemplateConfigsAsArray();
		for (const config of templateConfigs) {
			const filePath = `${templatesPath}/${config.filename}`;
			const templateFile = app.vault.getAbstractFileByPath(filePath);
			
			if (templateFile) {
				status.present.push(config.displayName);
			} else {
				status.missing.push(config.displayName);
			}
		}

		status.exists = status.missing.length === 0;
		return status;
	}
}

/**
 * Result of a template creation operation
 */
export interface TemplateResult {
	success: boolean;
	created: string[];
	skipped: string[];
	errors: string[];
}

/**
 * Status of CRM templates
 */
export interface TemplateStatus {
	exists: boolean;
	missing: string[];
	present: string[];
}
