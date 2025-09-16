interface LoadingSpinner {
	isLoading: boolean;
}

export function LoadingSpinner({ isLoading }: LoadingSpinner) {
	if (!isLoading) return null;
	return <span className="loading loading-spinner" />;
}
