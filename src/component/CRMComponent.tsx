import { useActiveFile } from "./markdown";
import { DatacoreService } from "../lib/DatacoreService";
import { ContentManager } from "../model";
import { CompanyView } from "src/sidebar/CompanyView";
import { MeetingView } from "src/sidebar/MeetingView";
import { ContactView } from "src/sidebar/ContactView";

/**
 * Main CRM Component
 * 
 * This is the primary component that renders the CRM interface.
 * It determines the content type based on the active file's tags
 * and renders the appropriate view (meeting, contact, company, or generic).
 */
export function CRMComponent() {
	const activeFile = useActiveFile();

	if (!activeFile) {
		return (
			<div className="crm-no-file">
				<h2>CRM Panel</h2>
				<p>
					No file is currently active. Open a file to see CRM
					features.
				</p>
			</div>
		);
	}

	const genericContent = (
		<div className="crm-default-content">
			<h2>File: {activeFile.basename}</h2>
			<p>This file doesn't match any specific CRM categories.</p>
			<div className="file-info">
				<p>
					<strong>Path:</strong> {activeFile.path}
				</p>
				<p>
					<strong>Size:</strong> {activeFile.stat.size} bytes
				</p>
				<p>
					<strong>Modified:</strong>{" "}
					{new Date(activeFile.stat.mtime).toLocaleString()}
				</p>
			</div>
		</div>
	);

	// Check if Datacore is available
	if (!DatacoreService.isAvailable()) {
		return genericContent;
	}

	// Get current page from Datacore
	const currentPage = DatacoreService.getPage(activeFile.path);
	if (!currentPage) {
		return genericContent;
	}

	// Get tags and determine content type
	const tags = ContentManager.extractTagsFromDatacorePage(currentPage);
	const contentType = ContentManager.getContentType(tags);

	const renderContent = () => {
		switch (contentType.type) {
			case "meeting":
				return <MeetingView currentPage={currentPage}/>
			case "contacts":
				return <ContactView currentPage={currentPage}/>
			case "company":
				return <CompanyView currentPage={currentPage}/>
			default:
				return genericContent
		}
	}

	return (
		<div className="crm-main-container">
			<div className="crm-header">
				<h1>CRM Panel</h1>
				<div className="active-file-info">
					<strong>Active File:</strong> {activeFile.basename}
				</div>
			</div>
			<div className="crm-content">{renderContent()}</div>
		</div>
	);
}
