import partnersConfig from "~/config/auction/partners.json";

export function Partners() {
	return (
		<div className="w-full max-w-6xl mx-auto px-4">
			<div className="text-center mb-8">
				<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
					Our <span className="text-primary">Partners</span>
				</h2>
				<p className="text-foreground/80 text-sm md:text-base">
					Trusted by leading organizations in the ecosystem
				</p>
			</div>
			<div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-white p-6 shadow-inner">
				<div className="flex gap-6 animate-scroll-rtl">
					{[...partnersConfig.partners, ...partnersConfig.partners].map((partner, index) => (
						<div
							key={`${partner.name}-${index}`}
							className="group flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 border border-gray-100"
						>
							<img
								src={partner.logo}
								alt={`${partner.name} logo`}
								className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
								loading="lazy"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
