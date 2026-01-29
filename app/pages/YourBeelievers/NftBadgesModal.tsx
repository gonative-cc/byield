import { Modal } from "~/components/ui/dialog";

interface NftBadgesModalProps {
	id: string;
	badges: string[];
	nftName: string;
	open: boolean;
	onClose: () => void;
}

export function NftBadgesModal({ id, badges, nftName, open, onClose }: NftBadgesModalProps) {
	return (
		<Modal id={id} open={open} handleClose={onClose} title={`Badges - ${nftName}`}>
			{badges.length === 0 ? (
				<p className="text-base-content/75 text-center">No badges yet</p>
			) : (
				<div className="flex flex-wrap gap-2">
					{badges.map((badge) => (
						<span key={badge} className="badge badge-info badge-lg">
							{badge}
						</span>
					))}
				</div>
			)}
		</Modal>
	);
}
