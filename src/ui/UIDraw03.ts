import p5 from "p5";
import { BaseUIDraw } from "./BaseUIDraw";
import { Logger } from "../utils/Logger";
import type { UIManager } from "../core/uiManager";

/**
 * UI描画 03
 * FPSログを表示
 */
export class UIDraw03 extends BaseUIDraw {
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
        tex.textFont(font);
        tex.fill(255, 230);
        tex.noStroke();

        // タイトル
        tex.textAlign(p.CENTER, p.TOP);
        tex.textSize(Math.min(tex.width, tex.height) * 0.04);
        tex.text("FPS LOG", tex.width / 2, 60);

        // ログを取得して表示（最新5個）
        const logs = logger.getRecentLogs(5);

        tex.textAlign(p.LEFT, p.TOP);
        tex.textSize(Math.min(tex.width, tex.height) * 0.025);

        const startY = 140;
        const lineHeight = Math.min(tex.width, tex.height) * 0.04;

        logs.forEach((log, index) => {
            const y = startY + index * lineHeight;
            tex.text(`${log.time} - ${log.text}`, 80, y);
        });

        tex.pop();
    }
}
