import { MarkdownPage } from "@blacksmithgu/datacore";
import MeetingSummaryComponent from "src/component/MeetingSummaryComponent";
import { DatacoreService } from "src/lib/DatacoreService";

interface ContactViewProps {
	currentPage: MarkdownPage;
}

export function ContactView({ currentPage }: ContactViewProps) {
	const meetings = DatacoreService.queryMeetings(currentPage);
	if (meetings.length === 0) {
		return <div>No meetings found for this contact.</div>;
	}
	// Filter meetings to only include past meetings and limit to 10
	const pastMeetings = meetings
		.filter((meeting) => {
			const startDate = meeting.value("start_date");
			// Use Date comparison instead of moment
			return startDate && new Date(startDate) <= new Date();
		})
		.slice(0, 10);

	if (pastMeetings.length === 0) {
		return <div>No past meetings found for this page.</div>;
	}

	return <MeetingSummaryComponent meetings={pastMeetings} />
}
