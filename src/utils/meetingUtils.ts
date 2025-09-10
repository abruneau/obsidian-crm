import { MarkdownPage } from "@blacksmithgu/datacore";

/**
 * Utility functions for meeting-related operations
 * 
 * This module provides shared logic for filtering and processing meetings
 * to avoid code duplication across components.
 */

/**
 * Filters meetings to only include past meetings and limits the results
 * @param meetings - Array of MarkdownPage objects representing meetings
 * @param limit - Maximum number of meetings to return (default: 10)
 * @returns Array of past meetings, limited to the specified count
 */
export const filterPastMeetings = (meetings: MarkdownPage[], limit = 10): MarkdownPage[] => {
	return meetings
		.filter((meeting) => {
			const startDate = meeting.value("start_date");
			// Use Date comparison instead of moment
			return startDate && new Date(startDate) <= new Date();
		})
		.slice(0, limit);
};

/**
 * Checks if there are any meetings available for a given page
 * @param meetings - Array of MarkdownPage objects representing meetings
 * @returns true if meetings array has items, false otherwise
 */
export const hasMeetings = (meetings: MarkdownPage[]): boolean => {
	return meetings && meetings.length > 0;
};

/**
 * Gets a user-friendly message when no meetings are found
 * @param context - The context (e.g., "company", "contact") for the message
 * @returns A formatted message string
 */
export const getNoMeetingsMessage = (context: string): string => {
	return `No meetings found for this ${context}.`;
};

/**
 * Gets a user-friendly message when no past meetings are found
 * @returns A formatted message string
 */
export const getNoPastMeetingsMessage = (): string => {
	return "No past meetings found for this page.";
};
