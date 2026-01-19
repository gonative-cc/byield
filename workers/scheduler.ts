import { BitcoinNetworkType } from "sats-connect";
import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { logError, logger } from "~/lib/log";
import { ParamsDB } from "~/db/paramsDB";

export async function handleSchedule(env: Env) {
	try {
		const paramsDB = new ParamsDB(env.BYieldD1);
		const {
			nbtc: { setupId: mainnetSetupId },
		} = mainnetCfg;
		const {
			nbtc: { setupId: testnetSetupId },
		} = testnetCfg;

		const { mempoolApiUrl: mainnetMempoolUrl } = mustGetBitcoinConfig(
			BitcoinNetworkType.Mainnet,
		);
		const { mempoolApiUrl: testnetMempoolUrl } = mustGetBitcoinConfig(
			BitcoinNetworkType.Testnet,
		);

		const [mainnetResponse, testnetResponse] = await Promise.all([
			fetch(`${mainnetMempoolUrl}/fees/recommended`),
			fetch(`${testnetMempoolUrl}/fees/recommended`),
		]);

		const mainnetFee = (await mainnetResponse.json<{ minimumFee: number }>()).minimumFee;
		const testnetFee = (await testnetResponse.json<{ minimumFee: number }>()).minimumFee;

		await paramsDB.insertRecommendedFees([
			{
				setupId: mainnetSetupId,
				fee: mainnetFee,
			},
			{
				setupId: testnetSetupId,
				fee: testnetFee,
			},
		]);

		logger.debug({ msg: "Hourly batch sync successful" });
	} catch (err) {
		logError({ msg: "Hourly sync failed", method: "handleSchedule", error: err });
	}
}
