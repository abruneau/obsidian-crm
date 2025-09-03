import { MarkdownPage } from '@blacksmithgu/datacore';
import { ContentType } from './types';

/**
 * Content management utility class
 * 
 * This class provides methods for analyzing and categorizing content
 * based on tags and other metadata from Datacore pages.
 */
export class ContentManager {
	/**
	 * Determines the content type based on tags
	 * @param tags - Array of tags from a Datacore page
	 * @returns ContentType object with type, label, and description
	 */
	static getContentType(tags: string[]): ContentType {
		// Helper function to check if any tag matches a pattern
		const hasTagPattern = (patterns: string[]): boolean => {
			return patterns.some(pattern => 
				tags.some(tag => {
					// Convert pattern to regex for wildcard matching
					const regexPattern = pattern
						.replace(/\//g, '\\/')  // Escape forward slashes
						.replace(/\*/g, '.*')    // Convert * to regex wildcard
						.replace(/\?/g, '.');    // Convert ? to regex single character
					
					const regex = new RegExp(`^${regexPattern}$`);
					return regex.test(tag);
				})
			);
		};
		
		if (hasTagPattern(['meeting'])) {
			return {
				type: 'meeting',
				label: 'Meeting Tasks & Actions',
				description: 'Tasks and actions linked to this meeting:',
			};
		} else if (hasTagPattern(['contact*', 'person*', 'individual*'])) {
			return {
				type: 'contacts',
				label: 'Contact Information',
				description: 'Generate contact summaries',
			};
		} else if (hasTagPattern(['company*', 'BU*', 'oppy'])) {
			return {
				type: 'company',
				label: 'Business Summary Generator',
				description: 'Generate meetings summaries',
			};
		} else {
			return {
				type: 'generic',
				label: 'Content Generator',
				description: 'Generate AI-powered summaries of your content.',
			};
		}
	}

	/**
	 * Extracts and normalizes tags from a Datacore page
	 * @param page - The MarkdownPage to extract tags from
	 * @returns Array of normalized tag strings (without # prefix)
	 */
	static extractTagsFromDatacorePage(page: MarkdownPage): string[] {
		try {
			const tags = page.$tags || [];
			
			if (Array.isArray(tags)) {
				return tags.map(tag => typeof tag === 'string' ? tag.replace('#', '') : String(tag).replace('#', ''));
			}
			
			return [];
		} catch (error) {
			console.error('Error extracting tags from Datacore page:', error);
			return [];
		}
	}
}
