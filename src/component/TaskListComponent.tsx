import { MarkdownPage, MarkdownTaskItem } from "@blacksmithgu/datacore";
import { DatacoreService } from "../lib/DatacoreService";
import { TaskService } from "../lib/TaskService";
import { useEffect, useRef, useMemo } from "react";
import { MarkdownRenderer } from "obsidian";
import { useApp } from "../lib/AppContext";

interface TaskListProps {
	currentPage: MarkdownPage;
}

/**
 * Task List Component
 * 
 * Displays a hierarchical list of tasks associated with a page.
 * Tasks are rendered as markdown with interactive checkboxes that
 * can be toggled to update the task status in the original file.
 */
export function TaskListComponent({ currentPage }: TaskListProps) {
	const tasksRef = useRef<HTMLDivElement>(null);
	const { app, plugin } = useApp();
	const tasks = DatacoreService.queryTasks(currentPage);
	
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

			// Add event listeners to handle task updates
			const checkboxes = tasksRef.current.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach((checkbox, index) => {
				checkbox.addEventListener('change', async (event) => {
					const target = event.target as HTMLInputElement;
					const taskToUpdate = flatTaskList[index];
					if (taskToUpdate) {
						await TaskService.updateTaskStatus(taskToUpdate, target.checked, app);
					}
				});
			});
		}
	}, [taskList, app, plugin]);





	return (
		<div className="task-list-container">
			<h3>Tasks</h3>
			{tasks.length === 0 ? (
				<div>No tasks found for this meeting.</div>
			) : (
				<div ref={tasksRef} className="task-list-markdown"></div>
			)}
		</div>
	);
}
