import { MarkdownPage } from "@blacksmithgu/datacore";
import moment from "moment";
import { useMemo, memo } from "react";
import { ListView } from "src/component/ui/List";
import { ObsidianLink } from "src/component/markdown";
import { OrgChartComponent } from "src/component/ui/OrgChartComponent";
import { TabComponent } from "src/component/ui/TabComponent";
import { TaskListComponent } from "src/component/ui/TaskListComponent";
import { DatacoreService } from "src/lib/DatacoreService";
import { TableView } from "src/component/ui/Table";

function getSubBU(parent: MarkdownPage) {
	return DatacoreService.getChildrenR(parent, "(#project OR #BU)").map(
		(p) => p.child
	);
}

function AccountOrg({ current }: { current: MarkdownPage }) {
	const parentPath = current.value("parent")?.path;
	const parent = parentPath ? datacore.page(parentPath) : null;

	const dependencies = useMemo(() => {
		// Get BUs and Projects recursively
		let children = DatacoreService.getChildrenR(
			current,
			"(#project OR #BU)"
		);
		// Add subsidaries
		children = children.concat(
			DatacoreService.getChildren(current, "#company").map((p) => ({
				parent: current,
				child: p,
			}))
		);
		const dep = children.map((c) => ({
			child: { main: c.child.$name, sub: "" },
			parent: { main: c.parent.$name, sub: "" },
		}));
		if (parent) {
			dep.push({
				child: { main: current.$name, sub: "" },
				parent: { main: parent.$name, sub: "" },
			});
		}
		return Array.isArray(dep) ? dep : [];
	}, [current, parent]);

	return (
		<OrgChartComponent
			dependencies={dependencies}
			current={current}
			id="account-org-chart"
		/>
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

function Povs({ current }: { current: MarkdownPage }) {
	let content = <div>No oppies found.</div>;
	const filters = "#oppy";

	const children = datacore.query(
		`@page and ${filters} and account.contains(${current.$link}) and stage != "WIN" and stage != "LOST"`
	);

	if (children.length) {
		content = (
			<ListView
				scrollOnPaging={false}
				paging={10}
				rows={children}
				renderer={(children: MarkdownPage) => (
					<ObsidianLink link={children.$link} />
				)}
			/>
		);
	}

	return content;
}

function Ecosystem({ meetings }: { meetings: MarkdownPage[] }) {
	let content = <div>No ecosystem found.</div>;

	const software = useMemo(() => {
		const allSoftware = meetings
			.flatMap((m) =>
				m.$links
					.map((l) => datacore.page(l.path))
					.filter(
						(s) =>
							s &&
							s.$tags &&
							(s.$tags.includes("#software") ||
								s.$tags.includes("#programming_language")) &&
							!s.$tags.includes("#company/competitor")
					)
			)
			.filter((s) => s !== undefined);

		const uniqueSoftware = Array.from(
			new Map(allSoftware.map((s) => [s.$name, s])).values()
		);

		return uniqueSoftware.sort((a, b) => a.$name.localeCompare(b.$name));
	}, [meetings]);

	if (software.length) {
		content = (
			<div className="multi-column-list-block">
				<ListView
					scrollOnPaging={false}
					rows={software}
					renderer={(software: MarkdownPage) => software.$link}
				/>
			</div>
		);
	}

	return content;
}

function Competition({ meetings }: { meetings: MarkdownPage[] }) {
	let content = <div>No competition found.</div>;

	const software = useMemo(() => {
		const allCompetitors = meetings
			.flatMap((m) =>
				m.$links
					.map((l) => datacore.page(l.path))
					.filter(
						(s) =>
							s &&
							s.$tags &&
							s.$tags.includes("#company/competitor")
					)
			)
			.filter((s) => s !== undefined);

		const uniqueCompetitors = Array.from(
			new Map(allCompetitors.map((s) => [s.$name, s])).values()
		);

		return uniqueCompetitors.sort((a, b) => a.$name.localeCompare(b.$name));
	}, [meetings]);

	if (software.length) {
		content = (
			<div className="multi-column-list-block">
				<ListView
					scrollOnPaging={false}
					rows={software}
					renderer={(software: MarkdownPage) => software.$link}
				/>
			</div>
		);
	}

	return content;
}

// Memoized Contacts component to prevent unnecessary re-renders
const Contacts = memo(function Contacts({ current, isBU }: { current: MarkdownPage; isBU: boolean }) {
	const contacts = useMemo(() => {
		let ctcs: MarkdownPage[] = [];
		if (isBU) {
			const subBU = getSubBU(current);
			subBU.forEach((bu) => {
				ctcs = ctcs.concat(
					datacore.query(
						`@page and #contacts and team.contains(${bu.$link})`
					) as MarkdownPage[]
				);
			});
		} else {
			ctcs = datacore.query(
				`@page and #contacts and company.contains(${current.$link})`
			) as MarkdownPage[];
		}
		return ctcs
			.map((c) => {
				// Add meeting count as a property for table display
				(c as any).meeting_number = datacore.query(
					`@page and #meeting and linksto(${c.$link})`
				).length;
				return c;
			})
			.sort((a, b) => a.$name.localeCompare(b.$name));
	}, [current, isBU]);

	// Memoize columns to prevent recreation on every render
	const columns = useMemo(() => [
		{ id: "Name", value: (row: MarkdownPage) => row.$link },
		{ id: "Role", value: (row: MarkdownPage) => row.value("role") },
		{ id: "Team", value: (row: MarkdownPage) => row.value("team") },
		{ id: "Email", value: (row: MarkdownPage) => row.value("email") },
		{ id: "Meetings", value: (row: MarkdownPage) => (row as any).meeting_number },
	], []);

	if (contacts.length === 0) {
		return <div>No contacts found.</div>;
	}

	return <TableView paging={20} columns={columns} rows={contacts} />;
});

function OrgChart({ current }: { current: MarkdownPage }) {
	let content = <div>No org chart found.</div>;

	const dependencies = useMemo(() => {
		let contacts = datacore.query(
			`@page and #contacts and company.contains(${current.$link}) or team.contains(${current.$link})`
		) as MarkdownPage[];
		const subBU = getSubBU(current);
		subBU.forEach((bu) => {
			contacts = contacts.concat(
				datacore.query(
					`@page and #contacts and team.contains(${bu.$link})`
				) as MarkdownPage[]
			) as MarkdownPage[];
		});

		return contacts
			.filter(
				(item, index, self) =>
					index === self.findIndex((t) => t.$name === item.$name)
			)
			.map((c) => {
				const managerPath = c.value("manager")?.path;
				const manager = managerPath ? datacore.page(managerPath) : null;
				const parent = manager ? manager : current;
				return {
					child: { main: c.$name, sub: c.value("role") },
					parent: { main: parent.$name, sub: parent.value("role") },
				};
			});
	}, [current]);

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

function AccountTeam({ meetings }: { meetings: MarkdownPage[] }) {
	let content = <div>No team members found.</div>;

	const teamMembers = useMemo(() => {
		try {
			const contacts = meetings
				.slice(0, 10)
				.flatMap((m) =>
					m.$links
						.flatMap((l) => datacore.page(l.path))
						.filter(
							(s) => s && s.$tags && s.$tags.includes("#contacts")
						)
						.filter(
							(s) =>
								s &&
								s.value("company")?.path ===
									"CRM/Companies/Datadog.md"
						)
				)
				.filter((s) => s !== undefined);

			// Remove duplicates based on file name
			const uniqueContacts = Array.from(
				new Map(contacts.map((c) => [c.$name, c])).values()
			);

			const AE = uniqueContacts.filter(
				(p) =>
					p.value("role")?.includes("Enterprise Sales Executive") ||
					p.value("role")?.includes("Account Executive")
			);

			const CSM = uniqueContacts.filter((p) =>
				p.value("role")?.includes("Customer Success Manager")
			);

			const TAM = uniqueContacts.filter((p) =>
				p.value("role")?.includes("Technical Account Manager")
			);

			return { AE, CSM, TAM };
		} catch (err) {
			console.error("Error getting account team:", err);
			return { AE: [], CSM: [], TAM: [] };
		}
	}, [meetings]);

	if (
		teamMembers.AE.length ||
		teamMembers.CSM.length ||
		teamMembers.TAM.length
	) {
		content = (
			<div>
				{teamMembers.AE.length > 0 && (
					<div style={{ marginBottom: "1em" }}>
						<strong>AE:</strong>{" "}
						{teamMembers.AE.map((c) => (
							<ObsidianLink key={c.$name} link={c.$link} />
						)).reduce(
							(prev, curr, index) => [
								prev,
								index > 0 ? ", " : "",
								curr,
							],
							[]
						)}
					</div>
				)}
				{teamMembers.CSM.length > 0 && (
					<div style={{ marginBottom: "1em" }}>
						<strong>CSM:</strong>{" "}
						{teamMembers.CSM.map((c) => (
							<ObsidianLink key={c.$name} link={c.$link} />
						)).reduce(
							(prev, curr, index) => [
								prev,
								index > 0 ? ", " : "",
								curr,
							],
							[]
						)}
					</div>
				)}
				{teamMembers.TAM.length > 0 && (
					<div style={{ marginBottom: "1em" }}>
						<strong>TAM:</strong>{" "}
						{teamMembers.TAM.map((c) => (
							<ObsidianLink key={c.$name} link={c.$link} />
						)).reduce(
							(prev, curr, index) => [
								prev,
								index > 0 ? ", " : "",
								curr,
							],
							[]
						)}
					</div>
				)}
			</div>
		);
	}

	return content;
}

function Tasks({ current }: { current: MarkdownPage }) {
	return <TaskListComponent link={current.$link} />;
}

// Memoized CompanyRenderer to prevent unnecessary re-renders
export const CompanyRenderer = memo(function CompanyRenderer({
	currentPage,
}: {
	currentPage: MarkdownPage;
}) {
	const meetings = useMemo(() => {
		return datacore
			.query(
				`@page and (#meeting or #project) and account.contains(${currentPage.$link}) and start_date != ""`
			)
			.sort(
				(a: MarkdownPage, b: MarkdownPage) =>
					moment(b.value("start_date")).valueOf() -
					moment(a.value("start_date")).valueOf()
			) as MarkdownPage[];
	}, [currentPage]);

	const isBU = useMemo(() => currentPage.$tags.includes("#BU"), [currentPage.$tags]);
	const isPartner = useMemo(() => currentPage.$tags.includes("#company/partner"), [currentPage.$tags]);

	// Memoize tabs to prevent recreation on every render
	const tabs = useMemo(() => {
		if (isPartner) {
			return [
				{
					title: "Meetings",
					component: ListMeetings,
					props: { meetings },
				},
				{
					title: "Contacts",
					component: Contacts,
					props: { current: currentPage, isBU },
				},
			];
		} else {
			return [
				{
					title: "Meetings",
					component: ListMeetings,
					props: { meetings },
				},
				{ title: "Oppy", component: Povs, props: { current: currentPage } },
				{
					title: "Ecosystem",
					component: Ecosystem,
					props: { meetings },
				},
				{
					title: "Competition",
					component: Competition,
					props: { meetings },
				},
				{
					title: "Contacts",
					component: Contacts,
					props: { current: currentPage, isBU },
				},
				{
					title: "Org Chart",
					component: OrgChart,
					props: { current: currentPage },
				},
				{
					title: "Account Structure",
					component: AccountOrg,
					props: { current: currentPage },
				},
			];
		}
	}, [isPartner, meetings, currentPage, isBU]);

	return (
		<div>
			{!isPartner && (
				<>
					{/* <Links current={currentPage} /> */}
					<AccountTeam meetings={meetings} />
					<Tasks current={currentPage} />
					{/* <MeetingSummaryComponent meetings={meetings} /> */}
				</>
			)}
			<TabComponent tabs={tabs} />
		</div>
	);
});
