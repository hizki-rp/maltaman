"use client"
import { useState } from 'react';

export default function NewUserForm({ onSubmit }: { onSubmit: (name: string, country: string) => void }) {
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, country);
        setName('');
        setCountry('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold">Create New User</h2>
            <input
                type="text"
                placeholder="Client Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            <input
                type="text"
                placeholder="Travel Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Create User
            </button>
        </form>
    );
}