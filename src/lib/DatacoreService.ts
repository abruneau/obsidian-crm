import { Link, MarkdownPage, MarkdownTaskItem } from "@blacksmithgu/datacore";

/**
 * Service class for interacting with the Datacore plugin
 *
 * This service provides methods to query and retrieve data from Datacore,
 * including pages, meetings, and tasks. It handles error cases gracefully
 * and provides fallbacks when Datacore is not available.
 */
export class DatacoreService {
	/**
	 * Checks if the Datacore plugin is available and loaded
	 * @returns true if Datacore is available, false otherwise
	 */
	static isAvailable(): boolean {
		return typeof datacore !== "undefined";
	}

	/**
	 * Retrieves a page from Datacore by file path
	 * @param filePath - The path to the file in the vault
	 * @returns The MarkdownPage object or undefined if not found
	 */
	static getPage(filePath: string): MarkdownPage | undefined {
		try {
			return datacore.page(filePath);
		} catch (error) {
			console.error("Error getting Datacore page:", error);
			return undefined;
		}
	}

	/**
	 * Queries for meetings linked to a specific page
	 * @param page - The MarkdownPage to find linked meetings for
	 * @returns Array of meeting pages sorted by date (most recent first)
	 */
	static queryMeetings(page: MarkdownPage): MarkdownPage[] {
		try {
			const meetings = datacore.query(
				`@page and #meeting and linksto(${page.$link}) and start_date != ""`
			) as MarkdownPage[];

			// Sort by start_date descending (most recent first)
			return meetings.sort((a: MarkdownPage, b: MarkdownPage) => {
				const aDate = new Date(a.value("start_date")).getTime();
				const bDate = new Date(b.value("start_date")).getTime();
				return bDate - aDate;
			});
		} catch (error) {
			console.error("Error querying Datacore for meetings:", error);
			return [];
		}
	}

	/**
	 * Queries for tasks associated with a page's account
	 * @param page - The MarkdownPage to find tasks for
	 * @returns Array of incomplete tasks linked to the page's account
	 */
	static queryTasks(page: Link): MarkdownTaskItem[] {
		return datacore.query(
			`@task and childOf(${page}) and $completed = false`
		) as MarkdownTaskItem[];
	}

	static getChildren(parent: MarkdownPage, filters: string) {
		return datacore.query(
			`@page and ${filters} and parent.contains(${parent.$link})`
		) as MarkdownPage[];
	}

	static getChildrenR(parent: MarkdownPage, filters: string) {
		let children = DatacoreService.getChildren(parent, filters).map(
			(p) => ({
				parent: parent,
				child: p,
			})
		);

		if (children.length > 0) {
			children.forEach((c) => {
				children = children.concat(
					DatacoreService.getChildrenR(c.child, filters)
				);
			});
		}
		return children;
	}
}
