export class Rectangle {
	left: number;
	right: number;
	top: number;
	bottom: number;

	constructor(left: number, right: number, top: number, bottom: number) {
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}

	intersects(other: Rectangle): boolean {
		return !(
			other.left > this.right ||
			other.right < this.left ||
			other.top > this.bottom ||
			other.bottom < this.top
		);
	}

	width(): number {
		return Math.abs(this.right - this.left);
	}

	height(): number {
		return Math.abs(this.bottom - this.top);
	}
}
