import { MarkdownPage } from "@blacksmithgu/datacore";
import { useState, useRef, useEffect, useMemo } from "react";
import mermaid from "mermaid";
import SVGComponent from "./SVGComponent";

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

export type PerformanceMetrics = {
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
	const [performanceMetrics, setPerformanceMetrics] =
		useState<PerformanceMetrics | null>(null);
	const [isRendering, setIsRendering] = useState(true);

	const performanceMonitor = useRef(PerformanceMonitor.getInstance());
	const orgChartRef = useRef<OrgChart | null>(null);

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
					setIsRendering(false);
				} else {
					const code = orgChartRef.current?.toMermaid() || "";
					const mermaidTime =
						performanceMonitor.current.endCheckpoint(
							"mermaid-generation"
						);

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
					// Keep isRendering true - it will be set to false after SVG rendering
				}
			} catch (e) {
				setError("Error loading org chart: " + (e?.message || e));
				setMermaidCode("");
				setSvg("");
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
		let cancelled = false;

		const renderSvg = async () => {
			if (!mermaidCode) {
				setSvg("");
				setIsRendering(false);
				return;
			}

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

					// Only update if the SVG has actually changed
					setSvg((prevSvg) => {
						if (prevSvg === renderedSvg) {
							console.log(
								"OrgChart: SVG unchanged, skipping update"
							);
							return prevSvg;
						}

						return renderedSvg;
					});

					// Update performance metrics
					setPerformanceMetrics(
						(prev) =>
							({
								...prev,
								svgRendering: svgTime,
							} as PerformanceMetrics)
					);
					
					// Set rendering to false after successful render
					setIsRendering(false);
				} else {
					console.log("OrgChart: SVG rendering was cancelled");
					setIsRendering(false);
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
					setIsRendering(false);
				}
			}
		};

		renderSvg();

		return () => {
			cancelled = true;
		};
	}, [mermaidCode, id]);

	// Memoized container styles
	const containerStyle = useMemo(
		() => ({
			margin: "1em 0",
			position: "relative" as const,
		}),
		[]
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
				<SVGComponent
					svg={svg}
					code={mermaidCode}
					name={current.$name}
					codeExtension="mmd"
					performanceMetrics={performanceMetrics}
				/>
			)}
		</div>
	);
}
