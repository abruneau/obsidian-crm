/** Provides core preact / rendering utilities for all view types.
 * @module ui
 */
import { App, MarkdownRenderer } from "obsidian";
import { Component } from "obsidian";
import { Link, Literal, Literals } from "@blacksmithgu/datacore";
import { ObsidianCRMSettings } from "../../constants";

import { createContext, CSSProperties, useContext, useEffect, useRef } from "react";
import { PropsWithChildren, memo } from "react";
import { createRoot } from "react-dom/client";
import { Embed } from "src/component/embed";
import { ErrorComponent } from "src/component/ui/ErrorComponent";

export const COMPONENT_CONTEXT = createContext<Component>(undefined!);
export const APP_CONTEXT = createContext<App>(undefined!);
export const SETTINGS_CONTEXT = createContext<ObsidianCRMSettings>(undefined!);
export const CURRENT_FILE_CONTEXT = createContext<string>("");

/**
 * More compact provider for all of the datacore react contexts.
 * @hidden
 */
export function CRMContextProvider({
	children,
	app,
	component,
	settings,
}: PropsWithChildren<{
	app: App;
	component: Component;
	settings: ObsidianCRMSettings;
}>) {
	return (
		<COMPONENT_CONTEXT.Provider value={component}>
			<APP_CONTEXT.Provider value={app}>
				<SETTINGS_CONTEXT.Provider value={settings}>
					{children}
				</SETTINGS_CONTEXT.Provider>
			</APP_CONTEXT.Provider>
		</COMPONENT_CONTEXT.Provider>
	);
}

/** Renders an obsidian-looking link about 10x faster than using the markdown renderer. */
function RawLink({
	link,
}: {
	link: Link;
}) {
	
	return (
		<a className="internal-link" href={`${link.obsidianLink()}`}>
			{link.displayOrDefault()}
		</a>
	);
}

/** Copies how an Obsidian link is rendered but is about an order of magnitude faster to render than via markdown rendering. */
export const ObsidianLink = memo(RawLink);

function RawMarkdown({
	content,
	sourcePath: maybeSourcePath,
	inline = true,
	style,
	cls,
	onClick,
}: {
	content: string;
	sourcePath?: string;
	inline?: boolean;
	style?: CSSProperties;
	cls?: string;
	onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
}) {
	const container = useRef<HTMLElement | null>(null);
	const component = useContext(COMPONENT_CONTEXT);
	const defaultPath = useContext(CURRENT_FILE_CONTEXT);
	const app = useContext(APP_CONTEXT);

	const sourcePath = maybeSourcePath ?? defaultPath;

	useEffect(() => {
		if (!container.current) return;

		// Use requestAnimationFrame to defer DOM manipulation and avoid forced reflow
		requestAnimationFrame(() => {
			if (!container.current) return;
			
			container.current.replaceChildren(...[]);

			(async () => {
				if (!container.current || !inline) return;
				await MarkdownRenderer.render(
					app,
					content,
					container.current,
					sourcePath,
					component
				);

				// Have to check twice since the container might disappear during the async call.
				if (!container.current || !inline) return;

				// Unwrap any created paragraph elements if we are inline.
				// Use requestAnimationFrame to defer DOM queries and avoid forced reflow
				requestAnimationFrame(() => {
					if (!container.current) return;
					
					let paragraph = container.current.querySelector("p");
					while (paragraph) {
						const children = paragraph.childNodes;
						paragraph.replaceWith(...Array.from(children));
						paragraph = container.current.querySelector("p");
					}

					// have embeds actually load instead of displaying as plain text.
					let embed = container.current.querySelector(
						"span.internal-embed:not(.is-loaded)"
					);
					while (embed) {
						embed.empty();
						createRoot(embed).render(
							<APP_CONTEXT.Provider value={app}>
								<Embed
									link={Link.parseInner(
										embed.getAttribute("src") ?? ""
									)}
									sourcePath={sourcePath}
									inline={true}
								/>
							</APP_CONTEXT.Provider>
						);
						embed.addClass("is-loaded");
						embed = container.current.querySelector(
							"span.internal-embed:not(.is-loaded)"
						);
					}
				});
			})();
		});
	}, [content, sourcePath, inline, container.current]);

	return (
		<span ref={container} style={style} className={cls} onClick={onClick}>
			{content}
		</span>
	);
}

/** @internal Hacky preact component which wraps Obsidian's markdown renderer into a neat component. */
export const Markdown = memo(RawMarkdown);

/** Intelligently render an arbitrary literal value. */
function RawLit({
	value,
	sourcePath: maybeSourcePath,
	inline = false,
	depth = 0,
}: PropsWithChildren<{
	value: Literal | undefined;
	sourcePath?: string;
	inline?: boolean;
	depth?: number;
}>) {
	const settings = useContext(SETTINGS_CONTEXT);
	// const app = useContext(APP_CONTEXT);
	const defaultPath = useContext(CURRENT_FILE_CONTEXT);

	const sourcePath = maybeSourcePath ?? defaultPath;

	// Short-circuit if beyond the maximum render depth.
	if (depth >= settings.maxRecursiveRenderDepth) return <>...</>;

	if (Literals.isNull(value) || value === undefined) {
		return (
			<Markdown
				inline={inline}
				content={settings.renderNullAs}
				sourcePath={sourcePath}
			/>
		);
	} else if (Literals.isString(value)) {
		return (
			<Markdown inline={inline} content={value} sourcePath={sourcePath} />
		);
	} else if (Literals.isNumber(value)) {
		return <>{"" + value}</>;
	} else if (Literals.isBoolean(value)) {
		return <>{"" + value}</>;
	// } else if (Literals.isDate(value)) {
	// 	return (
	// 		<>
	// 			{renderMinimalDate(
	// 				value,
	// 				settings.defaultDateFormat,
	// 				settings.defaultDateTimeFormat,
	// 				currentLocale()
	// 			)}
	// 		</>
	// 	);
	// } else if (Literals.isDuration(value)) {
	// 	return <>{renderMinimalDuration(value)}</>;
	} else if (Literals.isLink(value)) {
		// // Special case handling of image/video/etc embeddings to bypass the Obsidian API not working.
		// if (isImageEmbed(value)) {
		// 	const realFile = app.metadataCache.getFirstLinkpathDest(
		// 		value.path,
		// 		sourcePath
		// 	);
		// 	if (!realFile)
		// 		return (
		// 			<Markdown
		// 				content={value.markdown()}
		// 				sourcePath={sourcePath}
		// 			/>
		// 		);

		// 	const dimensions = extractImageDimensions(value);
		// 	const resourcePath = app.vault.getResourcePath(realFile);

		// 	if (dimensions && dimensions.length == 2)
		// 		return (
		// 			<img
		// 				alt={value.path}
		// 				src={resourcePath}
		// 				width={dimensions[0]}
		// 				height={dimensions[1]}
		// 			/>
		// 		);
		// 	else if (dimensions && dimensions.length == 1)
		// 		return (
		// 			<img
		// 				alt={value.path}
		// 				src={resourcePath}
		// 				width={dimensions[0]}
		// 			/>
		// 		);
		// 	else return <img alt={value.path} src={resourcePath} />;
		// } else if (value.embed) {
		// 	return (
		// 		<Embed link={value} sourcePath={sourcePath} inline={inline} />
		// 	);
		// }

		return <ObsidianLink link={value} />;
	} else if (Literals.isFunction(value)) {
		return <>&lt;function&gt;</>;
	} else if (Literals.isArray(value)) {
		if (!inline) {
			return (
				<ul className={"dataview dataview-ul dataview-result-list-ul"}>
					{value.map((subvalue, index) => (
						<li key={`list-item-${index}`} className="dataview-result-list-li">
							<Lit
								value={subvalue}
								sourcePath={sourcePath}
								inline={inline}
								depth={depth + 1}
							/>
						</li>
					))}
				</ul>
			);
		} else {
			if (value.length == 0) return <>&lt;Empty List&gt;</>;

			return (
				<span className="dataview dataview-result-list-span">
					{value.map((subvalue, index) => (
						<span key={`inline-list-item-${index}`}>
							{index == 0 ? "" : ", "}
							<Lit
								value={subvalue}
								sourcePath={sourcePath}
								inline={inline}
								depth={depth + 1}
							/>
						</span>
					))}
				</span>
			);
		}
	} else if (value && typeof value === 'object' && 'path' in value && 'display' in value && 'embed' in value && 'type' in value) {
		// Manual check for Link objects since Literals.isLink might not work properly
		return <ObsidianLink link={value as Link} />;
	} else if (Literals.isObject(value)) {
		// Don't render classes in case they have recursive references; spoopy.
		if (value?.constructor?.name && value?.constructor?.name != "Object") {
			return <>&lt;{value.constructor.name}&gt;</>;
		}

		if (!inline) {
			return (
				<ul className="dataview dataview-ul dataview-result-object-ul">
					{Object.entries(value).map(([key, value], index) => (
						<li key={`object-item-${index}`} className="dataview dataview-li dataview-result-object-li">
							{key}:{" "}
							<Lit
								value={value}
								sourcePath={sourcePath}
								inline={inline}
								depth={depth + 1}
							/>
						</li>
					))}
				</ul>
			);
		} else {
			if (Object.keys(value).length == 0)
				return <>&lt;Empty Object&gt;</>;

			return (
				<span className="dataview dataview-result-object-span">
					{Object.entries(value).map(([key, value], index) => (
						<span key={`inline-object-item-${index}`}>
							{index == 0 ? "" : ", "}
							{key}:{" "}
							<Lit
								value={value}
								sourcePath={sourcePath}
								inline={inline}
								depth={depth + 1}
							/>
						</span>
					))}
				</span>
			);
		}
	}

	return <>&lt;Unrecognized: {JSON.stringify(value)}&gt;</>;
}

/** @internal Intelligently render an arbitrary literal value. */
export const Lit = memo(RawLit);

/** Render a pretty centered error message in a box. */
export function ErrorMessage({
	title,
	message,
	error,
	reset,
}: {
	title?: string;
	message?: string;
	error?: string;
	reset?: () => void;
}) {
	return (
		<ErrorComponent
			title={title}
			message={message}
			error={error}
			reset={reset}
		/>
	);
}

