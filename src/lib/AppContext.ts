import { App, TFile } from "obsidian";
import { createContext, useContext } from "react";
import ObsidianCRMPlugin from "../../main";

interface AppContextType {
	app: App;
	plugin: ObsidianCRMPlugin;
	activeFile: TFile | null;
	setActiveFile: (file: TFile | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp(): AppContextType {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("App context is not available.");
	}
	return context;
}

export function useActiveFile(): TFile | null {
	const { activeFile } = useApp();
	return activeFile;
}

