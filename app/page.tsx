"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { groupBy } from 'lodash';
import UserTodoList from '../components/UserTodoList';
import NewUserForm from '../components/NewUserForm';

export default function Home() {
	const [todosByUser, setTodosByUser] = useState<{ [key: string]: any[] }>({});
	const [visaStats, setVisaStats] = useState({
		granted: 0,
		pending: 0,
		denied: 0,
	});

	const fetchTodos = async () => {
		const { data, error } = await supabase.from('todos').select('*');
		if (error) {
			console.error('Error fetching todos:', error);
		} else {
			const groupedTodos = groupBy(data, 'user_name');
			setTodosByUser(groupedTodos);

			// Calculate visa stats
			let applied = 0;
			let granted = 0;
			let denied = 0;

			Object.values(groupedTodos).forEach((todos) => {
				const hasApplied = todos.some((todo) => todo.task === 'Visa applied' && todo.is_completed);
				const hasGranted = todos.some((todo) => todo.task === 'Visa Granted' && todo.is_completed);

				if (hasApplied) {
					applied++;
					if (hasGranted) {
						granted++;
					} else {
						denied++;
					}
				}
			});

			setVisaStats({ applied, granted, denied });
		}
	};

	useEffect(() => {
		fetchTodos();
	}, []);

	const createNewUser = async (name: string, country: string) => {
		const defaultTodos = [
			{ task: 'User has submitted documents', is_completed: false },
			{ task: 'Documents are complete and checked', is_completed: false },
			{ task: 'Visa applied', is_completed: false },
			{ task: 'Visa Granted', is_completed: false }, // Only Visa Granted task
		];

		const { data, error } = await supabase
			.from('todos')
			.insert(defaultTodos.map((todo) => ({ ...todo, user_name: name, country })));

		if (error) {
			console.error('Error creating new user:', error);
		} else {
			fetchTodos(); // Refresh the list
		}
	};

	const toggleTodo = async (id: string, isCompleted: boolean, task: string, userName: string) => {
		// If Visa Granted is being toggled to true, set Visa Denied to false
		if (task === 'Visa Granted' && isCompleted === false) {
			const { data: deniedTask } = await supabase
				.from('todos')
				.select('id')
				.eq('user_name', userName)
				.eq('task', 'Visa Denied')
				.single();

			if (deniedTask) {
				await supabase
					.from('todos')
					.update({ is_completed: false })
					.eq('id', deniedTask.id);
			}
		}

		// If Visa Denied is being toggled to true, set Visa Granted to false
		if (task === 'Visa Denied' && isCompleted === false) {
			const { data: grantedTask } = await supabase
				.from('todos')
				.select('id')
				.eq('user_name', userName)
				.eq('task', 'Visa Granted')
				.single();

			if (grantedTask) {
				await supabase
					.from('todos')
					.update({ is_completed: false })
					.eq('id', grantedTask.id);
			}
		}

		// Toggle the current task
		const { error } = await supabase
			.from('todos')
			.update({ is_completed: !isCompleted })
			.eq('id', id);

		if (error) {
			console.error('Error updating todo:', error);
		} else {
			fetchTodos(); // Refresh the list and stats
		}
	};

	return (
		<div className="p-4">
			<p className="text-2xl font-bold mb-4">Visa Tracking!</p>
		
			<div className="flex gap-4 mb-6">
				<div className="p-4 bg-blue-100 rounded-lg">
					<h3 className="text-lg font-semibold">Applied</h3>
					<p className="text-2xl">{visaStats.applied}</p>
				</div>
				<div className="p-4 bg-green-100 rounded-lg">
					<h3 className="text-lg font-semibold">Granted</h3>
					<p className="text-2xl">{visaStats.granted}</p>
				</div>
				<div className="p-4 bg-red-100 rounded-lg">
					<h3 className="text-lg font-semibold">Denied</h3>
					<p className="text-2xl">{visaStats.denied}</p>
				</div>
			</div>

			<NewUserForm onSubmit={createNewUser} />
			<div className="mt-6 space-y-4">
				{Object.entries(todosByUser).map(([userName, todos]) => (
					<UserTodoList
						key={userName}
						userName={userName}
						todos={todos}
						toggleTodo={(id, isCompleted, task) => toggleTodo(id, isCompleted, task, userName)}
					/>
				))}
			</div>
		</div>
	);
}