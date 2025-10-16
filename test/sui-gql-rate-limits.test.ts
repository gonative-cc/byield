/* eslint-disable @typescript-eslint/no-explicit-any */
const TESTNET_ENDPOINT = "https://graphql.testnet.sui.io/graphql";
const MAINNET_ENDPOINT = "https://graphql.mainnet.sui.io/graphql";

interface QueryResult {
	requestNumber: number;
	duration: number;
	success: boolean;
	error?: string;
}

async function queryKioskCaps(endpoint: string, address: string): Promise<any> {
	const query = `
		query ($userAddress: SuiAddress!) {
			address(address: $userAddress) {
				objects(filter: { type: "0x2::kiosk::KioskOwnerCap" }) {
					nodes {
						... on MoveObject {
							address
							contents { json }
						}
					}
				}
			}
		}
	`;

	const response = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query,
			variables: { userAddress: address },
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	return response.json();
}

export async function testSequentialRateLimit(network: "testnet" | "mainnet" = "testnet") {
	const endpoint = network === "mainnet" ? MAINNET_ENDPOINT : TESTNET_ENDPOINT;
	const testAddress = "0x0000000000000000000000000000000000000000000000000000000000000000";

	console.log("Starting Sequential GraphQL Rate Limit Test");
	console.log(`Network: ${network}`);
	console.log("Making 1000 requests sequentially to find rate limits\n");

	const results: QueryResult[] = [];

	for (let i = 0; i < 1000; i++) {
		try {
			const start = Date.now();
			await queryKioskCaps(endpoint, testAddress);
			const duration = Date.now() - start;

			results.push({
				requestNumber: i + 1,
				duration,
				success: true,
			});

			if ((i + 1) % 50 === 0) {
				console.log(`Completed ${i + 1} requests (last: ${duration}ms)`);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			results.push({
				requestNumber: i + 1,
				duration: 0,
				success: false,
				error: errorMessage,
			});

			console.error(`Request ${i + 1} failed: ${errorMessage}`);
			if (
				errorMessage.includes("rate limit") ||
				errorMessage.includes("429") ||
				errorMessage.includes("too many requests")
			) {
				console.log(`\nRate limit hit after ${i + 1} requests`);
				break;
			}
		}
	}

	printResults("Sequential Rate Limit Test", results);
}

export async function testConcurrentRateLimit(network: "testnet" | "mainnet" = "testnet") {
	const endpoint = network === "mainnet" ? MAINNET_ENDPOINT : TESTNET_ENDPOINT;
	const testAddress = "0x0000000000000000000000000000000000000000000000000000000000000000";

	console.log("Starting Concurrent GraphQL Rate Limit Test");
	console.log(`Network: ${network}`);
	console.log("Sending batches of 10 concurrent requests\n");

	const results: Array<{ success: boolean; duration: number; error?: string }> = [];
	const concurrentBatchSize = 10;
	const totalBatches = 100;

	for (let batch = 0; batch < totalBatches; batch++) {
		const batchPromises = Array.from({ length: concurrentBatchSize }, async () => {
			const start = Date.now();
			try {
				await queryKioskCaps(endpoint, testAddress);
				return { success: true, duration: Date.now() - start };
			} catch (error) {
				return {
					success: false,
					duration: Date.now() - start,
					error: error instanceof Error ? error.message : String(error),
				};
			}
		});

		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);

		const successCount = batchResults.filter((r) => r.success).length;
		console.log(
			`Batch ${batch + 1}/${totalBatches}: ${successCount}/${concurrentBatchSize} succeeded`,
		);

		const failedResults = batchResults.filter((r) => !r.success);
		if (failedResults.length > 0) {
			console.log(`\nRate limit hit at batch ${batch + 1}`);
			console.log(`Error: ${failedResults[0].error}`);
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	console.log("\n" + "=".repeat(60));
	console.log("Concurrent Rate Limit Test Results");
	console.log("=".repeat(60));

	const successful = results.filter((r) => r.success);
	const failed = results.filter((r) => !r.success);

	console.log(`Total requests: ${results.length}`);
	console.log(`Successful: ${successful.length}`);
	console.log(`Failed: ${failed.length}`);

	if (successful.length > 0) {
		const durations = successful.map((r) => r.duration);
		const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
		console.log(`Average response time: ${avg.toFixed(0)}ms`);
	}

	console.log("=".repeat(60) + "\n");
}

function printResults(testName: string, results: QueryResult[]) {
	console.log("\n" + "=".repeat(60));
	console.log(testName);
	console.log("=".repeat(60));

	const successful = results.filter((r) => r.success);
	const failed = results.filter((r) => !r.success);

	console.log(`Total requests: ${results.length}`);
	console.log(`Successful: ${successful.length}`);
	console.log(`Failed: ${failed.length}`);

	if (successful.length > 0) {
		const durations = successful.map((r) => r.duration);
		const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
		const minDuration = Math.min(...durations);
		const maxDuration = Math.max(...durations);

		console.log(`\nResponse times:`);
		console.log(`  Average: ${avgDuration.toFixed(0)}ms`);
		console.log(`  Min: ${minDuration}ms`);
		console.log(`  Max: ${maxDuration}ms`);
	}

	if (failed.length > 0) {
		console.log(`\nFirst failure at request: ${failed[0].requestNumber}`);
		console.log(`Error: ${failed[0].error}`);
	}

	console.log("=".repeat(60) + "\n");
}

if (import.meta.main) {
	const args = process.argv.slice(2);

	const getNetwork = (): "testnet" | "mainnet" => {
		if (args.includes("--network")) {
			const networkIdx = args.indexOf("--network");
			const network = args[networkIdx + 1];
			if (network === "mainnet" || network === "testnet") {
				return network;
			}
		}
		return "testnet";
	};

	if (args.includes("--sequential")) {
		const network = getNetwork();
		await testSequentialRateLimit(network);
	} else if (args.includes("--concurrent")) {
		const network = getNetwork();
		await testConcurrentRateLimit(network);
	} else {
		console.log(`
Sui GraphQL Rate Limit Testing Tool

Commands:
  --sequential              Test sequential rate limits (1000 requests)
  --concurrent              Test concurrent rate limits (batches of 10 parallel)
  --network <mainnet|testnet>  Specify network (default: testnet)

Examples:
  bun run test/sui-gql-rate-limits.test.ts --sequential
  bun run test/sui-gql-rate-limits.test.ts --concurrent
  bun run test/sui-gql-rate-limits.test.ts --sequential --network mainnet
  bun run test/sui-gql-rate-limits.test.ts --concurrent --network testnet
		`);
	}
}
