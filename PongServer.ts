import { WebSocket } from 'ws';

import { NewBallState } from './Ball';
import { Pong } from './Pong';

import { PongAction, WsNamespace, WsPongBounce, WsPongReset } from '../../websockets/types';

export class PongServer {
	private readonly gameState: Pong = new Pong(8);
	private spectators_ws: Array<WebSocket> = [];

	constructor(player1_ws: WebSocket, player2_ws: WebSocket, spectators_ws: Array<WebSocket>) {
		this.spectators_ws = spectators_ws;

		this.gameState.onBallBounce((nbs: NewBallState) => {
			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Bounce,
				data: nbs,
			} as WsPongBounce);

			player1_ws.send(data);
			player2_ws.send(data);
			this.dispatchToSpectators(data);
		});
		this.gameState.onBallOut((bo) => {
			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: 'RESET',
				data: bo,
			} as WsPongReset);

			player1_ws.send(data);
			player2_ws.send(data);
			this.dispatchToSpectators(data);

			this.gameState.reset(bo.player1Score, bo.player2Score);
		});
	}

	dispatchToSpectators(data: string) {
		for (const spectator of this.spectators_ws) {
			spectator.send(data);
		}
	}

	update(dt: number) {
		this.gameState.update(dt);
	}
}
