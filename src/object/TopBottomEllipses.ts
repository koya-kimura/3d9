import p5 from "p5";

/**
 * 上下に配置される5重の円形模様を描画するクラス
 */
export class TopBottomEllipses {
    private readonly ELLIPSE_COUNT = 5;
    private readonly Y_POSITION = 1000;

    /**
     * 上下の円形模様を描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        // 周りパート
        texture.push();
        texture.rotateX(beat * 0.1);
        texture.rotateY(beat * 0.12);
        texture.rotateZ(beat * 0.17);

        // 下部の円形模様
        texture.push();
        texture.translate(0, -this.Y_POSITION, 0);
        texture.rotateX(Math.PI / 2);
        texture.rotateY(beat * 0.05);
        texture.rotateZ(beat * 0.03);
        texture.stroke(255, 255, 0);
        texture.fill(255, 10);
        for (let i = 0; i < this.ELLIPSE_COUNT; i++) {
            texture.rotateZ((Math.PI * 2) / this.ELLIPSE_COUNT);
            texture.ellipse(0, 0, 1000 * i / this.ELLIPSE_COUNT, 1200 * i / this.ELLIPSE_COUNT);
        }
        texture.pop();

        // 上部の円形模様
        texture.push();
        texture.translate(0, this.Y_POSITION, 0);
        texture.rotateX(Math.PI / 2);
        texture.rotateY(beat * 0.05);
        texture.rotateZ(beat * 0.03);
        texture.stroke(255, 255, 0);
        texture.fill(255, 10);
        for (let i = 0; i < this.ELLIPSE_COUNT; i++) {
            texture.rotateZ((Math.PI * 2) / this.ELLIPSE_COUNT);
            texture.ellipse(0, 0, 1000 * i / this.ELLIPSE_COUNT, 1200 * i / this.ELLIPSE_COUNT);
        }
        texture.pop();

        texture.pop();
    }
}
