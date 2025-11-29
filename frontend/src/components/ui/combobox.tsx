'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxOption {
	value: string;
	label: string;
}

interface ComboboxProps {
	options: ComboboxOption[];
	value: string | null;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function Combobox({
	options,
	value,
	onChange,
	// HOUSE: Change default placeholder
	placeholder = 'Choose a plausible differential...',
	className,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	// ⚠️ NO local search state needed, Command handles it internally

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn('w-full justify-between', className)}
				>
					{value
						? options.find((option) => option.value === value)
								?.label
						: placeholder}
					<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full min-w-[200px] p-0">
				<Command>
					{/* CommandInput now automatically controls the filtering of the CommandList */}
					<CommandInput placeholder={placeholder} />
					<CommandList>
						{/* HOUSE: Change Empty message */}
						<CommandEmpty>
							<div className="italic p-2">
								Nothing found. You've stumped the machine. Lie
								down.
							</div>
						</CommandEmpty>
						<CommandGroup>
							{/* We map over ALL options. Command handles hiding/showing them. */}
							{options.map((option) => (
								<CommandItem
									key={option.value}
									// IMPORTANT: Pass the 'label' as the CommandItem value for searchability
									// This is the standard Shadcn pattern for internal filtering
									value={option.label}
									onSelect={(currentLabel) => {
										// Find the original 'value' (ID) based on the 'label' returned by Command
										const selectedOption = options.find(
											(opt) =>
												opt.label.toLowerCase() ===
												currentLabel.toLowerCase()
										);
										const selectedValue =
											selectedOption?.value || '';

										// Toggle logic: If the current value is the same as the newly selected value, clear it, otherwise set it.
										onChange(
											selectedValue === value
												? ''
												: selectedValue
										);
										setOpen(false);
										// No need to clear local search state since it doesn't exist
									}}
								>
									<CheckIcon
										className={cn(
											'mr-2 h-4 w-4',
											value === option.value
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
