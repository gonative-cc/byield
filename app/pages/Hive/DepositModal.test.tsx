import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { DepositModal } from "./DepositModal";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { signAndExecTx } from "~/lib/suienv";

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
	const mockRedirectTab = vi.fn();
	const mockUpdateDeposit = vi.fn();
	const mockAddTransaction = vi.fn();

	const mockDepositModalProps = {
		id: "deposit-assets-modal",
		open: true,
		onClose: mockOnClose,
		refetchDeposit: mockRefetchDeposit,
		redirectTab: mockRedirectTab,
		updateDeposit: mockUpdateDeposit,
		addTransaction: mockAddTransaction,
	};

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
		render(<DepositModal {...mockDepositModalProps} />);
		expect(screen.getByText("Deposit USDC to Lockdrop")).toBeInTheDocument();
	});

	it("should not render modal when closed", () => {
		render(<DepositModal {...mockDepositModalProps} open={false} />);
		expect(screen.queryByText("Deposit USDC to Lockdrop")).not.toBeVisible();
	});

	it("should display USDC input field", () => {
		render(<DepositModal {...mockDepositModalProps} />);
		expect(screen.getByPlaceholderText("Enter USDC amount")).toBeInTheDocument();
	});

	it("should show max button", () => {
		render(<DepositModal {...mockDepositModalProps} />);
		expect(screen.getByText(/Balance:/)).toBeInTheDocument();
		expect(screen.getByText(/Max/)).toBeInTheDocument();
	});

	it("should show deposit button", () => {
		render(<DepositModal {...mockDepositModalProps} />);
		expect(screen.getAllByText(/Deposit USDC/i)).toHaveLength(2);
	});

	it("should show lockdrop info text", () => {
		render(<DepositModal {...mockDepositModalProps} />);
		expect(screen.getByText(/Your USDC will be locked in the lockdrop escrow/)).toBeInTheDocument();
	});

	it("should call addTransaction when deposit is successful", async () => {
		vi.mocked(signAndExecTx).mockResolvedValue({
			digest: "0xabc123",
			effects: { status: { status: "success" } },
			balanceChanges: [],
		} as unknown as SuiTransactionBlockResponse);

		render(<DepositModal {...mockDepositModalProps} />);

		const amountInput = screen.getByPlaceholderText("Enter USDC amount");
		const depositButton = screen.getByTestId("submit-usdc-btn");

		await userEvent.type(amountInput, "100");
		await userEvent.click(depositButton);

		expect(mockAddTransaction).toHaveBeenCalledWith("0xabc123", 100000000n);
	});
});
