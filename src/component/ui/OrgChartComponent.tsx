import { MarkdownPage } from "@blacksmithgu/datacore";
import { useState, useRef, useEffect } from "react";
import mermaid from "mermaid";

/**
 * OrgChart component for rendering organizational charts in Datacore.
 * This component uses the Mermaid library to render flowcharts based on dependencies.
 */
type GraphNode = {
  main: string;
  sub: string;
};

type Dependency = {
  child: GraphNode;
  parent: GraphNode;
};

class OrgChart {
  private dependencies: Dependency[];
  private current: MarkdownPage;

  constructor(dependencies: Dependency[], current: MarkdownPage) {
    this.dependencies = dependencies;
    this.current = current;
  }

  toMermaid() {
    const lines = ["flowchart BT"];
    lines.push(this.build_chart());
    return lines.join("\n");
  }

  private hashCode(s: string) {
    return s.split("").reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  private escape_for_mermaid(str: string) {
    if (!str) return "";
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/[\[\]]/g, "") // eslint-disable-line no-useless-escape
      .replace(/-/g, "&ndash;")
      .replace(/:/g, "&colon;")
      .replace(/,/g, "&comma;")
      .replace(/\./g, "&period;")
      .replace(/\?/g, "&question;")
      .replace(/\!/g, "&exclamation;") // eslint-disable-line no-useless-escape
      .replace(/\(/g, "&lpar;")
      .replace(/\)/g, "&rpar;")
      .replace(/\//g, "&sol;")
      .replace(/\+/g, "&plus;")
      .replace(/\*/g, "&ast;")
      .replace(/\=/g, "&equals;") // eslint-disable-line no-useless-escape
      .replace(/\</g, "&lt;") // eslint-disable-line no-useless-escape
      .replace(/\>/g, "&gt;") // eslint-disable-line no-useless-escape
      .replace(/\|/g, "&vert;")
      .replace(/\{/g, "&lcub;")
      .replace(/\}/g, "&rcub;")
      .replace(/\[/g, "&lsqb;")
      .replace(/\]/g, "&rsqb;")
      .replace(/\{/g, "&lcub;") // eslint-disable-line no-useless-escape
      .replace(/\}/g, "&rcub;");
  }

  private display_node(node: GraphNode) {
    let result = `<u>${node.main}</u>`;
    if (node.main !== this.current.$name) {
      result = `<a class="internal-link" href='${node.main}'>${node.main}</a>`;
    }
    if (node.sub) {
      result += `<br>${this.escape_for_mermaid(node.sub)}`;
    }
    return result;
  }

  private build_chart() {
    if (!Array.isArray(this.dependencies)) {
      console.error("dependencies is not an array:", this.dependencies);
      return "";
    }
    return this.dependencies
      .map((d) => {
        try {
          return `id${this.hashCode(d.child.main)}[${this.display_node(
            d.child
          )}] --> id${this.hashCode(d.parent.main)}[${this.display_node(
            d.parent
          )}]`;
        } catch (error) {
          console.error("Error building chart node:", d.child, d.parent, error);
          return "";
        }
      })
      .join("\n");
  }
}

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
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const viewerRef = useRef(null);
  const transformRef = useRef(transform);

  // Keep transformRef in sync with transform state
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    (async () => {
      try {
        if (dependencies.length === 0) {
          setError("No org chart data found for this contact.");
        } else {
          const orgChart = new OrgChart(dependencies, current);
          const code = orgChart.toMermaid();
          console.log(code);
          setMermaidCode(code);
          setError("");
        }
      } catch (e) {
        setError("Error loading org chart: " + (e?.message || e));
        setMermaidCode("");
        setSvg("");
      }
    })();
  }, [current, dependencies]);

  useEffect(() => {
    if (!mermaidCode) {
      setSvg("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { svg } = await mermaid.render(id, mermaidCode);
        if (!cancelled) {
          setSvg(svg);
        }
      } catch (e) {
        if (!cancelled) setError("Error rendering SVG: " + (e?.message || e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mermaidCode]);

  const centerView = () => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current as HTMLDivElement;
    const svgElement = viewer.querySelector("svg") as SVGSVGElement | null;
    if (!svgElement) return;

    // Use requestAnimationFrame to defer DOM measurements and avoid forced reflow
    requestAnimationFrame(() => {
      if (!viewerRef.current) return;
      
      const viewer = viewerRef.current as HTMLDivElement;
      const viewerRect = viewer.getBoundingClientRect();

      const svgWidth = parseFloat(svgElement.getAttribute("width") || "0");
      const svgHeight = parseFloat(svgElement.getAttribute("height") || "0");

      if (svgWidth && svgHeight) {
        const newScale =
          Math.min(viewerRect.width / svgWidth, viewerRect.height / svgHeight) *
          0.95;
        const newX = (viewerRect.width - svgWidth * newScale) / 2;
        const newY = (viewerRect.height - svgHeight * newScale) / 2;
        setTransform({ scale: newScale, x: newX, y: newY });
      }
    });
  };

  useEffect(() => {
    if (svg) {
      const timer = setTimeout(() => centerView(), 0);
      return () => clearTimeout(timer);
    }
  }, [svg]);

  useEffect(() => {
    const viewer = viewerRef.current as HTMLDivElement | null;
    if (!viewer) return;

    const handleWheelWithPreventDefault = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e);
    };

    viewer.addEventListener('wheel', handleWheelWithPreventDefault, { passive: false });

    return () => {
      viewer.removeEventListener('wheel', handleWheelWithPreventDefault);
    };
  }, [svg]); // Only re-add when svg changes

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orgchart.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsPanning(false);
  };

  const handleWheel = (e: WheelEvent) => {
    if (!viewerRef.current) return;
    e.preventDefault();

    const currentTransform = transformRef.current;
    const scaleAmount = 1.1;
    const newScale =
      e.deltaY < 0
        ? currentTransform.scale * scaleAmount
        : currentTransform.scale / scaleAmount;

    // Use requestAnimationFrame to defer DOM measurements and avoid forced reflow
    requestAnimationFrame(() => {
      if (!viewerRef.current) return;
      
      const viewer = viewerRef.current as HTMLDivElement;
      const rect = viewer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - currentTransform.x) * (newScale / currentTransform.scale);
      const newY = mouseY - (mouseY - currentTransform.y) * (newScale / currentTransform.scale);

      setTransform({ scale: newScale, x: newX, y: newY });
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as Element)?.closest("button")) return;
    e.preventDefault();
    setIsPanning(true);
    const currentTransform = transformRef.current;
    setPanStart({ x: e.clientX - currentTransform.x, y: e.clientY - currentTransform.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    const currentTransform = transformRef.current;
    setTransform({ ...currentTransform, x: newX, y: newY });
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    centerView();
  };

  const buttonStyle = {
    padding: "6px 12px",
    background: "var(--color-base-00, #fff)",
    border: "1px solid var(--color-base-30, #ccc)",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  };

  return (
    <div style={{ margin: "1em 0" }}>
      {error && <div style={{ color: "red" }}> {error} </div>}
      {svg && (
        <div
          ref={viewerRef}
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid var(--color-base-30, #ddd)",
            overflow: "hidden",
            position: "relative",
            background: "var(--color-base-10, #fafafa)",
            cursor: isPanning ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{ width: "100%", height: "100%" }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 10,
              display: "flex",
              gap: "5px",
            }}
          >
            <button onClick={resetZoom} style={buttonStyle} title="Reset view">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v6h6" />
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                <path d="M21 22v-6h-6" />
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
              </svg>
            </button>
            <button
              onClick={handleDownload}
              style={buttonStyle}
              title="Download SVG"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {" "}
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />{" "}
                <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M12 18v-6" />{" "}
                <path d="m9 15 3 3 3-3" />{" "}
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
