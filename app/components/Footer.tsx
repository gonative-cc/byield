import { Link } from "react-router";
import { socials, redirects } from "~/config/footer.json";

export function Footer() {
	return (
		<footer className="flex flex-col gap-4 md:bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/6712eb0279b6b0c14fb24ba2_Line%209.svg')] md:bg-no-repeat md:bg-top md:pt-10">
			<div className="flex justify-between md:px-40 px-10 flex-wrap gap-4">
				<div className="flex flex-col w-full md:w-fit md:gap-8 gap-4 bg-[url('/assets/bee/bee.webp')] md:bg-none bg-no-repeat bg-right bg-contain">
					<div className="max-w-32">
						<img src="/assets/app-logos/logo.svg" alt="Remix" />
					</div>
					<div className="flex gap-3">
						{socials.map(({ id, src, link }) => (
							<Link key={id} to={link} target="_blank" rel="noreferrer">
								<img src={src} alt={id} className="md:h-10 md:w-10" />
							</Link>
						))}
					</div>
				</div>
				<div className="flex md:gap-32 gap-4 flex-wrap">
					{redirects.map(({ heading, subHeaders }) => (
						<div key={heading} className="flex flex-col gap-2 flex-1">
							<span className="text-sm md:text-base">{heading}</span>
							<div className="flex flex-col gap-2">
								{subHeaders.map(({ title, link }) => (
									<Link key={title} to={link} target="_blank" rel="noreferrer">
										<span className="text-gray-400 text-sm md:text-base hover:text-white md:text-nowrap">
											{title}
										</span>
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex items-center justify-center h-20 md:h-44 md:bg-size-[auto,contain] md:bg-position-[center,left] bg-no-repeat md:bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/671380f67b8e1b5fed9795ea_go-native-footer.svg'),url('/assets/bee/bee.webp')] bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/671380f67b8e1b5fed9795ea_go-native-footer.svg')] bg-contain">
				<span className="text-gray-500 md:text-base text-sm">
					Copyright © {new Date().getFullYear()} Native | All Rights Reserved
				</span>
			</div>
		</footer>
	);
}
