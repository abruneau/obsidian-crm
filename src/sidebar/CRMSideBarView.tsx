import { IconName, ItemView, WorkspaceLeaf, TFile, MarkdownView } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import ObsidianCRMPlugin from "../../main";
import React, { useState, useEffect } from "react";
import { CRMComponent } from "../component/CRMComponent";
import { CRMContextProvider } from "../component/markdown";

export default class CRMSideBarView extends ItemView {
	root: Root | null = null;
	private activeFile: TFile | null = null;
	private setActiveFile: ((file: TFile | null) => void) | null = null;

	constructor(leaf: WorkspaceLeaf,
				private thisPlugin: ObsidianCRMPlugin
	) {
		super(leaf);
	}

	getViewType() {
		return "crm-sidebar"
	}

	getDisplayText() {
		return "CRM";
	}

	override async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);

		// Create a wrapper component to manage state
		const CRMWrapper = () => {
			const [activeFile, setActiveFile] = useState<TFile | null>(null);
			
			// Store the setter for external access
			this.setActiveFile = setActiveFile;

			// Set initial active file
			useEffect(() => {
				const activeView = this.thisPlugin.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView && activeView.file) {
					setActiveFile(activeView.file);
				}
			}, []);

			return (
				<CRMContextProvider
					component={this}
					plugin={this.thisPlugin}
					activeFile={activeFile}
					setActiveFile={setActiveFile}
				>
					<CRMComponent/>
				</CRMContextProvider>
			);
		};

		this.root.render(<CRMWrapper />);
	}

	override async onClose() {
		this.root?.unmount()
	}

	override getIcon(): IconName {
		return 'egg'
	}

	// Method to update the active file from external sources
	updateActiveFile(file: TFile | null) {
		if (this.setActiveFile) {
			this.setActiveFile(file);
		}
	}
}
