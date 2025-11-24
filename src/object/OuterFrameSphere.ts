import p5 from "p5";

/**
 * 上下に配置される5重の円形模様を描画するクラス
 */
export class OuterFrameSphere {
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
        texture.rotateX(beat * 0.022);
        texture.rotateY(beat * 0.024);
        texture.rotateZ(beat * 0.026);

        texture.fill(255, 30);
        texture.stroke(255);
        texture.sphere(6000);

        texture.pop();
    }
}
