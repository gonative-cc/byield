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
			<div className="flex flex-col items-center gap-4">
				{/* Row 1: 1 logo */}
				<div className="flex justify-center gap-4">
					{partnersConfig.partners.slice(0, 1).map((partner) => (
						<div key={partner.name} className="group flex items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-20 h-20 md:w-24 md:h-24 border border-gray-100">
							<img src={partner.logo} alt={`${partner.name} logo`} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
						</div>
					))}
				</div>
				{/* Row 2: 2 logos */}
				<div className="flex justify-center gap-4">
					{partnersConfig.partners.slice(1, 3).map((partner) => (
						<div key={partner.name} className="group flex items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-20 h-20 md:w-24 md:h-24 border border-gray-100">
							<img src={partner.logo} alt={`${partner.name} logo`} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
						</div>
					))}
				</div>
				{/* Row 3: 3 logos */}
				<div className="flex justify-center gap-4">
					{partnersConfig.partners.slice(3, 6).map((partner) => (
						<div key={partner.name} className="group flex items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-20 h-20 md:w-24 md:h-24 border border-gray-100">
							<img src={partner.logo} alt={`${partner.name} logo`} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
						</div>
					))}
				</div>
				{/* Row 4: 4 logos */}
				<div className="flex justify-center gap-4">
					{partnersConfig.partners.slice(6, 10).map((partner) => (
						<div key={partner.name} className="group flex items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-20 h-20 md:w-24 md:h-24 border border-gray-100">
							<img src={partner.logo} alt={`${partner.name} logo`} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
						</div>
					))}
				</div>
				{/* Row 5: 5 logos */}
				<div className="flex justify-center gap-4">
					{partnersConfig.partners.slice(10, 15).map((partner) => (
						<div key={partner.name} className="group flex items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 w-20 h-20 md:w-24 md:h-24 border border-gray-100">
							<img src={partner.logo} alt={`${partner.name} logo`} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
