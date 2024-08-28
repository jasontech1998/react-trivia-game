import { Axios } from 'axios';
import { Game } from './types';

export interface LobbyGame {
	id: string;
	name: string;
	questionCount: number;
	state: 'waiting' | 'countdown' | 'question' | 'ended';
}

export class Api {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async getGames(): Promise<Game[]> {
		const response = await fetch(`${this.baseUrl}/games`);
		if (!response.ok) {
			throw new Error('Failed to fetch games');
		}
		return response.json();
	}

	// ... (previous methods)

	// Remove the fetchTotalQuestions method
}
