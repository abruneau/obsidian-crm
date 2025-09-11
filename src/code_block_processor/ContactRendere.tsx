import { MarkdownPage } from "@blacksmithgu/datacore";
import { memo, useMemo } from "react";
import { ListView } from "src/component/ui/List";
import { OrgChartComponent } from "src/component/ui/OrgChartComponent";
import moment from "moment";
import { TabComponent } from "src/component/ui/TabComponent";

function LinkedinLink({ current }: { current: any }) {
	const linkedin = current.value("linkedin");
	const name = current.$name;
	const href = linkedin
		? linkedin
		: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
				name
		  )}&origin=GLOBAL_SEARCH_HEADER`;

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			style={{ marginRight: 8 }}
		>
			<img
				src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
				alt="LinkedIn"
				style={{ width: 20, verticalAlign: "middle" }}
			/>
			<span style={{ marginLeft: 4 }}>LinkedIn</span>
		</a>
	);
}

function ListMeetings({ meetings }: { meetings: MarkdownPage[] }) {
	if (!meetings.length) {
		return <div>No meetings found.</div>;
	}

	return (
		<ListView
			scrollOnPaging={false}
			paging={10}
			rows={meetings}
			renderer={(meeting: MarkdownPage) => meeting.$link}
		/>
	);
}

function OrgChartBlock({ current }: { current: MarkdownPage }) {
	let content = <div>No org chart found.</div>;

	const managerPath = current.value("manager")?.path;
	const manager = managerPath ? datacore.page(managerPath) : null;

	const dependencies = useMemo(() => {
		let contacts = datacore.query(
			`@page and #contacts and linksto(${current.$link})`
		) as MarkdownPage[];
		contacts = contacts.filter((c) =>
			c.value("manager")?.includes(current.$name)
		);

		// Format dependencies to match the GraphNode structure expected by OrgChart
		const deps = contacts.map((c) => ({
			child: { main: c.$name || "Unknown", sub: c.value("role") || "" },
			parent: {
				main: current.$name || "Unknown",
				sub: current.value("role") || "",
			},
		}));

		if (manager) {
			deps.push({
				child: {
					main: current.$name || "Unknown",
					sub: current.value("role") || "",
				},
				parent: {
					main: manager.$name || "Unknown",
					sub: manager.value("role") || "",
				},
			});
		}
		return deps;
	}, [current, manager]);

	if (dependencies.length) {
		content = (
			<OrgChartComponent
				dependencies={dependencies}
				current={current}
				id="contacts-org-chart"
			/>
		);
	}

	return content;
}

export const ContactRenderer = memo(function ContactRenderer({
	currentPage,
}: {
	currentPage: MarkdownPage;
}) {
	const meetings = useMemo(() => {
		return datacore
			.query(
				`@page and #meeting and linksto(${currentPage.$link}) and start_date != ""`
			)
			.sort(
				(a: MarkdownPage, b: MarkdownPage) =>
					moment(b.value("start_date")).valueOf() -
					moment(a.value("start_date")).valueOf()
			);
	}, [currentPage]);

	const tabs = useMemo(() => {
		return [
			{
				title: `Meetings (${meetings.length})`,
				component: ListMeetings,
				props: { meetings },
			},
			{
				title: "Org Chart",
				component: OrgChartBlock,
				props: { current: currentPage },
			},
		];
	}, [meetings, currentPage]);

	return (
		<div>
			<LinkedinLink current={currentPage} />

			<TabComponent tabs={tabs} />
		</div>
	);
});
