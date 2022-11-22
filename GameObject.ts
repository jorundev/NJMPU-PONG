export abstract class GameObject {
    update(dt: number) 
    {
        throw "GameObject.update() Unimplemented!";
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        throw "GameObject.draw() Unimplemented!";
    }
}
