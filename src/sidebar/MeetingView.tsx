import { MarkdownPage } from "@blacksmithgu/datacore";
import { TaskListComponent } from "src/component/TaskListComponent";

interface MeetingViewProps {
	currentPage: MarkdownPage;
}

export function MeetingView({ currentPage }: MeetingViewProps) {
	return <TaskListComponent currentPage={currentPage} />;
}
