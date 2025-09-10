import { MarkdownPage } from "@blacksmithgu/datacore";
import MeetingSummaryComponent from "src/component/ui/MeetingSummaryComponent";
import { DatacoreService } from "src/lib/DatacoreService";
import { filterPastMeetings, hasMeetings, getNoMeetingsMessage, getNoPastMeetingsMessage } from "src/utils/meetingUtils";
import { memo } from "react";

interface ContactViewProps {
	currentPage: MarkdownPage;
}

export const ContactView = memo(function ContactView({ currentPage }: ContactViewProps) {
	const meetings = DatacoreService.queryMeetings(currentPage);
	
	if (!hasMeetings(meetings)) {
		return <div>{getNoMeetingsMessage("contact")}</div>;
	}
	
	const pastMeetings = filterPastMeetings(meetings, 10);

	if (pastMeetings.length === 0) {
		return <div>{getNoPastMeetingsMessage()}</div>;
	}

	return <MeetingSummaryComponent meetings={pastMeetings} />
});
