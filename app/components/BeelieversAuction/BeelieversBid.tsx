import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormNumericInput } from "../form/FormNumericInput";
import { SUI } from "~/lib/denoms";
import { AttemptAuction } from "./AttemptAuction";

interface BeelieversBidForm {
	bid: string;
}

export function BeelieversBid() {
	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			bid: "",
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
								rightAdornments={<Button>Bid Amount</Button>}
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
							<span className="text-sm self-center">Auction ends in 00 : 23 :12</span>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
