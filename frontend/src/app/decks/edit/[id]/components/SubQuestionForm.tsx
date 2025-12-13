'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SubQuestionFormProps } from './types';

export function SubQuestionForm({
	subQuestion,
	index,
	onChange,
	onRemove,
	showRemoveButton = false,
	label,
}: SubQuestionFormProps) {
	return (
		<div className="space-y-2 border-l-4 pl-4 py-2 border-blue-200">
			<div className="flex justify-between items-center">
				<p className="font-medium text-sm text-gray-700">
					{label}
					{subQuestion.id && (
						<span className="text-gray-400 ml-1">
							(ID: {subQuestion.id})
						</span>
					)}
				</p>
				{showRemoveButton && onRemove && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onRemove(index)}
						className="text-red-500 hover:text-red-700"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				)}
			</div>

			<Textarea
				value={subQuestion.front}
				onChange={(e) => onChange(index, 'front', e.target.value)}
				placeholder="Sub-Question Front"
				rows={2}
			/>

			<Textarea
				value={subQuestion.back}
				onChange={(e) => onChange(index, 'back', e.target.value)}
				placeholder="Sub-Question Back"
				rows={3}
			/>

			<Textarea
				value={subQuestion.explanation || ''}
				onChange={(e) => onChange(index, 'explanation', e.target.value)}
				placeholder="Sub-Question Explanation (Optional)"
				rows={2}
			/>
		</div>
	);
}
