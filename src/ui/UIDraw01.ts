import p5 from "p5";
import { BaseUIDraw } from "./BaseUIDraw";
import { DateText } from "../utils/dateText";
import { Logger } from "../utils/Logger";
import type { UIManager } from "../core/uiManager";

/**
 * UI描画 01
 * 枠線とロゴと日時を表示
 */
export class UIDraw01 extends BaseUIDraw {
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

        tex.rectMode(p.CENTER);
        tex.stroke(255, 100);
        tex.noFill();
        tex.strokeWeight(5);
        tex.rect(tex.width / 2, tex.height / 2, tex.width - 40, tex.height - 40, 5, 5);
        tex.strokeWeight(2);
        tex.rect(tex.width / 2, tex.height / 2, tex.width - 60, tex.height - 60, 5, 5);

        tex.textAlign(p.RIGHT, p.BOTTOM);
        tex.fill(255, 230);
        tex.noStroke();
        tex.textSize(Math.min(tex.width, tex.height) * 0.03);
        tex.text(DateText.getYYYYMMDD_HHMMSS_format(), tex.width - 45, tex.height - 45);

        tex.textSize(Math.min(tex.width, tex.height) * 0.03);
        tex.text("FPS: " + fps.toFixed(2), tex.width - 45, tex.height - 75);

        tex.image(logo, 60, 60, Math.min(tex.width, tex.height) * 0.15, Math.min(tex.width, tex.height) * 0.15 * logo.height / logo.width);
        tex.pop();
    }
}
