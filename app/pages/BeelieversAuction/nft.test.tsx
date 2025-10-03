import { describe, test, expect } from 'vitest';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { findNftInTxResult } from './nft';

describe('findNftInTxResult', () => {
	test('should extract NFT ID from NFTMinted event', () => {
		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
			events: [
				{
					id: { txDigest: 'test-digest', eventSeq: '0' },
					packageId: '0x123',
					transactionModule: 'mint',
					sender: '0xsender',
					type: '0x123::mint::NFTMinted',
					parsedJson: {
						nft_id: '0xnft123456789',
						owner: '0xowner',
					},
					bcs: 'test-bcs',
					bcsEncoding: 'base58' as const,
					timestampMs: '1234567890',
				},
			],
			effects: {
				messageVersion: 'v1',
				status: { status: 'success' },
				executedEpoch: '100',
				gasUsed: {
					computationCost: '1000',
					storageCost: '500',
					storageRebate: '100',
					nonRefundableStorageFee: '50',
				},
				modifiedAtVersions: [],
				transactionDigest: 'test-digest',
				created: [],
				mutated: [],
				deleted: [],
				gasObject: {
					owner: { AddressOwner: '0xowner' },
					reference: { objectId: '0xgas', version: '1', digest: '0xgasdigest' },
				},
				dependencies: [],
			},
		};

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBe('0xnft123456789');
	});

	test('should return null when no NFTMinted event (kiosk scenario)', () => {
		const kioskId = '0xkiosk123';
		const nftObjectId = '0xnft987654321';

		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
			events: [],
			effects: {
				messageVersion: 'v1',
				status: { status: 'success' },
				executedEpoch: '100',
				gasUsed: {
					computationCost: '1000',
					storageCost: '500',
					storageRebate: '100',
					nonRefundableStorageFee: '50',
				},
				modifiedAtVersions: [],
				transactionDigest: 'test-digest',
				created: [
					{
						owner: { Shared: { initial_shared_version: '1' } },
						reference: { objectId: kioskId, version: '1', digest: '0xkioskdigest' },
					},
					{
						owner: { ObjectOwner: kioskId },
						reference: { objectId: nftObjectId, version: '1', digest: '0xnftdigest' },
					},
				],
				mutated: [],
				deleted: [],
				gasObject: {
					owner: { AddressOwner: '0xowner' },
					reference: { objectId: '0xgas', version: '1', digest: '0xgasdigest' },
				},
				dependencies: [],
			},
		};

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBeNull();
	});

	test('should return null when no NFT found', () => {
		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
			events: [],
			effects: {
				messageVersion: 'v1',
				status: { status: 'success' },
				executedEpoch: '100',
				gasUsed: {
					computationCost: '1000',
					storageCost: '500',
					storageRebate: '100',
					nonRefundableStorageFee: '50',
				},
				modifiedAtVersions: [],
				transactionDigest: 'test-digest',
				created: [
					{
						owner: { AddressOwner: '0xowner' },
						reference: { objectId: '0xother', version: '1', digest: '0xotherdigest' },
					},
				],
				mutated: [],
				deleted: [],
				gasObject: {
					owner: { AddressOwner: '0xowner' },
					reference: { objectId: '0xgas', version: '1', digest: '0xgasdigest' },
				},
				dependencies: [],
			},
		};

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBeNull();
	});

	test('should handle missing events and effects gracefully', () => {
		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
		} as SuiTransactionBlockResponse;

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBeNull();
	});

	test('should handle malformed event data gracefully', () => {
		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
			events: [
				{
					id: { txDigest: 'test-digest', eventSeq: '0' },
					packageId: '0x123',
					transactionModule: 'mint',
					sender: '0xsender',
					type: '0x123::mint::NFTMinted',
					parsedJson: {},
					bcs: 'test-bcs',
					bcsEncoding: 'base58' as const,
					timestampMs: '1234567890',
				},
			],
			effects: {
				messageVersion: 'v1',
				status: { status: 'success' },
				executedEpoch: '100',
				gasUsed: {
					computationCost: '1000',
					storageCost: '500',
					storageRebate: '100',
					nonRefundableStorageFee: '50',
				},
				modifiedAtVersions: [],
				transactionDigest: 'test-digest',
				created: [],
				mutated: [],
				deleted: [],
				gasObject: {
					owner: { AddressOwner: '0xowner' },
					reference: { objectId: '0xgas', version: '1', digest: '0xgasdigest' },
				},
				dependencies: [],
			},
		};

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBeNull();
	});

	test('should extract NFT ID from multiple NFTMinted events (first one)', () => {
		const firstNftId = '0xfirst-nft';
		const secondNftId = '0xsecond-nft';

		const mockResult: SuiTransactionBlockResponse = {
			digest: 'test-digest',
			events: [
				{
					id: { txDigest: 'test-digest', eventSeq: '0' },
					packageId: '0x123',
					transactionModule: 'mint',
					sender: '0xsender',
					type: '0x123::mint::NFTMinted',
					parsedJson: {
						nft_id: firstNftId,
						owner: '0xowner',
					},
					bcs: 'test-bcs',
					bcsEncoding: 'base58' as const,
					timestampMs: '1234567890',
				},
				{
					id: { txDigest: 'test-digest', eventSeq: '1' },
					packageId: '0x123',
					transactionModule: 'mint',
					sender: '0xsender',
					type: '0x123::mint::NFTMinted',
					parsedJson: {
						nft_id: secondNftId,
						owner: '0xowner',
					},
					bcs: 'test-bcs',
					bcsEncoding: 'base58' as const,
					timestampMs: '1234567890',
				},
			],
			effects: {
				messageVersion: 'v1',
				status: { status: 'success' },
				executedEpoch: '100',
				gasUsed: {
					computationCost: '1000',
					storageCost: '500',
					storageRebate: '100',
					nonRefundableStorageFee: '50',
				},
				modifiedAtVersions: [],
				transactionDigest: 'test-digest',
				created: [],
				mutated: [],
				deleted: [],
				gasObject: {
					owner: { AddressOwner: '0xowner' },
					reference: { objectId: '0xgas', version: '1', digest: '0xgasdigest' },
				},
				dependencies: [],
			},
		};

		const nftId = findNftInTxResult(mockResult);
		expect(nftId).toBe(firstNftId);
	});
});
