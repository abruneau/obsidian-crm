import { App, TFolder } from 'obsidian';
import { TemplateService, TemplateResult } from './TemplateService';

/**
 * Service class for scaffolding CRM folder structure
 * 
 * This service creates a standardized folder structure for CRM organization
 * without being destructive - it only creates folders that don't already exist.
 */
export class FolderScaffoldService {
	/**
	 * The predefined CRM folder structure
	 */
	private static readonly CRM_FOLDER_STRUCTURE = {
		'CRM': {
			'Companies': {
				'0 BU': {}
			},
			'Contacts': {},
			'Interactions': {},
			'Opportunities': {},
			'Technologies': {}
		},
		'Settings': {
			'Scripts': {},
			'Templates': {}
		}
	};

	/**
	 * Scaffolds the CRM folder structure in the vault
	 * @param app - The Obsidian App instance
	 * @returns Promise<ScaffoldResult> - Result of the scaffolding operation
	 */
	static async scaffoldCRMFolders(app: App): Promise<ScaffoldResult> {
		const result: ScaffoldResult = {
			success: true,
			created: [],
			skipped: [],
			errors: []
		};

		try {
			await this.createFolderStructure(app, this.CRM_FOLDER_STRUCTURE, '', result);
		} catch (error) {
			result.success = false;
			result.errors.push(`Failed to scaffold folders: ${error.message}`);
		}

		return result;
	}

	/**
	 * Recursively creates folder structure
	 * @param app - The Obsidian App instance
	 * @param structure - The folder structure to create
	 * @param basePath - The base path for the current level
	 * @param result - The result object to track operations
	 */
	private static async createFolderStructure(
		app: App,
		structure: Record<string, Record<string, unknown>>,
		basePath: string,
		result: ScaffoldResult
	): Promise<void> {
		for (const [folderName, subFolders] of Object.entries(structure)) {
			const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
			
			try {
				// Check if folder already exists
				const existingFolder = app.vault.getAbstractFileByPath(folderPath);
				
				if (existingFolder && existingFolder instanceof TFolder) {
					// Folder already exists, skip it
					result.skipped.push(folderPath);
				} else if (existingFolder) {
					// Path exists but is not a folder (e.g., it's a file)
					result.errors.push(`Cannot create folder '${folderPath}': A file with this name already exists`);
					continue;
				} else {
					// Create the folder
					await app.vault.createFolder(folderPath);
					result.created.push(folderPath);
				}

				// Recursively create subfolders
				if (typeof subFolders === 'object' && Object.keys(subFolders).length > 0) {
					await this.createFolderStructure(app, subFolders as Record<string, Record<string, unknown>>, folderPath, result);
				}
			} catch (error) {
				result.errors.push(`Failed to create folder '${folderPath}': ${error.message}`);
			}
		}
	}

	/**
	 * Checks if the CRM folder structure already exists
	 * @param app - The Obsidian App instance
	 * @returns boolean - True if the structure exists, false otherwise
	 */
	static hasCRMFolderStructure(app: App): boolean {
		const crmFolder = app.vault.getAbstractFileByPath('CRM');
		const settingsFolder = app.vault.getAbstractFileByPath('Settings');
		
		return crmFolder instanceof TFolder && settingsFolder instanceof TFolder;
	}

	/**
	 * Scaffolds the CRM folder structure and creates template files
	 * @param app - The Obsidian App instance
	 * @param createTemplates - Whether to create template files
	 * @returns Promise<ScaffoldWithTemplatesResult> - Result of the scaffolding operation
	 */
	static async scaffoldCRMFoldersWithTemplates(app: App, createTemplates = true): Promise<ScaffoldWithTemplatesResult> {
		const result: ScaffoldWithTemplatesResult = {
			success: true,
			folders: {
				success: true,
				created: [],
				skipped: [],
				errors: []
			},
			templates: {
				success: true,
				created: [],
				skipped: [],
				errors: []
			}
		};

		try {
			// First, create the folder structure
			result.folders = await this.scaffoldCRMFolders(app);
			
			// Then, create templates if requested and folders were successful
			if (createTemplates && result.folders.success) {
				result.templates = await TemplateService.createCRMTemplates(app);
			}
			
			// Overall success depends on both operations
			result.success = result.folders.success && result.templates.success;
		} catch (error) {
			result.success = false;
			result.folders.errors.push(`Failed to scaffold CRM structure: ${error.message}`);
		}

		return result;
	}

	/**
	 * Gets the current CRM folder structure status
	 * @param app - The Obsidian App instance
	 * @returns FolderStatus - Status of the CRM folder structure
	 */
	static getFolderStructureStatus(app: App): FolderStatus {
		const status: FolderStatus = {
			exists: false,
			missing: [],
			present: []
		};

		// Check main folders
		const mainFolders = ['CRM', 'Settings'];
		for (const folder of mainFolders) {
			const folderPath = app.vault.getAbstractFileByPath(folder);
			if (folderPath instanceof TFolder) {
				status.present.push(folder);
			} else {
				status.missing.push(folder);
			}
		}

		// Check CRM subfolders
		const crmSubfolders = ['Companies', 'Contacts', 'Interactions', 'Opportunities'];
		for (const subfolder of crmSubfolders) {
			const folderPath = app.vault.getAbstractFileByPath(`CRM/${subfolder}`);
			if (folderPath instanceof TFolder) {
				status.present.push(`CRM/${subfolder}`);
			} else {
				status.missing.push(`CRM/${subfolder}`);
			}
		}

		// Check Settings subfolders
		const settingsSubfolders = ['Scripts', 'Templates'];
		for (const subfolder of settingsSubfolders) {
			const folderPath = app.vault.getAbstractFileByPath(`Settings/${subfolder}`);
			if (folderPath instanceof TFolder) {
				status.present.push(`Settings/${subfolder}`);
			} else {
				status.missing.push(`Settings/${subfolder}`);
			}
		}

		status.exists = status.missing.length === 0;
		return status;
	}
}

/**
 * Result of a folder scaffolding operation
 */
export interface ScaffoldResult {
	success: boolean;
	created: string[];
	skipped: string[];
	errors: string[];
}

/**
 * Status of the CRM folder structure
 */
export interface FolderStatus {
	exists: boolean;
	missing: string[];
	present: string[];
}

/**
 * Result of scaffolding with templates
 */
export interface ScaffoldWithTemplatesResult {
	success: boolean;
	folders: ScaffoldResult;
	templates: TemplateResult;
}
