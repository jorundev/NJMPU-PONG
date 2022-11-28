import { NewBallState } from './Ball';
import { BallOut, PlayerRole, Pong } from './Pong';

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
	player1_score: number = 0;
	player2_score: number = 0;

	constructor(
		player1_ws: WebSocketUser,
		player2_ws: WebSocketUser,
		spectators_ws: Array<WebSocketUser>,
	) {
		this.player1_ws = player1_ws;
		this.player2_ws = player2_ws;

		this.updateSpectators(spectators_ws);

		this.gameState.onBallBounce((nbs: NewBallState) => {
			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Bounce,
				data: nbs,
			} as WsPongBounce);

			this.greenThread(this.dispatch, data);
		});
		this.gameState.onBallOut((bo: BallOut) => {
			this.player1_score = bo.player1Score;
			this.player2_score = bo.player2Score;

			const data = JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Reset,
				data: bo,
			} as WsPongReset);

			this.greenThread(this.dispatch, data);
			this.gameState.reset(bo.player1Score, bo.player2Score);
		});
	}

	updateSpectators(spectators_ws: Array<WebSocketUser>) {
		this.spectators_ws = spectators_ws;
	}

	async greenThread(fn: Function, data: any) {
		fn(this, data);
	}

	dispatchToSpectators(that: PongServer, data: string) {
		for (const spectator of that.spectators_ws) {
			spectator.send(data);
		}
	}

	dispatch(that: PongServer, data: string) {
		that.player1_ws.send(data);
		that.player2_ws.send(data);
		that.dispatchToSpectators(that, data);
	}

	movePlayer(player: PlayerRole, data: WsPongMove) {
		this.gameState.setPlayerMoveTarget(player, data.data.moveTarget, false);
		this.dispatch(
			this,
			JSON.stringify({
				namespace: WsNamespace.Pong,
				action: PongAction.Move,
				player,
				data: {
					tick: data.data.tick,
					moveTarget: data.data.moveTarget,
				},
			} as WsPongMove),
		);
	}

	update(dt: number) {
		this.gameState.update(dt);
	}
}
