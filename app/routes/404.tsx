import { Link } from 'react-router';

export default function PageNotFound() {
	return (
		<div className="flex h-[80vh] items-center justify-center">
			<div className="flex w-full flex-col items-center gap-4 text-center">
				<img src="/assets/ui-icons/404.svg" alt="Page not found" width={200} height={200} />
				<span className="text-3xl font-bold">Error 404</span>
				<span>Oops! Seems like you are lost :(</span>
				<Link to="/">
					<button className="btn btn-primary">Go back to main page</button>
				</Link>
			</div>
		</div>
	);
}
