import axios, { Axios } from 'axios';
import { Game } from './types';

export interface LobbyGame {
	id: string;
	name: string;
	questionCount: number;
	state: 'waiting' | 'countdown' | 'question' | 'ended';
}

export class Api {
	private axios: Axios;

	constructor(baseUrl: string) {
		this.axios = axios.create({ baseURL: baseUrl });
	}

	async getGames(): Promise<Game[]> {
		const response = await this.axios.get<Game[]>('/games');
		return response.data;
	}

}
