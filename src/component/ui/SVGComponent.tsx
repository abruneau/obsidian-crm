import { useCallback, useMemo } from "react";
import {
	TransformComponent,
	TransformWrapper,
	useControls,
	useTransformComponent,
} from "react-zoom-pan-pinch";
import { PerformanceMetrics } from "./OrgChartComponent";

/**
 * Controls component that uses useControls hook inside TransformWrapper
 */
function Controls({
	downloadSvg,
	downloadCode,
	performanceMetrics,
}: {
	downloadSvg: () => void;
	downloadCode: () => void;
	performanceMetrics: PerformanceMetrics | null;
}) {
	// Memoized button styles
	const buttonStyle = useMemo(
		() => ({
			padding: "8px 12px",
			background: "var(--color-base-00, #fff)",
			border: "1px solid var(--color-base-30, #ccc)",
			borderRadius: 6,
			boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			gap: "6px",
			fontSize: "12px",
			fontWeight: "500",
			transition: "all 0.2s ease",
			":hover": {
				background: "var(--color-base-10, #f5f5f5)",
				boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
			},
		}),
		[]
	);
	const { centerView } = useControls();

	// const showPerformanceMetrics = useCallback(() => {
	// 	const metrics = performanceMonitor.current.getMetrics();
	// 	console.log("Performance Metrics:", metrics);
	// 	alert(`Performance Metrics:\n${JSON.stringify(metrics, null, 2)}`);
	// }, []);

	const transformedComponent = useTransformComponent(({ state }) => {
		return (
			<>
				{/* Action buttons */}
				<div
					style={{
						position: "absolute",
						top: "10px",
						right: "10px",
						zIndex: 10,
						display: "flex",
						gap: "8px",
						flexWrap: "wrap",
					}}
				>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							centerView(1);
						}}
						style={buttonStyle}
						title="Reset view"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M3 2v6h6" />
							<path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
							<path d="M21 22v-6h-6" />
							<path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
						</svg>
						Reset
					</button>

					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							downloadSvg();
						}}
						style={buttonStyle}
						title="Download SVG"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
							<path d="M14 2v4a2 2 0 0 0 2 2h4" />
							<path d="M12 18v-6" />
							<path d="m9 15 3 3 3-3" />
						</svg>
						SVG
					</button>

					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							downloadCode();
						}}
						style={buttonStyle}
						title="Download Mermaid code"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
							<path d="M14 2v6h6" />
							<path d="M16 13H8" />
							<path d="M16 17H8" />
							<path d="M10 9H8" />
						</svg>
						Code
					</button>
				</div>

				{/* Performance metrics display */}
				{performanceMetrics && (
					<div
						style={{
							position: "absolute",
							bottom: "10px",
							left: "10px",
							background: "rgba(0,0,0,0.8)",
							color: "white",
							padding: "8px 12px",
							borderRadius: "6px",
							fontSize: "11px",
							fontFamily: "monospace",
							zIndex: 10,
							maxWidth: "300px",
						}}
					>
						<div>Nodes: {performanceMetrics.nodeCount}</div>
						<div>
							Mermaid:{" "}
							{performanceMetrics.mermaidGeneration?.toFixed(1)}
							ms
						</div>
						<div>
							SVG: {performanceMetrics.svgRendering?.toFixed(1)}ms
						</div>
						<div>Scale: {state.scale.toFixed(2)}x</div>
					</div>
				)}
			</>
		);
	});

	return transformedComponent;
}

function SVGComponent({
	svg,
	code,
	codeExtension,
	name,
	performanceMetrics,
}: {
	svg: string;
	code: string;
	codeExtension: string;
	name: string;
	performanceMetrics: PerformanceMetrics | null;
}) {
	const downloadSvg = useCallback(() => {
		if (!svg) return;

		const blob = new Blob([svg], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `orgchart-${name || "chart"}.svg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [svg, name]);

	const downloadCode = useCallback(() => {
		if (!code) return;

		const blob = new Blob([code], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `orgchart-${name || "chart"}.${codeExtension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, [code, name, codeExtension]);

	return (
		<TransformWrapper
			maxScale={20}
			centerOnInit={true}
			centerZoomedOut={true}
			limitToBounds={true}
			wheel={{ step: 1 }}
			initialScale={2.5}
		>
			{({ centerView, ...rest }) => (
				<>
					<TransformComponent
						wrapperStyle={{
							width: "100%",
							height: "600px",
							border: "1px solid var(--color-base-30, #ddd)",
							overflow: "hidden",
							position: "relative" as const,
							background: "var(--color-base-10, #fafafa)",
							borderRadius: "8px",
						}}
					>
						<div
							dangerouslySetInnerHTML={{
								__html: svg,
							}}
						/>
					</TransformComponent>
					<Controls
						downloadSvg={downloadSvg}
						downloadCode={downloadCode}
						performanceMetrics={performanceMetrics}
					/>
				</>
			)}
		</TransformWrapper>
	);
}

export default SVGComponent;
