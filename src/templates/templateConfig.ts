/**
 * Template configuration for CRM templates
 * 
 * This file defines the metadata and configuration for all CRM templates.
 * Each template entry includes the filename, display name, and description.
 */

import { ContactTemplate } from "./templater/ContactTemplate.md";
import { CompanyTemplate } from "./templater/CompanyTemplate.md";
import { MeetingTemplate } from "./templater/MeetingTemplate.md";
import { OpportunityTemplate } from "./templater/OpportunityTemplate.md";
import { BUTemplate } from "./templater/BUTemplate.md";

export interface TemplateConfig {
	filename: string;
	displayName: string;
	description: string;
	targetFolder: string;
	template: string;
}

/**
 * Configuration for all available CRM templates
 */
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
	{
		filename: 'BUTemplate.md',
		displayName: 'BU Template',
		description: 'Template for creating BU records with name, parent, and products',
		targetFolder: 'CRM/Companies/0 BU',
		template: BUTemplate
	},
	{
		filename: 'ContactTemplate.md',
		displayName: 'Contact Template',
		description: 'Template for creating contact records with company, role, and contact information',
		targetFolder: 'CRM/Contacts',
		template: ContactTemplate
	},
	{
		filename: 'CompanyTemplate.md',
		displayName: 'Company Template',
		description: 'Template for creating company profiles with industry, size, and business information',
		targetFolder: 'CRM/Companies',
		template: CompanyTemplate
	},
	{
		filename: 'MeetingTemplate.md',
		displayName: 'Meeting Template',
		description: 'Template for meeting notes with agenda, attendees, and action items',
		targetFolder: 'CRM/Interactions',
		template: MeetingTemplate
	},
	{
		filename: 'OpportunityTemplate.md',
		displayName: 'Opportunity Template',
		description: 'Template for sales opportunities with value, probability, and next steps',
		targetFolder: 'CRM/Opportunities',
		template: OpportunityTemplate
	}
];

/**	
 * Gets the list of available template names
 */
export function getAvailableTemplateNames(): string[] {
	return TEMPLATE_CONFIGS.map(config => config.displayName);
}

/**
 * Gets the configuration for a specific template
 */
export function getTemplateConfig(templateName: string): TemplateConfig | undefined {
	return TEMPLATE_CONFIGS.find(config => config.displayName === templateName);
}

/**
 * Gets all template configurations
 */
export function getAllTemplateConfigs(): TemplateConfig[] {
	return TEMPLATE_CONFIGS;
}

/**
 * Helper function to get template configs as an array, handling both array and object formats
 * This ensures compatibility with different runtime formats
 */
export function getTemplateConfigsAsArray(): TemplateConfig[] {
	return Array.isArray(TEMPLATE_CONFIGS) ? TEMPLATE_CONFIGS : Object.values(TEMPLATE_CONFIGS) as TemplateConfig[];
}
