import { NewBallState } from './Ball';
import { PlayerRole, Pong } from './Pong';

import {
	WebSocketUser,
	PongAction,
	WsNamespace,
	WsPongBounce,
	WsPongReset,
	WsPongMove,
} from '../../websockets/types';

export class PongServer {
	private readonly gameState: Pong = new Pong(60);
	private player1_ws: WebSocketUser;
	private player2_ws: WebSocketUser;
	private spectators_ws: Array<WebSocketUser> = [];

	constructor(
		player1_ws: WebSocketUser,
		player2_ws: WebSocketUser,
		spectators_ws: Array<WebSocketUser>,
	) {
		this.player1_ws = player1_ws;
		this.player2_ws = player2_ws;
		this.spectators_ws = spectators_ws;

		this.gameState.onBallBounce((nbs: NewBallState) => {
			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Bounce,
				data: nbs,
			} as WsPongBounce);

			this.dispatch(data);
		});
		this.gameState.onBallOut((bo) => {
			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Reset,
				data: bo,
			} as WsPongReset);

			this.dispatch(data);
			this.gameState.reset(bo.player1Score, bo.player2Score);
		});
	}

	dispatchToSpectators(data: string) {
		for (const spectator of this.spectators_ws) {
			spectator.send(data);
		}
	}

	dispatch(data: string, player?: PlayerRole) {
		switch (player) {
			case PlayerRole.PLAYER1:
				this.player2_ws.send(data);
				break;
			case PlayerRole.PLAYER2:
				this.player1_ws.send(data);
				break;
			default:
				this.player2_ws.send(data);
				this.player1_ws.send(data);
		}
		this.dispatchToSpectators(data);
	}

	movePlayer(player: PlayerRole, data: WsPongMove) {
		this.gameState.setPlayerMoveTarget(player, data.data.moveTarget);
		this.dispatch(
			JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Move,
				player,
				data: {
					tick: data.data.tick,
					moveTarget: data.data.moveTarget,
				},
			} as WsPongMove),
			player,
		);
	}

	update(dt: number) {
		this.gameState.update(dt);
	}
}
