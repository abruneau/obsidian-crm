import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { ObsidianCRMSettingTab } from './src/settings/SettingsTab';
import { ObsidianCRMSettings, DEFAULT_SETTINGS } from './constants';
import CRMSideBarView from './src/sidebar/CRMSideBarView';

/**
 * Obsidian CRM Plugin
 * 
 * A comprehensive CRM plugin for Obsidian that provides:
 * - AI-powered meeting summaries using LLM integration
 * - Task management and tracking
 * - Contact and company information management
 * - Integration with Datacore for data querying
 * 
 * @author Your Name
 * @version 1.0.0
 */
export default class ObsidianCRMPlugin extends Plugin {
	settings: ObsidianCRMSettings;

	async onload() {
		await this.loadSettings();

		// Register the sidebar view
		this.registerView("crm-sidebar", (leaf: WorkspaceLeaf) => new CRMSideBarView(leaf, this));

		// Add ribbon icon for quick access
		this.addRibbonIcon('brain', 'CRM', () => {
			const leafs = this.app.workspace.getLeavesOfType("crm-sidebar");
			if (leafs.length > 0) {
				const leaf = leafs[0];
				if (this.app.workspace.rightSplit.collapsed) {
					this.app.workspace.revealLeaf(leaf)
				} else {
					this.app.workspace.rightSplit.collapse()
				}
			} else {
				const leaf = this.app.workspace.getRightLeaf(false);

				leaf?.setViewState({
					type: "crm-sidebar",
					active: true
				})
				if (leaf instanceof WorkspaceLeaf) {
					this.app.workspace.revealLeaf(leaf);
				}
			}
		});

		// Listen for file-open events to update the CRM sidebar
		this.registerEvent(
			this.app.workspace.on('file-open', (file) => {
				this.updateCRMSidebar(file);
			})
		);

		// Add settings tab
		this.addSettingTab(new ObsidianCRMSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Update the CRM sidebar when a file is opened
	updateCRMSidebar(file: TFile | null) {
		const leaves = this.app.workspace.getLeavesOfType("crm-sidebar");
		leaves.forEach(leaf => {
			const crmView = leaf.view as CRMSideBarView;
			if (crmView && typeof crmView.updateActiveFile === 'function') {
				crmView.updateActiveFile(file);
			}
		});
	}
}
