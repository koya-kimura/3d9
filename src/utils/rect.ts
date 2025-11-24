import p5 from "p5";

export function rectFrame(p: p5, tex: p5.Graphics, x: number, y: number, width: number, height: number, lengthScale: number): void {
    const l = Math.min(width, height) * lengthScale;
    tex.push();
    tex.translate(x, y);
    tex.stroke(255);
    tex.strokeWeight(5);
    tex.strokeCap(p.SQUARE);
    tex.line(0, 0, l, 0);
    tex.line(0, 0, 0, l);
    tex.line(width, 0, width - l, 0);
    tex.line(width, 0, width, l);
    tex.line(0, height, 0, height - l);
    tex.line(0, height, l, height);
    tex.line(width, height, width - l, height);
    tex.line(width, height, width, height - l);
    tex.pop();
}