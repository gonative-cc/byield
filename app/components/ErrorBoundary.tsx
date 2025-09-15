import { isRouteErrorResponse, useRouteError, Link, type ErrorResponse } from "react-router";
import { Card } from "react-daisyui";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export function ErrorBoundary() {
	const error = useRouteError();

	const handleRefresh = () => {
		window.location.reload();
	};

	const routerError = (err: ErrorResponse) => (
		<>
			<Card.Body className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle className="h-8 w-8 text-destructive" />
				</div>
				<h2 className="card-title text-2xl font-bold">
					{err.status} {err.statusText}
				</h2>
			</Card.Body>
			<Card.Body className="text-center space-y-4 border-0 bg-transparent">
				<p className="text-muted-foreground">
					{err.data || "The page you're looking for doesn't exist or something went wrong."}
				</p>
				<div className="flex gap-2 justify-center">
					<Link to="/">
						<button className="btn btn-primary btn-outline">
							<Home />
							Home
						</button>
					</Link>
					<button onClick={handleRefresh} className="btn btn-primary">
						<RefreshCw />
						Retry
					</button>
				</div>
			</Card.Body>
		</>
	);

	const nonRouterError = () => (
		<>
			<Card.Body className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle className="h-8 w-8 text-destructive" />
				</div>
				<h2 className="card-title text-2xl font-bold">Oops!</h2>
			</Card.Body>
			<Card.Body className="text-center space-y-4 border-0 bg-transparent">
				<p className="text-muted-foreground">
					Something unexpected happened. Please try refreshing the page.
				</p>
				<div className="flex gap-2 justify-center">
					<button onClick={handleRefresh} className="btn btn-primary">
						<RefreshCw />
						Retry
					</button>
				</div>
			</Card.Body>
		</>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-azure-20 to-azure-25 flex items-center justify-center p-4">
			<Card className="w-full max-w-md border-0 bg-transparent">
				{isRouteErrorResponse(error) ? routerError(error) : nonRouterError()}
			</Card>
		</div>
	);
}
