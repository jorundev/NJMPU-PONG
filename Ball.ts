import { Direction } from "./Direction";
import type { GameObject } from "./GameObject";
import { vecLength } from "./Math";
import type { Player } from "./Player";
import { GAME_HEIGHT, GAME_WIDTH, Pong, type PongPacket } from "./Pong";
import { Rectangle } from "./Rectangle";

export interface NewBallState extends PongPacket {
    x: number;
    y: number;
    velX: number;
    velY: number;
    speed: number;
}
export class Ball implements GameObject {
    public x: number;
    public y: number;
    public velocityX: number;
    public velocityY: number;

    private pong: Pong;

    public speed: number;

    private RADIUS = 3 * (GAME_HEIGHT / 256);

    constructor(pong: Pong) {
        this.pong = pong;
        this.reset();
    }

    reset() {
        this.x = GAME_WIDTH / 2;
        this.y = GAME_HEIGHT / 2;
        this.velocityX = Math.random() < 0.5 ? 1 : -1;
        this.velocityY = 0;
        this.speed = 140.0 * (GAME_HEIGHT / 256);
    }

    update(dt: number): void {
        this.x += dt * this.speed * this.velocityX;
        this.y += dt * this.speed * this.velocityY;

        if (this.y < 0) {
            this.velocityY = Math.abs(this.velocityY);
            this.pong.sendBallBounceToCallback();
        }
        if (this.y > GAME_HEIGHT) {
            this.velocityY = -Math.abs(this.velocityY);
            this.pong.sendBallBounceToCallback();
        }
    }

    getBoundingBox(): Rectangle {
        return new Rectangle(
            this.x - (this.RADIUS / 2),
            this.x + (this.RADIUS / 2),
            this.y - (this.RADIUS / 2),
            this.y + (this.RADIUS / 2),
        );
    }

    collideWithPlayer(player: Player) {
        const diff = (this.y - player.getY());

        if (player.getThrowDirection() === Direction.Left && this.velocityX > 0
            || player.getThrowDirection() === Direction.Right && this.velocityX < 0) {
            this.speed *= 1.08;

            this.velocityY = diff / (16 * (GAME_HEIGHT / 256));
            this.velocityX = (player.getThrowDirection() === Direction.Left ? -Math.abs(this.velocityX) : Math.abs(this.velocityX));

            if (this.velocityY < 0.01 * (GAME_HEIGHT / 256) && this.velocityY > -0.01 * (GAME_HEIGHT / 256)) {
                this.velocityY = 0.01 * (GAME_HEIGHT / 256);
            }

            const length = vecLength(this.velocityX, this.velocityY);

            this.velocityX /= length;
            this.velocityY /= length;

            this.pong.sendBallBounceToCallback();
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}
