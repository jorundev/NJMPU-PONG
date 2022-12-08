import {
	type WsPong,
	PongAction,
	type WsPongBounce,
	type WsPongReset,
	type WsPongMove,
} from '../websocket/types';
import type { NewBallState } from './Ball';
import { PlayerRole, Pong, type BallOut } from './Pong';
interface PongWebsocket {
	send: (msg: string) => void;
}

export class PongClient {
	private clientGame: Pong;
	private role: PlayerRole;
	private shift = false;

	constructor(role: PlayerRole, ws: PongWebsocket) {
		this.role = role;
		this.clientGame = new Pong(60);
		// this.clientGame.onBallBounce((state) => {
		//     this.clientGame.setBallState(state);
		// });
		this.clientGame.onPlayerMove((movement) => {
			const { player, ...data } = movement;
			if (movement.player === role) {
				ws.send(
					JSON.stringify({
						namespace: 'Pong',
						action: 'MOVE',
						data,
					}),
				);
			}
		});
		// this.clientGame.onBallOut((bo: BallOut) => {
		//     this.clientGame.reset(bo.player1Score, bo.player2Score);
		// });
	}

	setColors(colors: [string, string]) {
		this.clientGame.setColors(colors);
	}

	receivePacket(packet: WsPong) {
		switch (packet.action) {
			case PongAction.Bounce:
				const bounceData = packet as WsPongBounce;
				this.clientGame.setBallState(bounceData.data);
				break;
			case PongAction.Reset:
				const resetData = packet as WsPongReset;
				this.clientGame.reset(resetData.data.player1Score, resetData.data.player2Score);
				break;
			case PongAction.Move:
				const moveData = packet as WsPongMove;
				this.clientGame.setPlayerMoveTarget(
					moveData.player,
					moveData.data.moveTarget,
					false,
				);
				break;
		}
	}

	update(dt: number): void {
		this.clientGame.update(dt);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.clientGame.draw(ctx);
	}

	moveUp() {
		const speed = this.shift ? Pong.MAX_PLAYER_SPEED : Pong.MAX_PLAYER_SPEED / 2;
		const newY = this.clientGame.getPlayerY(this.role) - speed;
		this.clientGame.setPlayerMoveTarget(this.role, newY, true);
	}

	moveDown() {
		const speed = this.shift ? Pong.MAX_PLAYER_SPEED : Pong.MAX_PLAYER_SPEED / 2;
		const newY = this.clientGame.getPlayerY(this.role) + speed;
		this.clientGame.setPlayerMoveTarget(this.role, newY, true);
	}

	setShift(shift: boolean) {
		this.shift = shift;
	}

	onMouseMove(mouseX: number, mouseY: number) {
		this.clientGame.setPlayerMoveTarget(this.role, mouseY, true);
	}
}
