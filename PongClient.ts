import { PlayerRole, Pong, type BallOut } from "./Pong";

interface PongWebsocket {
    send: (msg: string) => void;
}

export class PongClient {
    private clientGame: Pong;
    private role: PlayerRole;
    private shift = false;
    
    constructor(role: PlayerRole, ws: PongWebsocket) {
        this.role = role;
        this.clientGame = new Pong(8);
        // this.clientGame.onBallBounce((state) => {
        //     this.clientGame.setBallState(state);
        // });
        this.clientGame.onPlayerMove((movement) => {
            ws.send(JSON.stringify({
                namespace: "PONG",
                action: "MOVE",
                movement,
            }));
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
