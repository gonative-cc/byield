import { FormProvider, useForm } from "react-hook-form";
import { SUI } from "~/lib/denoms";
import { AttemptAuction } from "./AttemptAuction";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";

interface BeelieversBidForm {
	bid: string;
	note: string;
}

export function BeelieversBid() {
	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			bid: "",
			note: "",
		},
	});
	const { handleSubmit } = bidForm;

	return (
		<FormProvider {...bidForm}>
			<form
				onSubmit={handleSubmit((formData) => {
					// TODO: handle the bid form data
					console.log("Depositing with Sui Address:", formData);
				})}
				className="flex justify-center w-full"
			>
				<Card className="md:w-1/2">
					<CardContent className="p-4 rounded-lg text-white flex flex-col w-full gap-4 bg-azure-10">
						<div className="flex justify-between">
							<span className="text-2xl font-bold">Beelievers Bid</span>
							<AttemptAuction />
						</div>
						<div className="flex flex-col w-full">
							<FormNumericInput
								required
								name="bid"
								placeholder="Minimum Bid: 1 SUI"
								className="h-14"
								allowNegative={false}
								decimalScale={SUI}
								createEmptySpace
								rules={{
									validate: {
										minVal: (val: string) => Number(val) >= 1 || "Min bid amount is 1",
									},
								}}
							/>
							<FormInput
								name="note"
								placeholder="Add note..."
								className="h-14"
								createEmptySpace
								maxLength={30}
							/>
							<Button>Bid Amount</Button>
							<span className="text-sm self-center">Auction ends in 00 : 23 :12</span>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
