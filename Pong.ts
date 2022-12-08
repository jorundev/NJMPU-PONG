import { Ball, type NewBallState } from './Ball';
import { Direction } from './Direction';
import { Player } from './Player';

export const GAME_WIDTH = 2048;
export const GAME_HEIGHT = 1024;

export enum PlayerRole {
	PLAYER1,
	PLAYER2,
	SPECTATOR,
}

export interface PongPacket {
	tick: number;
	time: number;
}

export interface PlayerMovement extends PongPacket {
	player: PlayerRole;
	moveTarget: number;
}

export interface BallOut extends PongPacket {
	player1Score: number;
	player2Score: number;
}

export class Pong {
	static MAX_PLAYER_SPEED = 5.0 * (GAME_HEIGHT / 256);
	static CENTER_LINE_WIDTH = 2.0 * (GAME_WIDTH / 512);

	private lastBallPosX = 0;
	private lastBallPosY = 0;

	private updateBall = true;

	private player1 = new Player(30 * (GAME_HEIGHT / 256), Direction.Right);
	private player2 = new Player(GAME_WIDTH - 30 * (GAME_HEIGHT / 256), Direction.Left);
	private ball = new Ball(this);

	private cumulated = 0;
	private currentTick = 0;
	private lastTickWithPlayerEvent = 0;
	private tickPerSecond: number;

	private onBallBounceCallback: (nbs: NewBallState) => void = null;
	private onPlayerMoveCallback: (pm: PlayerMovement) => void = null;
	private onBallOutCallback: (bo: BallOut) => void = null;

	public sendBallBounceToCallback() {
		if (this.onBallBounceCallback) {
			this.onBallBounceCallback({
				tick: this.currentTick,
				time: +new Date(),
				x: this.ball.x,
				y: this.ball.y,
				velX: this.ball.velocityX,
				velY: this.ball.velocityY,
				speed: this.ball.speed,
			});
		}
	}

	setColors(colors: [string, string]) {
		this.player1.setColor(colors[0]);
		this.player2.setColor(colors[1]);
	}

	private correctLag(serverTick: number, tickDiff: number, state: NewBallState) {
		let correctedTick = this.currentTick;

		if (tickDiff < 0) {
			this.currentTick = serverTick;
			return;
		} else if (tickDiff > 0) {
			correctedTick = serverTick;
		}

		const newTickDiff = correctedTick - this.currentTick;
		const correctedDt = newTickDiff / this.tickPerSecond;

		console.log('correction:', correctedDt * 1000, 'ms');

		state.x += state.velX * state.speed * (correctedDt / 2);
		state.y += state.velY * state.speed * (correctedDt / 2);

		this.currentTick = correctedTick;
	}

	private handleTicks(serverTick: number, state: NewBallState) {
		// const tickDiff = serverTick - this.currentTick;
		// let timeDiff = state.time - (+new Date());
		// console.log("ping:", timeDiff, "ms");
		// if (timeDiff < 0) {
		// 	timeDiff = 0;
		// }
		// timeDiff *= 2;
		// timeDiff /= 1000;
		// console.log("correction:", timeDiff, "s");
		// if (timeDiff > 0.02) {
		// 	state.x += state.velX * state.speed * timeDiff;
		// 	state.y += state.velY * state.speed * timeDiff;
		// }
		// if (Math.floor(tickDiff) > 100) {
		// 	this.currentTick = serverTick;
		// 	return ;
		// }
		// this.currentTick += tickDiff * 2;
		//console.log("tick diff:", tickDiff);
		// console.log("time diff:", state.time - (+new Date()), "ms");
		// if (Math.abs(tickDiff) > 20) {
		// } else {
		//this.correctLag(serverTick, tickDiff, state);
		// if (tickDiff > 0) {
		// 	console.log('Server is ' + Math.abs(tickDiff) + ' ticks ahead');
		// } else if (tickDiff < 0) {
		// 	console.log('Server is ' + Math.abs(tickDiff) + ' ticks behind');
		// }
		// }
		// this.cumulated = this.currentTick / this.tickPerSecond;
	}

	public setBallState(state: NewBallState) {
		this.lastBallPosX = state.x;
		this.lastBallPosY = state.y;

		// this.handleTicks(state.tick, state);

		this.ball.x = state.x;
		this.ball.y = state.y;
		this.ball.velocityX = state.velX;
		this.ball.velocityY = state.velY;
		this.ball.speed = state.speed;
	}

	constructor(tickPerSecond: number) {
		this.tickPerSecond = tickPerSecond;
	}

	getPlayer(role: PlayerRole) {
		if (role === PlayerRole.PLAYER1) {
			return this.player1;
		} else if (role === PlayerRole.PLAYER2) {
			return this.player2;
		}
		return null;
	}

	setPlayerMoveTarget(role: PlayerRole, y: number, send: boolean) {
		const player = this.getPlayer(role);
		if (player) {
			player.moveTarget = y;
		}
		if (
			send &&
			this.onPlayerMoveCallback &&
			this.lastTickWithPlayerEvent !== this.currentTick
		) {
			this.lastTickWithPlayerEvent = this.currentTick;
			this.onPlayerMoveCallback({
				tick: this.currentTick,
				time: +new Date(),
				player: role,
				moveTarget: y,
			});
		}
	}

	getPlayerY(role: PlayerRole) {
		const player = this.getPlayer(role);
		if (player) {
			return player.getY();
		}
		return null;
	}

	onBallBounce(cb: (nbs: NewBallState) => void) {
		this.onBallBounceCallback = cb;
	}

	onPlayerMove(cb: (pm: PlayerMovement) => void) {
		this.onPlayerMoveCallback = cb;
	}

	onBallOut(cb: (bo: BallOut) => void) {
		this.onBallOutCallback = cb;
	}

	private movePlayers() {
		let player1yDelta = this.player1.moveTarget - this.player1.getY();
		if (player1yDelta > Pong.MAX_PLAYER_SPEED) {
			player1yDelta = Pong.MAX_PLAYER_SPEED;
		} else if (player1yDelta < -Pong.MAX_PLAYER_SPEED) {
			player1yDelta = -Pong.MAX_PLAYER_SPEED;
		}

		let player2yDelta = this.player2.moveTarget - this.player2.getY();
		if (player2yDelta > Pong.MAX_PLAYER_SPEED) {
			player2yDelta = Pong.MAX_PLAYER_SPEED;
		} else if (player2yDelta < -Pong.MAX_PLAYER_SPEED) {
			player2yDelta = -Pong.MAX_PLAYER_SPEED;
		}

		this.player1.setY(this.player1.getY() + player1yDelta);
		this.player2.setY(this.player2.getY() + player2yDelta);
	}

	update(dt: number) {
		// That's too much
		if (dt > 2) {
			return;
		}
		this.cumulated += dt;
		this.currentTick = Math.floor(this.cumulated * this.tickPerSecond);
		if (this.currentTick % 2 === 0) {
			this.sendBallBounceToCallback();
		}
		this.movePlayers();

		if (this.updateBall && this.cumulated > 3) {
			this.ball.update(dt);
		}

		if (this.updateBall && this.ball.x < 0) {
			this.updateBall = false;
			if (this.onBallOutCallback) {
				this.onBallOutCallback({
					tick: this.currentTick,
					time: +new Date(),
					player1Score: this.player1.score,
					player2Score: this.player2.score + 1,
				});
			}
		}
		if (this.updateBall && this.ball.x > GAME_WIDTH) {
			this.updateBall = false;
			if (this.onBallOutCallback) {
				this.onBallOutCallback({
					tick: this.currentTick,
					time: +new Date(),
					player1Score: this.player1.score + 1,
					player2Score: this.player2.score,
				});
			}
		}

		if (this.ball.getBoundingBox().intersects(this.player1.getBoundingBox())) {
			this.ball.collideWithPlayer(this.player1);
		}
		if (this.ball.getBoundingBox().intersects(this.player2.getBoundingBox())) {
			this.ball.collideWithPlayer(this.player2);
		}

		this.player1.update(dt);
		this.player2.update(dt);
	}

	reset(player1Score: number, player2Score: number) {
		this.ball.reset();
		this.player1.score = player1Score;
		this.player2.score = player2Score;
		this.sendBallBounceToCallback();
		this.updateBall = true;
	}

	draw(ctx: CanvasRenderingContext2D) {
		// clear canvas
		ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		ctx.fillStyle = 'white';

		// draw center line
		ctx.fillRect(
			GAME_WIDTH / 2 - Pong.CENTER_LINE_WIDTH / 2,
			0,
			Pong.CENTER_LINE_WIDTH,
			GAME_HEIGHT,
		);

		// draw all objects
		this.ball.draw(ctx);
		this.player1.draw(ctx);
		this.player2.draw(ctx);

		ctx.fillStyle = 'white';

		ctx.font = '100px tekoregular';
		ctx.fillText(this.player1.score.toFixed(), GAME_WIDTH / 4, 28 * (GAME_HEIGHT / 256));
		ctx.fillText(this.player2.score.toFixed(), GAME_WIDTH * (3 / 4), 28 * (GAME_HEIGHT / 256));

		// ctx.beginPath();
		// ctx.arc(this.lastBallPosX, this.lastBallPosY, 3 * (GAME_HEIGHT / 256), 0, 2 * Math.PI);
		// ctx.fillStyle = 'red';
		// ctx.fill();
	}
}
