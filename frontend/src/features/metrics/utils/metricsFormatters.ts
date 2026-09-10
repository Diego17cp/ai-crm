export function formatDuration(seconds: number | null): string {
	if (seconds === null) return "—";
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const mins = Math.floor(seconds / 60);
	if (mins < 60) return `${mins}m ${Math.round(seconds % 60)}s`;
	const hours = Math.floor(mins / 60);
	return `${hours}h ${mins % 60}m`;
}

export function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

export function formatScore(value: number | null): string {
	return value === null ? "—" : value.toFixed(1);
}

export function toISODate(d: Date): string {
	return d.toISOString().split("T")[0];
}