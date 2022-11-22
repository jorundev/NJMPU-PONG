import type { Direction } from "./Direction";
import type { GameObject } from "./GameObject";
import { GAME_HEIGHT, GAME_WIDTH, Pong } from "./Pong";
import { Rectangle } from "./Rectangle";
export class Player implements GameObject {
	private x: number;
	private y: number;
	private throwDirection: Direction;
	public score: number = 0;
	public moveTarget = GAME_HEIGHT / 2;
	
	private WIDTH = 4 * (GAME_WIDTH / 512);
	private HEIGHT = 28 * (GAME_HEIGHT / 256);

	constructor(x: number, throwDirection: Direction) {
		this.x = x;
		this.y = GAME_HEIGHT / 2;
		this.throwDirection = throwDirection;
	}
	
	setY(y: number) {
		this.y = y;
	}
	
	getX(): number {
		return this.x;
	}
	
	getY(): number {
		return this.y;
	}
	
	getThrowDirection(): number {
		return this.throwDirection;
	}

	update(dt: number): void {
		if (this.y < this.HEIGHT / 2) {
			this.y = this.HEIGHT / 2;
		} else if (this.y > GAME_HEIGHT - this.HEIGHT / 2) {
			this.y = GAME_HEIGHT - this.HEIGHT / 2;
		}
	}
	
	getBoundingBox(): Rectangle {
		return new Rectangle(
			this.x - (this.WIDTH / 2),
			this.x + (this.WIDTH / 2),
			this.y - (this.HEIGHT / 2),
			this.y + (this.HEIGHT / 2),
		);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = 'white';
        ctx.fillRect(this.x - (this.WIDTH / 2), this.y - (this.HEIGHT / 2), this.WIDTH, this.HEIGHT);
	}
}
