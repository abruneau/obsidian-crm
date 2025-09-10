export function ErrorComponent({
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
        <div className="crm-error-box">
            {title && <h4 className="crm-error-title">{title}</h4>}
            {message && <p className="crm-error-message">{message}</p>}
            {error && <pre className="crm-error-pre">{error}</pre>}
            {reset && (
                <button className="crm-error-retry" onClick={reset}>
                    Rerun
                </button>
            )}
        </div>
    );
}
