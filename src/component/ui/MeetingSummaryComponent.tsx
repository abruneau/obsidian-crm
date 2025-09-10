import type { MarkdownPage } from "@blacksmithgu/datacore";
import { useState, useRef, useEffect } from "react";
import { useApp } from "src/lib/AppContext";
import { TFile, MarkdownRenderer } from "obsidian";

interface MeetingSummaryProps {
	meetings: MarkdownPage[];
}

/**
 * Meeting Summary Component
 * 
 * Generates AI-powered summaries of meeting notes using LLM integration.
 * Supports both local Ollama instances and cloud-based APIs.
 * Renders the summary as markdown with proper formatting.
 */
function MeetingSummaryComponent({ meetings}: MeetingSummaryProps) {
	const { app, plugin } = useApp();
	const [isLoading, setIsLoading] = useState(false);
	const [summary, setSummary] = useState("");
	const [error, setError] = useState("");
	const summaryRef = useRef<HTMLDivElement>(null);

	// Render markdown when summary changes
	useEffect(() => {
		if (summaryRef.current && summary) {
			summaryRef.current.empty();
			MarkdownRenderer.render(app, summary, summaryRef.current, "", plugin);
		}
	}, [summary, app, plugin]);

	const fetchMeetingSummary = async () => {
		setIsLoading(true);
		setError("");
		setSummary("");

		const settings = plugin.settings

		try {
			meetings = meetings
				.filter(
					(m) =>
						m.value("start_date") &&
						new Date(m.value("start_date")) <= new Date()
				)
				.slice(0, 10);

			if (meetings.length === 0) {
				setError("No meetings found for this page.");
				setIsLoading(false);
				return;
			}

			// Prepare the content to send to Ollama
			const meetingContentPromises = meetings.map(async (meeting) => {
				const date = meeting.$name.substring(0, 10);

				const file = app.vault.getAbstractFileByPath(meeting.$path);
				if (!file || !(file instanceof TFile)) {
					return `Meeting: ${meeting.$name} (${date})\nNo content available\n---\n`;
				}
				let content = await app.vault.cachedRead(file as TFile);

				content = content.trim();
				if (!content) {
					content = "No content available";
				}

				return `Meeting: ${meeting.$name} (${date})\n${content}\n---\n`;
			});

			// Wait for all promises to resolve
			const meetingContent = await Promise.all(meetingContentPromises);
			const finalContent = meetingContent.join("\n");

			// Send to local Ollama server
			const response = await fetch(
				settings.llmUrl,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: settings.llmModel, // Adjust model name as needed
						prompt: `${settings.systemPrompt}\n\n${finalContent}\n\nSummary:`,
						stream: false,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`Ollama API error: ${response.status}`);
			}

			const data = await response.json();
			setSummary(data.response || "No summary generated");
		} catch (err) {
			setError(`Error: ${err.message || "Failed to generate summary"}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div style={{ margin: "1em 0" }}>
			{meetings && meetings.length > 0 && (
				<div style={{ marginBottom: "16px" }}>
					<h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
						Meetings to be summarized ({meetings.length}):
					</h4>
					<ul style={{ 
						margin: "0", 
						paddingLeft: "20px", 
						fontSize: "13px",
						color: "#666",
						maxHeight: "200px",
						overflowY: "auto"
					}}>
						{meetings
							.map((meeting, index) => {
								const date = meeting.$name.substring(0, 10);
								const title = meeting.value("title") || meeting.$name.replace(/^\d{4}-\d{2}-\d{2}-/, "");
								return (
									<li key={index} style={{ marginBottom: "4px" }}>
										<strong>{title}</strong> - {date}
									</li>
								);
							})}
					</ul>
				</div>
			)}
			
			<button
				onClick={fetchMeetingSummary}
				disabled={isLoading}
				style={{
					padding: "8px 16px",
					backgroundColor: isLoading ? "#ccc" : "#007acc",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: isLoading ? "not-allowed" : "pointer",
					fontSize: "14px",
					fontWeight: "500",
				}}
			>
				{isLoading
					? "Generating Summary..."
					: "Generate Meeting Summary"}
			</button>

			{error && (
				<div
					style={{
						color: "#d32f2f",
						marginTop: "8px",
						padding: "8px",
						backgroundColor: "#ffebee",
						borderRadius: "4px",
						border: "1px solid #ffcdd2",
					}}
				>
					{error}
				</div>
			)}

			{summary && (
				<div
					style={{
						marginTop: "16px",
						padding: "16px",
						backgroundColor: "#f5f5f5",
						borderRadius: "8px",
						border: "1px solid #e0e0e0",
					}}
				>
					<h3 style={{ marginTop: 0, marginBottom: "12px" }}>
						Meeting Summary
					</h3>

					<div ref={summaryRef} className="meeting-summary-markdown"></div>
				</div>
			)}
		</div>
	);
}

export default MeetingSummaryComponent;
