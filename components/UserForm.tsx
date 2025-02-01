import { useState } from 'react';

export default function UserForm({ onSubmit }: { onSubmit: (name: string, country: string) => void }) {
	const [name, setName] = useState('');
	const [country, setCountry] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(name, country);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<input
				type="text"
				placeholder="Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="p-2 border rounded"
				required
			/>
			<input
				type="text"
				placeholder="Country"
				value={country}
				onChange={(e) => setCountry(e.target.value)}
				className="p-2 border rounded"
				required
			/>
			<button type="submit" className="p-2 bg-blue-500 text-white rounded">
				Submit
			</button>
		</form>
	);
}