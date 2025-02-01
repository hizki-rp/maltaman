"use client"
import { useState } from 'react';
import { supabase } from "../lib/supabaseClient";

export default function UserTodoList({
    userName,
    todos,
    toggleTodo,
}: {
    userName: string;
    todos: any[];
    toggleTodo: (id: string, isCompleted: boolean, task: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Get the country from the first todo (since all todos for a user have the same country)
    const country = todos[0]?.country || '';

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-lg font-semibold">
                    {userName} <span className="text-sm text-gray-500">({country})</span>
                </h2>
                <span className="text-gray-500">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </div>
            {isExpanded && (
                <div className="mt-2 space-y-2">
                    {todos.map((todo) => (
                        <div key={todo.id} className="flex items-center space-x-2">
                            {todo.task === 'Visa Granted' ? (
                                <button
                                    onClick={() => toggleTodo(todo.id, todo.is_completed, todo.task)}
                                    className="flex items-center space-x-2"
                                >
                                    <span className="text-lg">
                                        {todo.is_completed ? '✅' : '❌'}
                                    </span>
                                    <span>{todo.task}</span>
                                </button>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={todo.is_completed}
                                        onChange={() => toggleTodo(todo.id, todo.is_completed, todo.task)}
                                        className="form-checkbox"
                                    />
                                    <span className={todo.is_completed ? 'line-through text-gray-500' : ''}>
                                        {todo.task}
                                    </span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}