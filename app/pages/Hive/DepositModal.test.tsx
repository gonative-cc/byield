import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DepositModal } from "./DepositModal";

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
	useNetworkVariables: vi.fn(() => ({ lockdrop: {} })),
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

describe("DepositModal", () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render modal when open", () => {
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);
		expect(screen.getByText("Deposit Assets to Lockdrop")).toBeInTheDocument();
	});

	it("should not render modal when closed", () => {
		render(<DepositModal id="deposit-assets-modal" open={false} onClose={mockOnClose} />);
		expect(screen.queryByText("Deposit Assets to Lockdrop")).not.toBeInTheDocument();
	});

	it("should display SUI input field", () => {
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);
		expect(screen.getByPlaceholderText("Enter SUI amount")).toBeInTheDocument();
	});

	it("should show max button with balance", () => {
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);
		expect(screen.getByText(/Balance:/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Max" })).toBeInTheDocument();
	});

	it("should populate input when max button clicked", async () => {
		const user = userEvent.setup();
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);

		const maxButton = screen.getByRole("button", { name: "Max" });
		await user.click(maxButton);

		const input = screen.getByPlaceholderText("Enter SUI amount") as HTMLInputElement;
		expect(input.value).not.toBe("");
	});

	it("should show deposit button", () => {
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);
		expect(screen.getByRole("button", { name: /Deposit Assets/ })).toBeInTheDocument();
	});

	it("should show lockdrop info text", () => {
		render(<DepositModal id="deposit-assets-modal" open={true} onClose={mockOnClose} />);
		expect(screen.getByText(/Your SUI will be locked in the lockdrop escrow/)).toBeInTheDocument();
	});
});
