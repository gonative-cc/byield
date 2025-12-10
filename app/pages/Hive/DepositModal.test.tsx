import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DepositModal } from "./DepositModal";

const mockDialogElement = {
	showModal: vi.fn(),
	close: vi.fn(),
	id: "deposit-assets-modal",
};

vi.mock("~/components/Wallet/SuiWallet/useBalance", () => ({
	useCoinBalance: vi.fn(() => ({
		balance: 10000000000n,
		refetch: vi.fn(),
	})),
}));

vi.mock("@mysten/dapp-kit", () => ({
	useCurrentAccount: vi.fn(() => ({ address: "0x123" })),
	useSignTransaction: vi.fn(() => ({ mutateAsync: vi.fn() })),
	useSuiClient: vi.fn(() => ({})),
}));

vi.mock("~/networkConfig", () => ({
	useNetworkVariables: vi.fn(() => ({ lockdrop: {}, usdc: {} })),
}));

vi.mock("~/hooks/use-toast", () => ({
	toast: vi.fn(),
}));

vi.mock("~/lib/suienv", () => ({
	signAndExecTx: vi.fn(),
}));

vi.mock("./lockdrop-transactions", () => ({
	createLockdropDepositTxn: vi.fn(),
}));

const getElementByIdSpy = vi.spyOn(document, "getElementById");

describe("DepositModal", () => {
	const mockOnClose = vi.fn();
	const mockRefetchDeposit = vi.fn();

	beforeEach(() => {
		getElementByIdSpy.mockImplementation((id) => {
			if (id === "deposit-assets-modal") {
				return mockDialogElement as unknown as HTMLDialogElement;
			}
			return null;
		});
		vi.clearAllMocks();
	});

	it("should render modal when open", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={true}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.getByText("Deposit Assets to Lockdrop")).toBeInTheDocument();
	});

	it("should not render modal when closed", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={false}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.queryByText("Deposit Assets to Lockdrop")).not.toBeVisible();
	});

	it("should display USDC input field", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={true}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.getByPlaceholderText("Enter USDC amount")).toBeInTheDocument();
	});

	it("should show max button", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={true}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.getByText(/Balance:/)).toBeInTheDocument();
		expect(screen.getByText(/Max/)).toBeInTheDocument();
	});

	it("should show deposit button", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={true}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.getByText(/Deposit Assets/i)).toBeInTheDocument();
	});

	it("should show lockdrop info text", () => {
		render(
			<DepositModal
				id="deposit-assets-modal"
				open={true}
				onClose={mockOnClose}
				refetchDeposit={mockRefetchDeposit}
			/>,
		);
		expect(screen.getByText(/Your USDC will be locked in the lockdrop escrow/)).toBeInTheDocument();
	});
});
