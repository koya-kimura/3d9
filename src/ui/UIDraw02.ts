import p5 from "p5";
import { BaseUIDraw } from "./BaseUIDraw";
import { Logger } from "../utils/log/logger";
import type { UIManager } from "../core/uiManager";

/**
 * UI描画 02
 * ロゴのみを中央に表示
 */
export class UIDraw02 extends BaseUIDraw {
    draw(
        p: p5,
        tex: p5.Graphics,
        font: p5.Font,
        logo: p5.Image,
        fps: number,
        logger: Logger,
        uiManager: UIManager
    ): void {
        tex.push();
        tex.imageMode(p.CENTER);
        tex.image(
            logo,
            tex.width / 2,
            tex.height / 2,
            Math.min(tex.width, tex.height) * 0.15,
            Math.min(tex.width, tex.height) * 0.15 * logo.height / logo.width
        );
        tex.pop();
    }
}
