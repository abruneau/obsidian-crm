import { MarkdownTaskItem } from "@blacksmithgu/datacore";
import { App, TFile } from "obsidian";

/**
 * Service class for managing task operations
 * 
 * This service handles task status updates and file modifications
 * to keep task states synchronized between the UI and the original files.
 */
export class TaskService {
	/**
	 * Updates the status of a task in the original file
	 * @param taskItem - The MarkdownTaskItem to update
	 * @param isCompleted - Whether the task should be marked as completed
	 * @param app - The Obsidian App instance
	 */
	static async updateTaskStatus(taskItem: MarkdownTaskItem, isCompleted: boolean, app: App): Promise<void> {
		try {
			console.log('taskToUpdate', taskItem);
			if (!taskItem) return;

			// Get the file where this task is located using Datacore's $file property
			const taskFilePath = taskItem.$file;
			const file = app.vault.getAbstractFileByPath(taskFilePath);
			if (!file || !(file instanceof TFile)) return;

			const content = await app.vault.cachedRead(file);
			
			// Use the task's position information for precise updates
			const lines = content.split('\n');
			const newStatus = isCompleted ? 'x' : ' ';
			
			// Use the position information to find the exact line
			const position = taskItem.$position;
			if (position && position.start >= 0 && position.start < lines.length) {
				// Update the specific line using position information
				const lineIndex = position.start;
				const line = lines[lineIndex];
				if (line.includes(`[${taskItem.$status}] ${taskItem.$text}`)) {
					lines[lineIndex] = line.replace(`[${taskItem.$status}]`, `[${newStatus}]`);
				}
			} else {
				// Fallback: search for the task text if position is not available
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					if (line.includes(`[${taskItem.$status}] ${taskItem.$text}`)) {
						lines[i] = line.replace(`[${taskItem.$status}]`, `[${newStatus}]`);
						break;
					}
				}
			}
			
			// Write the updated content back to the file
			const updatedContent = lines.join('\n');
			await app.vault.modify(file, updatedContent);
			
			// Trigger Datacore refresh for the specific file
			if (typeof datacore !== 'undefined' && datacore.core) {
				await datacore.core.reload(file);
			}
		} catch (error) {
			console.error('Error updating task status:', error);
		}
	}
}
