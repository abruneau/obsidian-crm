import { Link } from "@blacksmithgu/datacore";
import { useContext, useEffect, useMemo, useRef } from "react";
import { APP_CONTEXT, COMPONENT_CONTEXT, CURRENT_FILE_CONTEXT, ErrorMessage } from "./markdown";

export function Embed({
    link,
    inline,
    sourcePath: maybeSourcePath,
}: {
    /** The link that is being embedded. */
    link: Link;
    /** Whether the embed should be shown inline with less padding. */
    inline: boolean;
    /** The path which the link will be resolved relative to. */
    sourcePath?: string;
}) {
    const app = useContext(APP_CONTEXT);
    const component = useContext(COMPONENT_CONTEXT);
    const currentFile = useContext(CURRENT_FILE_CONTEXT);
    const sourcePath = maybeSourcePath ?? currentFile ?? "";

    const container = useRef<HTMLDivElement | null>(null);
    const linkedFile = useMemo(
        () => app.metadataCache.getFirstLinkpathDest(link.path, sourcePath),
        [link.path, sourcePath]
    );

    useEffect(() => {
        if (!container.current) return;
        if (!linkedFile) return;

        // Use requestAnimationFrame to defer DOM manipulation and avoid forced reflow
        requestAnimationFrame(() => {
            if (!container.current) return;
            
            container.current.replaceChildren(...[]);

            const creator = app.embedRegistry.getEmbedCreator(linkedFile);
            const embedComponent = new creator(
                {
                    linktext: link.path,
                    sourcePath: sourcePath,
                    showInline: inline,
                    app,
                    depth: 0,
                    containerEl: container.current,
                    displayMode: true,
                },
                linkedFile,
                link.subpath
            );

            component.addChild(embedComponent);
            embedComponent.loadFile(linkedFile);

            return () => component.removeChild(embedComponent);
        });
    }, [container.current, linkedFile, link.subpath]);

    if (!linkedFile) {
        return <ErrorMessage message={`Could not find a page at linked location: ${link.path}`} />;
    } else {
        return <div className="dc-embed" ref={container}></div>;
    }
}
