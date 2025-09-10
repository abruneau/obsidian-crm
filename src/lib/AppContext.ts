import { App, TFile } from "obsidian";
import { createContext, useContext, useMemo } from "react";
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

// Memoized hook to get only the app instance
export function useAppInstance(): App {
	const { app } = useApp();
	return app;
}

// Memoized hook to get only the plugin instance
export function usePlugin(): ObsidianCRMPlugin {
	const { plugin } = useApp();
	return plugin;
}

// Memoized hook to get app and plugin together (most common use case)
export function useAppAndPlugin(): { app: App; plugin: ObsidianCRMPlugin } {
	const { app, plugin } = useApp();
	return useMemo(() => ({ app, plugin }), [app, plugin]);
}

