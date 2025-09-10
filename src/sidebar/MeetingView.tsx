import { Link, MarkdownPage} from "@blacksmithgu/datacore";
import { TaskListComponent } from "src/component/ui/TaskListComponent";

interface MeetingViewProps {
	currentPage: MarkdownPage;
}

export function MeetingView({ currentPage }: MeetingViewProps) {
	const account = currentPage.value("account") as Link;
	return <TaskListComponent link={account} />;
}
