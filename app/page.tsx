"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { groupBy } from 'lodash';
import UserTodoList from '../components/UserTodoList';
import NewUserForm from '../components/NewUserForm';

export default function Home() {
	const [todosByUser, setTodosByUser] = useState<{ [key: string]: any[] }>({});
	const [users, setUsers] = useState<any[]>([]); // Add this line
	const [visaStats, setVisaStats] = useState({
		applied: 0,
		granted: 0,
		denied: 0,
	});

	const fetchTodos = async () => {
		// Fetch users
		const { data: users, error: usersError } = await supabase.from('users').select('*');
		if (usersError) {
			console.error('Error fetching users:', usersError);
			return;
		}
		setUsers(users || []); // Store users in state

		// Fetch todos
		const { data: todos, error: todosError } = await supabase.from('todos').select('*');
		if (todosError) {
			console.error('Error fetching todos:', todosError);
			return;
		}

		// Group todos by user_id
		const todosByUser = groupBy(todos, 'user_id');
		setTodosByUser(todosByUser);

		// Calculate visa stats
		let applied = 0;
		let granted = 0;
		let denied = 0;

		users.forEach((user) => {
			const userTodos = todosByUser[user.id] || [];
			const hasApplied = userTodos.some((todo) => todo.task === 'Visa applied' && todo.is_completed);
			const hasGranted = userTodos.some((todo) => todo.task === 'Visa Granted' && todo.is_completed);

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
	};

	useEffect(() => {
		fetchTodos();
	}, []);

	const createNewUser = async (name: string, country: string) => {
		// Insert new user into the users table
		const { data: user, error: userError } = await supabase
			.from('users')
			.insert([{ name, country }])
			.select()
			.single();

		if (userError) {
			console.error('Error creating user:', userError);
			return;
		}

		// Insert default tasks into the todos table for the new user
		const defaultTodos = [
			{ task: 'User has submitted documents', is_completed: false },
			{ task: 'Documents are complete and checked', is_completed: false },
			{ task: 'Visa applied', is_completed: false },
			{ task: 'Visa Granted', is_completed: false },
		];

		const { error: todosError } = await supabase
			.from('todos')
			.insert(defaultTodos.map((todo) => ({ ...todo, user_id: user.id })));

		if (todosError) {
			console.error('Error creating todos:', todosError);
		} else {
			fetchTodos(); // Refresh the list
		}
	};

	const toggleTodo = async (id: string, isCompleted: boolean) => {
		const { error } = await supabase
			.from('todos')
			.update({ is_completed: !isCompleted })
			.eq('id', id);

		if (error) {
			console.error('Error updating todo:', error);
		} else {
			fetchTodos(); // Refresh the list
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Todo App</h1>
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
				{Object.entries(todosByUser).map(([userId, todos]) => {
					const user = users.find((u) => u.id === userId); // Find the user by userId
					if (!user) return null;

					return (
						<UserTodoList
							key={user.id}
							user={user}
							todos={todos}
							toggleTodo={(id, isCompleted, task) => toggleTodo(id, isCompleted, task)}
						/>
					);
				})}
			</div>
		</div>
	);
}