import { MarkdownPage } from "@blacksmithgu/datacore";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import mermaid from "mermaid";

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private checkpoints: Map<string, number> = new Map();
	private metrics: Map<string, number[]> = new Map();

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	startCheckpoint(name: string): void {
		this.checkpoints.set(name, performance.now());
	}

	endCheckpoint(name: string): number {
		const startTime = this.checkpoints.get(name);
		if (!startTime) {
			console.warn(`Checkpoint "${name}" was not started`);
			return 0;
		}

		const duration = performance.now() - startTime;
		this.checkpoints.delete(name);

		// Store metrics for analysis
		if (!this.metrics.has(name)) {
			this.metrics.set(name, []);
		}
		const metrics = this.metrics.get(name);
		if (metrics) {
			metrics.push(duration);
		}

		console.log(
			`Performance checkpoint "${name}": ${duration.toFixed(2)}ms`
		);
		return duration;
	}

	getMetrics(): Record<
		string,
		{ avg: number; min: number; max: number; count: number }
	> {
		const result: Record<
			string,
			{ avg: number; min: number; max: number; count: number }
		> = {};

		for (const [name, times] of this.metrics.entries()) {
			if (times.length > 0) {
				const avg = times.reduce((a, b) => a + b, 0) / times.length;
				const min = Math.min(...times);
				const max = Math.max(...times);
				result[name] = { avg, min, max, count: times.length };
			}
		}

		return result;
	}

	reset(): void {
		this.checkpoints.clear();
		this.metrics.clear();
	}
}

// Note: VirtualizationManager can be implemented in the future for very large charts

/**
 * Enhanced OrgChart class with performance optimizations
 */
type GraphNode = {
	main: string;
	sub: string;
};

type Dependency = {
	child: GraphNode;
	parent: GraphNode;
};

type Transform = {
	scale: number;
	x: number;
	y: number;
};

type PerformanceMetrics = {
	mermaidGeneration: number;
	svgRendering: number;
	domUpdate: number;
	totalRender: number;
	nodeCount: number;
};

class OrgChart {
	private dependencies: Dependency[];
	private current: MarkdownPage;
	private performanceMonitor: PerformanceMonitor;
	private mermaidCache: Map<string, string> = new Map();

	constructor(dependencies: Dependency[], current: MarkdownPage) {
		this.dependencies = dependencies;
		this.current = current;
		this.performanceMonitor = PerformanceMonitor.getInstance();
	}

	toMermaid(): string {
		this.performanceMonitor.startCheckpoint("mermaid-generation");

		// Check cache first
		const cacheKey = this.getCacheKey();
		if (this.mermaidCache.has(cacheKey)) {
			this.performanceMonitor.endCheckpoint("mermaid-generation");
			return this.mermaidCache.get(cacheKey) || "";
		}

		const lines = ["flowchart BT"];

		// Note: For large charts, we rely on Mermaid's default layout algorithms
		// Custom configuration can be added here if needed in the future

		lines.push(this.build_chart());

		const result = lines.join("\n");
		this.mermaidCache.set(cacheKey, result);

		this.performanceMonitor.endCheckpoint("mermaid-generation");
		return result;
	}

	private getCacheKey(): string {
		return `${this.current.$name}-${
			this.dependencies.length
		}-${JSON.stringify(
			this.dependencies.map((d) => ({
				child: d.child.main,
				parent: d.parent.main,
			}))
		)}`;
	}

	private hashCode(s: string): number {
		return s.split("").reduce(function (a, b) {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);
	}

	private escape_for_mermaid(str: string): string {
		if (!str) return "";
		return str
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;")
			.replace(/[[\]]/g, "")
			.replace(/-/g, "&ndash;")
			.replace(/:/g, "&colon;")
			.replace(/,/g, "&comma;")
			.replace(/\./g, "&period;")
			.replace(/\?/g, "&question;")
			.replace(/!/g, "&exclamation;")
			.replace(/\(/g, "&lpar;")
			.replace(/\)/g, "&rpar;")
			.replace(/\//g, "&sol;")
			.replace(/\+/g, "&plus;")
			.replace(/\*/g, "&ast;")
			.replace(/=/g, "&equals;")
			.replace(/\|/g, "&vert;")
			.replace(/\{/g, "&lcub;")
			.replace(/\}/g, "&rcub;")
			.replace(/\[/g, "&lsqb;")
			.replace(/\]/g, "&rsqb;");
	}

	private display_node(node: GraphNode): string {
		let result = `<u>${node.main}</u>`;
		if (node.main !== this.current.$name) {
			result = `<a class="internal-link" href='${node.main}'>${node.main}</a>`;
		}
		if (node.sub) {
			result += `<br>${this.escape_for_mermaid(node.sub)}`;
		}
		return result;
	}

	private build_chart(): string {
		if (!Array.isArray(this.dependencies)) {
			console.error("dependencies is not an array:", this.dependencies);
			return "";
		}

		return this.dependencies
			.map((d) => {
				try {
					return `id${this.hashCode(
						d.child.main
					)}[${this.display_node(d.child)}] --> id${this.hashCode(
						d.parent.main
					)}[${this.display_node(d.parent)}]`;
				} catch (error) {
					console.error(
						"Error building chart node:",
						d.child,
						d.parent,
						error
					);
					return "";
				}
			})
			.join("\n");
	}

	getNodeCount(): number {
		return this.dependencies.length;
	}

	clearCache(): void {
		this.mermaidCache.clear();
	}
}

// Note: useDebounce utility removed as it was causing infinite loops

/**
 * Enhanced OrgChartComponent with performance optimizations
 */
export function OrgChartComponent({
	dependencies,
	current,
	id,
}: {
	dependencies: Dependency[];
	current: MarkdownPage;
	id: string;
}) {
	const [mermaidCode, setMermaidCode] = useState("");
	const [svg, setSvg] = useState("");
	const [error, setError] = useState("");
	const [transform, setTransform] = useState<Transform>({
		scale: 1,
		x: 0,
		y: 0,
	});
	const [isPanning, setIsPanning] = useState(false);
	const [panStart, setPanStart] = useState({ x: 0, y: 0 });
	const [performanceMetrics, setPerformanceMetrics] =
		useState<PerformanceMetrics | null>(null);
	const [isRendering, setIsRendering] = useState(false);

	const viewerRef = useRef<HTMLDivElement>(null);
	const transformRef = useRef(transform);
	const performanceMonitor = useRef(PerformanceMonitor.getInstance());
	const orgChartRef = useRef<OrgChart | null>(null);

	// Keep transformRef in sync with transform state
	useEffect(() => {
		transformRef.current = transform;
	}, [transform]);

	// Memoize dependencies to prevent unnecessary re-renders
	const dependenciesKey = useMemo(() => {
		return JSON.stringify(
			dependencies.map((d) => ({
				child: d.child.main,
				parent: d.parent.main,
			}))
		);
	}, [dependencies]);

	const currentKey = useMemo(() => current.$name, [current.$name]);

	// Initialize org chart
	useEffect(() => {
		performanceMonitor.current.startCheckpoint("org-chart-init");
		orgChartRef.current = new OrgChart(dependencies, current);
		performanceMonitor.current.endCheckpoint("org-chart-init");
	}, [dependenciesKey, currentKey]);

	// Generate Mermaid code when dependencies change
	useEffect(() => {
		console.log("OrgChart: useEffect triggered for dependencies change", {
			dependenciesLength: dependencies.length,
			currentName: current.$name,
			dependenciesKey: dependenciesKey.substring(0, 50) + "...",
		});

		if (!orgChartRef.current) return;

		const generateMermaid = async () => {
			performanceMonitor.current.startCheckpoint("total-render");
			performanceMonitor.current.startCheckpoint("mermaid-generation");
			setIsRendering(true);

			try {
				if (dependencies.length === 0) {
					setError("No org chart data found for this contact.");
					setMermaidCode("");
					setSvg("");
				} else {
					const code = orgChartRef.current?.toMermaid() || "";
					const mermaidTime =
						performanceMonitor.current.endCheckpoint(
							"mermaid-generation"
						);
					console.log("OrgChart: Generated Mermaid code:", code);

					// Only update if the code has actually changed
					setMermaidCode((prevCode) => {
						if (prevCode === code) {
							console.log(
								"OrgChart: Mermaid code unchanged, skipping update"
							);
							return prevCode;
						}
						return code;
					});
					setError("");

					// Update performance metrics
					setPerformanceMetrics(
						(prev) =>
							({
								...prev,
								mermaidGeneration: mermaidTime,
								nodeCount:
									orgChartRef.current?.getNodeCount() || 0,
							} as PerformanceMetrics)
					);
				}
			} catch (e) {
				setError("Error loading org chart: " + (e?.message || e));
				setMermaidCode("");
				setSvg("");
			} finally {
				setIsRendering(false);
			}
		};

		// Debounce the generation
		const timeoutId = setTimeout(generateMermaid, 100);
		return () => clearTimeout(timeoutId);
	}, [dependenciesKey, currentKey]);

	// SVG rendering is now handled directly in useEffect below

	// Render SVG when Mermaid code changes
	useEffect(() => {
		console.log("OrgChart: useEffect triggered for mermaid code change", {
			mermaidCodeLength: mermaidCode.length,
			hasMermaidCode: !!mermaidCode,
		});

		let cancelled = false;

		const renderSvg = async () => {
			if (!mermaidCode) {
				console.log("OrgChart: No mermaid code, clearing SVG");
				setSvg("");
				return;
			}

			console.log(
				"OrgChart: Starting SVG rendering for mermaid code:",
				mermaidCode.substring(0, 100) + "..."
			);
			performanceMonitor.current.startCheckpoint("svg-rendering");
			setIsRendering(true);

			try {
				const { svg: renderedSvg } = await mermaid.render(
					`${id}`,
					mermaidCode
				);
				if (!cancelled) {
					const svgTime =
						performanceMonitor.current.endCheckpoint(
							"svg-rendering"
						);
					console.log(
						"OrgChart: SVG rendered successfully, length:",
						renderedSvg.length
					);

					// Modify SVG to add width and height attributes
					const modifiedSvg = renderedSvg.replace(
						/<svg([^>]*)>/,
						'<svg$1 width="100%" height="100%">'
					);

					// Only update if the SVG has actually changed
					setSvg((prevSvg) => {
						if (prevSvg === modifiedSvg) {
							console.log(
								"OrgChart: SVG unchanged, skipping update"
							);
							return prevSvg;
						}
						return modifiedSvg;
					});

					// Update performance metrics
					setPerformanceMetrics(
						(prev) =>
							({
								...prev,
								svgRendering: svgTime,
							} as PerformanceMetrics)
					);
				} else {
					console.log("OrgChart: SVG rendering was cancelled");
				}
			} catch (e) {
				console.error("OrgChart: Error rendering SVG:", e);
				console.error(
					"OrgChart: Mermaid code that failed:",
					mermaidCode
				);
				if (!cancelled) {
					const errorMessage =
						e instanceof Error ? e.message : String(e);
					setError(
						`Error rendering SVG: ${errorMessage}\n\nMermaid code:\n${mermaidCode}`
					);
				}
			} finally {
				if (!cancelled) setIsRendering(false);
			}
		};

		renderSvg();

		return () => {
			cancelled = true;
		};
	}, [mermaidCode, id]);

	// centerView function removed - no longer needed

	// Auto-center when SVG is rendered and smaller than container
	useEffect(() => {
		if (svg && viewerRef.current) {
			const centerSvg = () => {
				const viewer = viewerRef.current;
				if (!viewer) return;

				const svgElement = viewer.querySelector(
					"svg"
				) as SVGSVGElement | null;
				if (!svgElement) return;

				const viewerRect = viewer.getBoundingClientRect();

				// Get SVG dimensions
				let svgWidth = parseFloat(
					svgElement.getAttribute("width") || "0"
				);
				let svgHeight = parseFloat(
					svgElement.getAttribute("height") || "0"
				);

				if (
					!svgWidth ||
					!svgHeight ||
					svgWidth === 0 ||
					svgHeight === 0
				) {
					const bbox = svgElement.getBBox();
					if (bbox.width && bbox.height) {
						svgWidth = bbox.width;
						svgHeight = bbox.height;
					} else {
						svgWidth = svgElement.clientWidth;
						svgHeight = svgElement.clientHeight;
					}
				}

				if (svgWidth && svgHeight) {
					// Always use (0, 0) as the centered position for both small and large diagrams
					setTransform((prev) => ({
						...prev,
						x: 0,
						y: 0,
					}));
					console.log("OrgChart: Positioned SVG at origin (0, 0)", {
						svgDimensions: { width: svgWidth, height: svgHeight },
						viewerDimensions: {
							width: viewerRect.width,
							height: viewerRect.height,
						},
						centerPosition: { x: 0, y: 0 },
					});
				}
			};

			// Try to center immediately
			centerSvg();

			// If SVG dimensions are not available yet, use MutationObserver to wait for it
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (
						mutation.type === "childList" ||
						mutation.type === "attributes"
					) {
						const svgElement = viewerRef.current?.querySelector(
							"svg"
						) as SVGSVGElement | null;
						if (svgElement) {
							const width = parseFloat(
								svgElement.getAttribute("width") || "0"
							);
							const height = parseFloat(
								svgElement.getAttribute("height") || "0"
							);

							// If we have valid dimensions, center and stop observing
							if (width > 0 && height > 0) {
								centerSvg();
								observer.disconnect();
							}
						}
					}
				});
			});

			// Start observing the viewer for changes
			observer.observe(viewerRef.current, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ["width", "height"],
			});

			// Fallback: disconnect after 2 seconds to avoid memory leaks
			const fallbackTimer = setTimeout(() => {
				observer.disconnect();
			}, 2000);

			return () => {
				observer.disconnect();
				clearTimeout(fallbackTimer);
			};
		}
	}, [svg]);

	// Wheel event handling with performance optimization
	useEffect(() => {
		const viewer = viewerRef.current;
		if (!viewer) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();

			const currentTransform = transformRef.current;
			const scaleAmount = 1.1;
			const newScale =
				e.deltaY < 0
					? currentTransform.scale * scaleAmount
					: currentTransform.scale / scaleAmount;

			// No scale limits - allow unlimited zoom

			requestAnimationFrame(() => {
				if (!viewerRef.current) return;

				const viewer = viewerRef.current;
				const rect = viewer.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				const newX =
					mouseX -
					(mouseX - currentTransform.x) *
						(newScale / currentTransform.scale);
				const newY =
					mouseY -
					(mouseY - currentTransform.y) *
						(newScale / currentTransform.scale);

				setTransform({ scale: newScale, x: newX, y: newY });
			});
		};

		viewer.addEventListener("wheel", handleWheel, { passive: false });
		return () => viewer.removeEventListener("wheel", handleWheel);
	}, [svg]);

	// Mouse event handlers
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if ((e.target as Element)?.closest("button")) return;
		e.preventDefault();
		setIsPanning(true);
		const currentTransform = transformRef.current;
		setPanStart({
			x: e.clientX - currentTransform.x,
			y: e.clientY - currentTransform.y,
		});
	}, []);

	const handleMouseUp = useCallback(() => {
		setIsPanning(false);
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isPanning) return;
			e.preventDefault();
			const newX = e.clientX - panStart.x;
			const newY = e.clientY - panStart.y;
			setTransform((prev) => ({ ...prev, x: newX, y: newY }));
		},
		[isPanning, panStart]
	);

	const handleMouseLeave = useCallback(() => {
		setIsPanning(false);
	}, []);

	// Action handlers
	const resetZoom = useCallback(() => {
		performanceMonitor.current.startCheckpoint("reset-zoom");
		// Always reset to (0, 0) position for both small and large diagrams
		setTransform({ scale: 1, x: 0, y: 0 });
		performanceMonitor.current.endCheckpoint("reset-zoom");
	}, []);

	const downloadSvg = useCallback(() => {
		if (!svg) return;

		performanceMonitor.current.startCheckpoint("download-svg");
		const blob = new Blob([svg], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `orgchart-${current.$name || "chart"}.svg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		performanceMonitor.current.endCheckpoint("download-svg");
	}, [svg, current.$name]);

	const downloadMermaidCode = useCallback(() => {
		if (!mermaidCode) return;

		performanceMonitor.current.startCheckpoint("download-mermaid");
		const blob = new Blob([mermaidCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `orgchart-${current.$name || "chart"}.mmd`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		performanceMonitor.current.endCheckpoint("download-mermaid");
	}, [mermaidCode, current.$name]);

	const showPerformanceMetrics = useCallback(() => {
		const metrics = performanceMonitor.current.getMetrics();
		console.log("Performance Metrics:", metrics);
		alert(`Performance Metrics:\n${JSON.stringify(metrics, null, 2)}`);
	}, []);

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

	// Memoized container styles
	const containerStyle = useMemo(
		() => ({
			margin: "1em 0",
			position: "relative" as const,
		}),
		[]
	);

	const viewerStyle = useMemo(
		() => ({
			width: "100%",
			height: "600px",
			border: "1px solid var(--color-base-30, #ddd)",
			overflow: "hidden",
			position: "relative" as const,
			background: "var(--color-base-10, #fafafa)",
			cursor: isPanning ? "grabbing" : "grab",
			borderRadius: "8px",
		}),
		[isPanning]
	);

	const transformStyle = useMemo(
		() => ({
			transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
			width: "100%",
			height: "100%",
		}),
		[transform]
	);

	return (
		<div style={containerStyle}>
			{error && (
				<div
					style={{
						color: "var(--text-error, #d73a49)",
						background: "var(--background-error, #ffeaea)",
						padding: "12px",
						borderRadius: "6px",
						marginBottom: "12px",
						border: "1px solid var(--border-error, #fdbdbd)",
					}}
				>
					{error}
				</div>
			)}

			{isRendering && (
				<div
					style={{
						position: "absolute",
						top: "10px",
						left: "10px",
						background: "var(--color-base-00, #fff)",
						padding: "8px 12px",
						borderRadius: "6px",
						border: "1px solid var(--color-base-30, #ccc)",
						boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
						zIndex: 20,
						fontSize: "12px",
						color: "var(--text-muted, #666)",
					}}
				>
					Rendering chart...
				</div>
			)}

			{svg && (
				<div
					ref={viewerRef}
					style={viewerStyle}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				>
					<div style={transformStyle}>
						<div
							style={{ width: "100%", height: "100%" }}
							dangerouslySetInnerHTML={{ __html: svg }}
						/>
					</div>

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
								resetZoom();
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
								downloadMermaidCode();
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

						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								showPerformanceMetrics();
							}}
							style={buttonStyle}
							title="Show performance metrics"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M3 3v18h18" />
								<path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
							</svg>
							Perf
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
								{performanceMetrics.mermaidGeneration?.toFixed(
									1
								)}
								ms
							</div>
							<div>
								SVG:{" "}
								{performanceMetrics.svgRendering?.toFixed(1)}ms
							</div>
							<div>Scale: {transform.scale.toFixed(2)}x</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
