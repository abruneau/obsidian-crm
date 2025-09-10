import { Link, MarkdownTaskItem } from "@blacksmithgu/datacore";
import { DatacoreService } from "src/lib/DatacoreService";
import { TaskService } from "src/lib/TaskService";
import { useEffect, useRef, useMemo, useCallback, memo } from "react";
import { MarkdownRenderer } from "obsidian";
import { useAppAndPlugin } from "src/lib/AppContext";

interface TaskListProps {
	link: Link;
}

/**
 * Task List Component
 * 
 * Displays a hierarchical list of tasks associated with a page.
 * Tasks are rendered as markdown with interactive checkboxes that
 * can be toggled to update the task status in the original file.
 */
// Memoized task update handler to prevent recreation on every render
const TaskListComponent = memo(function TaskListComponent({ link }: TaskListProps) {
	const tasksRef = useRef<HTMLDivElement>(null);
	const { app, plugin } = useAppAndPlugin();
	const tasks = DatacoreService.queryTasks(link);
	
	// Memoize the task processing to avoid hook order issues
	const { taskList, flatTaskList } = useMemo(() => {
		if (tasks.length === 0) {
			return { taskList: "", flatTaskList: [] };
		}

		// Convert tasks to markdown format with hierarchy and collect flat list
		const convertTasksToMarkdown = (taskItems: MarkdownTaskItem[], depth = 0, flatList: MarkdownTaskItem[] = []): string => {
			const indent = "  ".repeat(depth); // 2 spaces per level
			
			return taskItems
				.map((task: MarkdownTaskItem) => {
					let taskLine = "";
					if (task.$type === "task") {
						// const status = task.$completed ? 'x' : ' ';
						taskLine = `${indent}- [${task.$status}] ${task.$text}`;
						// Add to flat list for checkbox mapping
						flatList.push(task);
					} else {
						taskLine = `${indent}- ${task.$text}`;
					}
					
					// Recursively process child elements
					if (task.$elements && task.$elements.length > 0) {
						const children = convertTasksToMarkdown(task.$elements as MarkdownTaskItem[], depth + 1, flatList);
						return `${taskLine}\n${children}`;
					}
					
					return taskLine;
				})
				.join("\n");
		};

		// Filter out tasks that are children of other tasks to avoid duplication
		const getRootTasks = (allTasks: MarkdownTaskItem[]): MarkdownTaskItem[] => {
			const allChildTasks = new Set<string>();
			
			// Collect all child task IDs
			const collectChildTasks = (tasks: MarkdownTaskItem[]) => {
				tasks.forEach(task => {
					if (task.$elements) {
						task.$elements.forEach(child => {
							const childId = child.$id || child.$text || '';
							if (childId) allChildTasks.add(childId);
							collectChildTasks([child] as MarkdownTaskItem[]);
						});
					}
				});
			};
			
			collectChildTasks(allTasks);
			
			// Return only tasks that are not children of other tasks
			return allTasks.filter(task => {
				const taskId = task.$id || task.$text || '';
				return taskId && !allChildTasks.has(taskId);
			});
		};

		const rootTasks = getRootTasks(tasks);
		const flatTaskList: MarkdownTaskItem[] = [];
		const taskList = convertTasksToMarkdown(rootTasks, 0, flatTaskList);
		
		return { taskList, flatTaskList };
	}, [tasks]);

	// Memoized task update handler to prevent recreation on every render
	const handleTaskUpdate = useCallback(async (taskToUpdate: MarkdownTaskItem, isCompleted: boolean) => {
		await TaskService.updateTaskStatus(taskToUpdate, isCompleted, app);
	}, [app]);

	useEffect(() => {
		if (tasksRef.current && taskList) {
			tasksRef.current.empty();
			MarkdownRenderer.render(
				app,
				taskList,
				tasksRef.current,
				"",
				plugin
			);

			// Use requestAnimationFrame to defer DOM queries and avoid forced reflow
			requestAnimationFrame(() => {
				if (!tasksRef.current) return;
				
				// Add event listeners to handle task updates
				const checkboxes = tasksRef.current.querySelectorAll('input[type="checkbox"]');
				const cleanupFunctions: (() => void)[] = [];
				
				checkboxes.forEach((checkbox, index) => {
					const taskToUpdate = flatTaskList[index];
					if (taskToUpdate) {
						const handleChange = async (event: Event) => {
							const target = event.target as HTMLInputElement;
							await handleTaskUpdate(taskToUpdate, target.checked);
						};
						
						checkbox.addEventListener('change', handleChange);
						cleanupFunctions.push(() => checkbox.removeEventListener('change', handleChange));
					}
				});
				
				// Return cleanup function
				return () => {
					cleanupFunctions.forEach(cleanup => cleanup());
				};
			});
		}
	}, [taskList, app, plugin, flatTaskList, handleTaskUpdate]);





	return (
		<div className="task-list-container">
			{tasks.length === 0 ? (
				<div>No tasks found for this meeting.</div>
			) : (
				<div ref={tasksRef} className="task-list-markdown"></div>
			)}
		</div>
	);
});

export { TaskListComponent };
