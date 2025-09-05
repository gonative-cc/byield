import { Transaction } from "@mysten/sui/transactions";
import { KioskClient, Network, KioskTransaction } from "@mysten/kiosk";
import type { SuiClient } from "@mysten/sui/client";

export interface KioskInfo {
	kioskId: string;
	kioskCapId: string;
	address: string;
	isPersonal?: boolean;
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
		console.error("Error verifying kiosk:", error);
		return false;
	}
};

export const initializeKioskInfo = async (
	address: string,
	client: SuiClient,
	network: Network,
): Promise<KioskInfo | null> => {
	const stored = getStoredKioskInfo(address);
	console.log("stored kiosk", stored);

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
		console.error("Error fetching kiosks from network:", error);
	}

	return null;
};

export function createKioskTx(client: SuiClient, userAddr: string, network: Network): Transaction {
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
