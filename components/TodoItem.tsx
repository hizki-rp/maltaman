import { supabase } from '../lib/supabaseClient';

export default function TodoItem({ todo, onToggle }: { todo: any; onToggle: () => void }) {
	const handleToggle = async () => {
		const { error } = await supabase
			.from('todos')
			.update({ is_completed: !todo.is_completed })
			.eq('id', todo.id);

		if (error) {
			console.error('Error updating todo:', error);
		} else {
			onToggle();
		}
	};

	return (
		<div className="flex items-center space-x-2">
			<input
				type="checkbox"
				checked={todo.is_completed}
				onChange={handleToggle}
				className="form-checkbox"
			/>
			<span>{todo.task}</span>
		</div>
	);
}