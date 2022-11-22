import { NewBallState } from "./Ball";
import { Pong } from "./Pong";

export class PongServer {
    private gameState: Pong;
    
    constructor() {
        this.gameState = new Pong(8);
        
        this.gameState.onBallBounce((nbs: NewBallState) => {
           console.log(nbs); 
        });
        this.gameState.onBallOut((bo) => {
           console.log(bo);
           this.gameState.reset(bo.player1Score, bo.player2Score); 
        });
    }
    
    update(dt: number) {
        this.gameState.update(dt);
    }
}
