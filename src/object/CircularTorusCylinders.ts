import p5 from "p5";

/**
 * 円形に配置されたトーラスとシリンダーを描画するクラス
 */
export class CircularTorusCylinders {
    private readonly COUNT = 30;
    private readonly RADIUS = 800;
    private readonly TORUS_RADIUS = 50;
    private readonly TORUS_TUBE_RADIUS = 5;
    private readonly CYLINDER_RADIUS = 40;
    private readonly CYLINDER_HEIGHT = 30;

    /**
     * 円形に配置されたトーラスとシリンダーを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     * @param whiteMode - 白塗りモード
     */
    draw(p: p5, texture: p5.Graphics, beat: number, whiteMode: boolean = false): void {
        for (let i = 0; i < this.COUNT; i++) {
            const angle = i * Math.PI * 2 / this.COUNT + beat * 0.05;
            const x = Math.cos(angle) * this.RADIUS;
            const z = Math.sin(angle) * this.RADIUS;

            texture.push();
            texture.translate(x, 0, z);

            // トーラス
            texture.rotateY(Math.PI);

            if (whiteMode) {
                texture.noStroke();
                texture.fill(255);
            } else {
                texture.noStroke();
                texture.fill(255, 100);
                texture.specularMaterial(100);
            }

            texture.torus(this.TORUS_RADIUS, this.TORUS_TUBE_RADIUS);

            // シリンダー
            texture.rotateZ(Math.PI * 0.5);
            texture.rotateX(Math.PI * 0.55);
            texture.rotateY(beat * 0.1);

            if (whiteMode) {
                texture.noStroke();
                texture.fill(255);
            } else {
                texture.stroke(255, 100);
                texture.strokeWeight(0.5);
                texture.noFill();
            }

            texture.cylinder(this.CYLINDER_RADIUS, this.CYLINDER_HEIGHT);

            texture.pop();
        }
    }
}
