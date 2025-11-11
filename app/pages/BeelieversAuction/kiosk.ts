import { Transaction } from "@mysten/sui/transactions";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";
import type { SuiClient } from "@mysten/sui/client";
import { signAndExecTx, type TxSigner } from "~/lib/suienv";
import { toast } from "~/hooks/use-toast";
import { logError, logger } from "~/lib/log";

export interface KioskInfo {
	kioskId: string;
	kioskCapId: string;
	address: string;
	isPersonal?: boolean;
}

export async function createKiosk(
	userAddr: string,
	client: SuiClient,
	network: Network,
	signer: TxSigner,
) {
	toast({
		title: "Creating Kiosk object",
		variant: "info",
		description: "Kiosk is used to store NFT",
	});

	const kioskTx = createKioskTx(client, userAddr, network as Network);
	const result = await signAndExecTx(kioskTx, client, signer, { showEffects: true });
	let kioskId, kioskCapId;

	const effects = result.effects;
	if (effects?.created) {
		effects.created.forEach((obj) => {
			const owner = obj.owner as { Shared?: unknown; AddressOwner?: string };
			if (owner.Shared) {
				kioskId = obj.reference.objectId;
			} else if (owner.AddressOwner === userAddr) {
				kioskCapId = obj.reference.objectId;
			}
		});
	}
	if (!kioskId || !kioskCapId) {
		throw new Error("Failed to retrieve kiosk or kiosk cap ID, tx ID:" + result.digest);
	}
	logger.debug({
		msg: ">>>> Kiosk created, tx ID:",
		method: "createKiosk",
		txId: result.digest,
		kioskId,
		kioskCapId,
	});

	return storeKioskInfo(userAddr, kioskId, kioskCapId);
}

export const storeKioskInfo = (address: string, kioskId: string, kioskCapId: string): KioskInfo => {
	const kioskData: KioskInfo = {
		kioskId,
		kioskCapId,
		address,
		isPersonal: false,
	};
	localStorage.setItem(`kioskInfo-${address}`, JSON.stringify(kioskData));
	return kioskData;
};

export const getStoredKioskInfo = (address: string): KioskInfo | null => {
	const storedData = localStorage.getItem(`kioskInfo-${address}`);
	if (storedData) {
		const parsedData = JSON.parse(storedData);
		if (parsedData.address === address) {
			return parsedData;
		}
	}
	return null;
};

export const verifyKiosk = async (
	kioskId: string,
	kioskCapId: string,
	client: SuiClient,
): Promise<boolean> => {
	try {
		const kioskObject = await client.getObject({
			id: kioskId,
			options: { showContent: true },
		});
		const capObject = await client.getObject({
			id: kioskCapId,
			options: { showContent: true },
		});
		return !!(kioskObject.data && capObject.data);
	} catch (error) {
		logError({ msg: "Error verifying kiosk", method: "fetchKioskFromChain" }, error);
		return false;
	}
};

export const initializeKioskInfo = async (
	address: string,
	client: SuiClient,
	network: Network,
): Promise<KioskInfo | null> => {
	const stored = getStoredKioskInfo(address);
	logger.debug({ msg: "stored kiosk", method: "kiosk:initializeKioskInfo", stored });

	if (stored) {
		const isValid = await verifyKiosk(stored.kioskId, stored.kioskCapId, client);
		if (isValid) {
			return stored;
		}
		localStorage.removeItem(`kioskInfo-${address}`);
	}

	const kioskClient = new KioskClient({ client, network });
	try {
		const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ address });

		if (kioskOwnerCaps && kioskOwnerCaps.length > 0) {
			const nonPersonalKiosk = kioskOwnerCaps.find((kiosk) => !kiosk.isPersonal);

			if (nonPersonalKiosk) {
				return storeKioskInfo(address, nonPersonalKiosk.kioskId, nonPersonalKiosk.objectId);
			}
		}
	} catch (error) {
		logError(
			{
				msg: "Error fetching kiosks from network",
				method: "initializeKioskInfo",
			},
			error,
		);
	}

	return null;
};

function createKioskTx(client: SuiClient, userAddr: string, network: Network): Transaction {
	const kioskClient = new KioskClient({
		client: client,
		network: network,
	});

	const tx = new Transaction();
	const kioskTx = new KioskTransaction({
		transaction: tx,
		kioskClient,
	});
	kioskTx.create();
	kioskTx.shareAndTransferCap(userAddr);
	kioskTx.finalize();
	return tx;
}
