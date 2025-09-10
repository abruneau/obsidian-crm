import { DatacoreService } from "src/lib/DatacoreService";
import { ErrorComponent } from "src/component/ui/ErrorComponent";
import { createRoot, Root } from "react-dom/client";
import { ReactView } from "src/component/ui/ReactView";
import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	TFile,
} from "obsidian";
import { ContentManager } from "src/model/ContentManager";
import { CompanyRenderer } from "./CompanyRenderer";
import { AppContext } from "src/lib/AppContext";
import ObsidianCRMPlugin from "../../main";
import { CRMContextProvider } from "src/component/markdown";

export class CRMRenderer extends MarkdownRenderChild {
	private activeFile: TFile | null = null;
	private setActiveFile: ((file: TFile | null) => void) | null = null;
	private root: Root;

	constructor(
		container: HTMLElement,
		private ctx: MarkdownPostProcessorContext,
		private thisPlugin: ObsidianCRMPlugin
	) {
		super(container);
		this.root = createRoot(container);

		// Call onload immediately to render the component
		this.onload();
	}

	public async onload() {

		// Check if Datacore is available
		if (!DatacoreService.isAvailable()) {
			this.root.render(
				<ErrorComponent
					title="Datacore plugin is not available"
					message="Please install and enable the Datacore plugin."
				/>
			);
			return;
		}

		const page = DatacoreService.getPage(this.ctx.sourcePath);

		if (!page) {
			this.root.render(
				<ErrorComponent
					title="Page not found"
					message="Please create a page"
				/>
			);
			return;
		}

		const tags = ContentManager.extractTagsFromDatacorePage(page);
		const contentType = ContentManager.getContentType(tags);

		let content = null;

		switch (contentType.type) {
			case "meeting":
				content = <ReactView />;
				break;
			case "contacts":
				content = <ReactView />;
				break;
			case "company":
				content = <CompanyRenderer currentPage={page} />;
				break;
			default:
				content = <ReactView />;
				break;
		}

		this.root.render(
			<AppContext.Provider value={{
				app: this.thisPlugin.app,
				plugin: this.thisPlugin,
				activeFile: this.activeFile,
				setActiveFile: this.setActiveFile,
			}}>
				<CRMContextProvider
					app={this.thisPlugin.app}
					component={this}
					settings={this.thisPlugin.settings}
				>
					{content}
				</CRMContextProvider>
			</AppContext.Provider>
		);
	}
}
