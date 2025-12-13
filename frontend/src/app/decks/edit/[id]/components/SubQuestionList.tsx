'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SubQuestionForm } from './SubQuestionForm';
import { SubQuestionListProps } from './types';

export function SubQuestionList({
	existingSubQuestions,
	newSubQuestions,
	onExistingChange,
	onNewChange,
	onAddNew,
	onRemoveNew,
}: SubQuestionListProps) {
	return (
		<div className="space-y-4">
			{/* Existing Sub-Questions */}
			{existingSubQuestions.length > 0 && (
				<div className="space-y-4 border p-4 rounded-lg bg-white shadow-inner">
					<h3 className="font-bold text-lg text-blue-700">
						Existing Sub-Questions ({existingSubQuestions.length})
					</h3>
					{existingSubQuestions.map((subQ, index) => (
						<SubQuestionForm
							key={subQ.id || index}
							subQuestion={subQ}
							index={index}
							onChange={onExistingChange}
							label={`Sub-Question ${index + 1}`}
							showRemoveButton={false}
						/>
					))}
				</div>
			)}

			{/* New Sub-Questions */}
			{newSubQuestions.length > 0 && (
				<div className="space-y-4 border p-4 rounded-lg bg-green-50 shadow-inner">
					<h3 className="font-bold text-lg text-green-700">
						New Sub-Questions ({newSubQuestions.length})
					</h3>
					{newSubQuestions.map((subQ, index) => (
						<SubQuestionForm
							key={`new-${index}`}
							subQuestion={subQ}
							index={index}
							onChange={onNewChange}
							onRemove={onRemoveNew}
							label={`New Sub-Question ${index + 1}`}
							showRemoveButton={true}
						/>
					))}
				</div>
			)}

			{/* Add New Sub-Question Button */}
			<Button
				type="button"
				variant="outline"
				onClick={onAddNew}
				className="w-full"
			>
				<Plus className="w-4 h-4 mr-2" />
				Add Sub-Question
			</Button>
		</div>
	);
}
