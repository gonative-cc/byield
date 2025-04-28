import * as bitcoin from "bitcoinjs-lib";
import { useCallback, useEffect, useState } from "react";
import Wallet, {
	Address,
	AddressPurpose,
	BitcoinNetworkType,
	changeNetworkMethodName,
	connectMethodName,
	disconnectMethodName,
	getAddressesMethodName,
	getBalanceMethodName,
	getNetworkMethodName,
} from "sats-connect";
import axios from "axios";

interface UtxoI {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
}

interface ValidateAddressI {
	isValid: boolean;
	address: string;
	scriptPubKey: string;
	isscript: boolean;
	iswitness: boolean;
	witness_version: number;
	witness_program: string;
}

const MEMPOOL_API = "https://mempool.space/testnet4/api";

export const useWallet = () => {
	const [addressInfo, setAddressInfo] = useState<Address[]>([]);
	const [balance, setBalance] = useState<string>();
	const [network, setNetwork] = useState<BitcoinNetworkType>(BitcoinNetworkType.Mainnet);
	const isConnected = addressInfo.length > 0;

	const getBalance = useCallback(async () => {
		try {
			const response = await Wallet.request(getBalanceMethodName, null);
			if (response.status === "success") {
				setBalance(response.result.total);
			}
		} catch (err) {
			console.log(err);
		}
	}, []);

	const getAddresses = useCallback(async () => {
		const response = await Wallet.request(getAddressesMethodName, {
			purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
		});
		if (response.status === "success") {
			setAddressInfo(response.result.addresses);
		}
	}, []);

	const getNetworkStatus = useCallback(async () => {
		const response = await Wallet.request(getNetworkMethodName, null);
		if (response.status === "success") {
			setNetwork(response.result.bitcoin.name);
		}
	}, []);

	useEffect(() => {
		async function getWalletStatus() {
			await getAddresses();
			await getBalance();
			await getNetworkStatus();
		}
		getWalletStatus();
	}, [network]);

	const connectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(connectMethodName, {
				permissions: [
					{
						type: "wallet",
						resourceId: "",
						actions: {
							readNetwork: true,
						},
					},
					{
						type: "account",
						resourceId: "",
						actions: {
							read: true,
						},
					},
				],
			});
			if (response.status === "success") {
				await getAddresses();
			}
		} catch (err) {
			console.log(err);
		}
	}, []);

	const disconnectWallet = useCallback(async () => {
		try {
			const response = await Wallet.request(disconnectMethodName, null);
			if (response.status === "success") setAddressInfo([]);
		} catch (err) {
			console.log(err);
		}
	}, []);

	const switchNetwork = useCallback(async (newNetwork: BitcoinNetworkType) => {
		const response = await Wallet.request(changeNetworkMethodName, {
			name: newNetwork,
		});
		if (response.status === "success") setNetwork(newNetwork);
	}, []);

	const fetchUTXOs = useCallback(async (address: string): Promise<UtxoI[]> => {
		try {
			const response = await axios.get(`${MEMPOOL_API}/address/${address}/utxo`);
			return response.data.map((utxo: UtxoI) => ({
				txid: utxo.txid,
				vout: utxo.vout,
				value: utxo.value,
				scriptPubKey: utxo.scriptpubkey,
			}));
		} catch (error) {
			throw new Error(`Failed to fetch UTXOs: ${error}`);
		}
	}, []);

	const fetchValidateAddress = useCallback(async (address: string): Promise<ValidateAddressI> => {
		try {
			const response = await axios.get(`${MEMPOOL_API}/v1/validate-address/${address}`);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to fetch UTXOs: ${error}`);
		}
	}, []);

	const sendTxn = useCallback(async () => {
		// bitcoin wallet address
		const bitcoinAddress = addressInfo.find((adr) => adr.purpose === AddressPurpose.Payment);
		if (!bitcoinAddress) return;
		// fetch utxos
		const utxos: UtxoI[] = await fetchUTXOs(bitcoinAddress.address);
		if (!utxos?.length) return;
		// validate address
		const validateAddress: ValidateAddressI = await fetchValidateAddress(bitcoinAddress.address);
		if (!validateAddress) return;

		const network = bitcoin.networks.testnet;
		const psbt = new bitcoin.Psbt({ network });

		psbt.addInput({
			hash: utxos?.[0]?.txid,
			index: utxos?.[0]?.vout,
			witnessUtxo: {
				script: Buffer.from(validateAddress.scriptPubKey, "hex"),
				value: utxos?.[0]?.value,
			},
		});

		const sendAmount = 1000;
		psbt.addOutput({
			// TODO: replace hardcoded P2WPKH address for nBTC deposits
			address: "tb1qe60n447jylrxa96y6pfgy8pq6x9zafu09ky7cq",
			value: sendAmount,
		});

		// Add OP_RETURN output
		// TODO: hardcoded sui address
		const opReturnData = Buffer.from(
			"0x0dfeef16c6730d27c1b53ba3b96c75831c2fbc66882b3ff136513bbdce9c60ea",
			"utf8",
		);
		const opReturnScript = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, opReturnData]);
		psbt.addOutput({
			script: opReturnScript,
			value: 0,
		});

		// Add change output
		const fee = 300;
		const changeAmount = utxos?.[0]?.value - sendAmount - fee;
		if (changeAmount <= 0) {
			throw new Error("Insufficient funds for transaction and fee.");
		}
		psbt.addOutput({
			address: bitcoinAddress.address,
			value: changeAmount,
		});

		const txHex = psbt.toBase64();
		await Wallet.request("signPsbt", {
			psbt: txHex,
			signInputs: {
				[bitcoinAddress.address]: [0],
			},
			broadcast: true,
		});
	}, [addressInfo]);

	return {
		isConnected,
		balance,
		network,
		addressInfo,
		sendTxn,
		connectWallet,
		disconnectWallet,
		switchNetwork,
	};
};
