import { socials, redirects } from "~/config/footer.json";

export function Footer() {
	return (
		<footer className="flex flex-col gap-4 md:bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/6712eb0279b6b0c14fb24ba2_Line%209.svg')] md:bg-top md:bg-no-repeat md:pt-10">
			<div className="flex flex-wrap justify-between gap-4 px-10 md:px-40">
				<div className="flex w-full flex-col gap-4 bg-[url('/assets/bee/bee.webp')] bg-contain bg-right bg-no-repeat md:w-fit md:gap-8 md:bg-none">
					<div className="max-w-32">
						<img src="/assets/app-logos/logo.svg" alt="Remix" />
					</div>
					<div className="flex gap-3">
						{socials.map(({ id, src, link }) => (
							<a key={id} href={link} target="_blank" rel="noreferrer">
								<img src={src} alt={id} className="md:h-10 md:w-10" />
							</a>
						))}
					</div>
				</div>
				<div className="flex flex-wrap gap-4 md:gap-32">
					{redirects.map(({ heading, subHeaders }) => (
						<div key={heading} className="flex flex-1 flex-col gap-2">
							<span className="text-sm md:text-base">{heading}</span>
							<div className="flex flex-col gap-2">
								{subHeaders.map(({ title, link }) => (
									<a key={title} href={link} target="_blank" rel="noreferrer">
										<span className="text-base-content/75 text-sm hover:text-white md:text-base md:text-nowrap">
											{title}
										</span>
									</a>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex h-20 items-center justify-center bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/671380f67b8e1b5fed9795ea_go-native-footer.svg')] bg-contain bg-no-repeat md:h-44 md:bg-[url('https://cdn.prod.website-files.com/669384bb0581e8c6129231e2/671380f67b8e1b5fed9795ea_go-native-footer.svg'),url('/assets/bee/bee.webp')] md:bg-size-[auto,contain] md:bg-position-[center,left]">
				<span className="text-base-content/75 text-sm md:text-base">
					Copyright © {new Date().getFullYear()} Native | All Rights Reserved
				</span>
			</div>
		</footer>
	);
}
