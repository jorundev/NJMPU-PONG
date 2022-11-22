import { PlayerRole, Pong, type BallOut } from "./Pong";

export class PongClient {
    private clientGame: Pong;
    private role: PlayerRole;
    private shift = false;
    
    constructor(role: PlayerRole) {
        this.role = role;
        this.clientGame = new Pong(8);
        this.clientGame.onBallBounce((state) => {
            this.clientGame.setBallState(state);
        });
        this.clientGame.onPlayerMove((movement) => {
           if (movement.player !== this.role) {
               this.clientGame.setPlayerMoveTarget(movement.player, movement.moveTarget);
           } 
        });
        // this.clientGame.onBallOut((bo: BallOut) => {
        //     this.clientGame.reset(bo.player1Score, bo.player2Score);
        // });
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
        this.clientGame.setPlayerMoveTarget(this.role, newY);
    }
    
    moveDown() {
        const speed = this.shift ? Pong.MAX_PLAYER_SPEED : Pong.MAX_PLAYER_SPEED / 2;
        const newY = this.clientGame.getPlayerY(this.role) + speed;
        this.clientGame.setPlayerMoveTarget(this.role, newY);
    }
    
    setShift(shift: boolean) {
        this.shift = shift;
    }
    
    onMouseMove(mouseX: number, mouseY: number) {
        this.clientGame.setPlayerMoveTarget(this.role, mouseY);
    }
}
