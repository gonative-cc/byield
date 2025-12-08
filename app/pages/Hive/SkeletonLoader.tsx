export function DashboardSkeletonLoader() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="card">
				<div className="card-body flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<div className="skeleton mb-1 h-4 w-32 rounded"></div>
						<div className="skeleton h-12 w-40 rounded sm:h-16 sm:w-48"></div>
					</div>
					<div className="flex flex-col gap-4 lg:items-end">
						<div className="flex flex-wrap justify-start gap-2 lg:justify-end">
							<div className="skeleton h-6 w-32"></div>
							<div className="skeleton h-6 w-36"></div>
						</div>
						<div className="skeleton h-8 w-64"></div>
					</div>
				</div>
			</div>

			{/* Category Breakdown */}
			<div>
				<div className="skeleton mb-4 h-6 w-48 rounded"></div>

				{/* Contributor Card Skeleton */}
				<div className="card mb-4">
					<div className="card-body">
						<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="flex items-start gap-3">
								<div className="skeleton h-10 w-10 rounded"></div>
								<div>
									<div className="skeleton mb-2 h-5 w-40 rounded"></div>
									<div className="skeleton h-4 w-64 rounded"></div>
								</div>
							</div>
							<div className="flex flex-col gap-2 sm:items-end">
								<div className="skeleton h-10 w-32 rounded sm:h-12 sm:w-36"></div>
								<div className="skeleton h-3 w-48 rounded"></div>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<div className="skeleton mb-1 h-4 w-24 rounded"></div>
								<div className="skeleton mb-2 h-5 w-32 rounded"></div>
								<div className="skeleton mb-1 h-8 w-20 rounded"></div>
								<div className="skeleton h-4 w-28 rounded"></div>
							</div>
							<div>
								<div className="skeleton mb-2 h-4 w-40 rounded"></div>
								<div className="skeleton mb-1 h-2 w-full"></div>
								<div className="skeleton h-4 w-36 rounded"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Member and Spreader Cards Skeleton */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{[1, 2].map((i) => (
						<div key={i} className="card">
							<div className="card-body">
								<div className="mb-4 flex items-start gap-3">
									<div className="skeleton h-6 w-6 rounded"></div>
									<div className="skeleton h-5 w-20 rounded"></div>
								</div>
								<div className="mb-4">
									<div className="skeleton mb-1 h-4 w-24 rounded"></div>
									<div className="skeleton mb-2 h-5 w-32 rounded"></div>
									<div className="skeleton mb-1 h-4 w-28 rounded"></div>
									<div className="skeleton h-8 w-8 rounded"></div>
								</div>
								<div>
									<div className="skeleton mb-2 h-4 w-40 rounded"></div>
									<div className="skeleton mb-1 h-2 w-full"></div>
									<div className="skeleton h-4 w-36 rounded"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
