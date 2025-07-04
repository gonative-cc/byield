import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function PageNotFound() {
	return (
		<div className="flex h-[80vh] items-center justify-center">
			<div className="flex flex-col items-center w-full gap-4 text-center">
				<img src="/assets/ui-icons/404.svg" alt="Page not found" width={200} height={200} />
				<span className="font-bold text-3xl">Error 404</span>
				<span>Oops! Seems like you are lost :(</span>
				<Link to="/">
					<Button>Go back to main page</Button>
				</Link>
			</div>
		</div>
	);
}
