import p5 from "p5";

import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager.js";
import { Camera } from "../utils/camera.js";
import { Easing } from "../utils/easing.js";
import { GVM } from "../utils/gvm.js";
import { UniformRandom } from "../utils/uniformRandom.js";

export class TexManager {
    private renderTexture: p5.Graphics | null;

    private boxTexture: p5.Graphics | null;
    private cameraIndex: number = 0;

    constructor() {
        this.renderTexture = null;
        this.boxTexture = null;
    }

    init(p: p5): void {
        this.renderTexture = p.createGraphics(p.width, p.height, p.WEBGL);
        this.boxTexture = p.createGraphics(128, 128);
    }

    getTexture(): p5.Graphics {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        return texture;
    }

    resize(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        texture.resizeCanvas(p.width, p.height);
    }

    update(_p: p5, beat: number, apcMiniMK2Manager: APCMiniMK2Manager): void {
        this.cameraIndex = apcMiniMK2Manager.getParamValues(0)[0] % 2;
    }

    draw(_p: p5, beat: number): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        if (!this.boxTexture) {
            throw new Error("Box Texture not initialized");
        }

        this.boxTexture.clear();
        this.boxTexture.stroke(255);
        this.boxTexture.noFill();
        this.boxTexture.circle(this.boxTexture.width / 2, this.boxTexture.height / 2, this.boxTexture.width);

        texture.push();
        texture.clear();

        texture.ambientLight(20);
        texture.directionalLight(0, 255, 0, -1, 0, 0);
        texture.directionalLight(255, 255, 0, 1, 0, 0);
        texture.directionalLight(255, 0, 0, 0, -1, 0);
        texture.directionalLight(255, 0, 255, 0, 1, 0);

        texture.push();
        const cam1 = new Camera(_p);
        cam1.setCamera(texture, this.cameraIndex, beat);

        for (let i = 0; i < 100; i++) {
            const x = GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 0) * 200 - 100;
            const z = GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 2) * 200 - 100;
            const y = Math.sin(beat * 0.9 + i * 0.01) * 3000;
            const h = UniformRandom.rand(i, 10) * _p.map(Math.cos(beat * 0.02), -1, 1, 0.9, 1.1) * 50 + 150;

            texture.push();
            texture.translate(x, y, z);
            texture.strokeWeight(0.5);
            texture.specularMaterial(100);
            texture.rotateY(beat * UniformRandom.rand(i) * 0.01 + i * 0.1);
            texture.stroke(255, 200);
            texture.fill(255, 100);
            texture.box(15, h, 15);
            texture.pop();
        }

        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                for (let iz = -1; iz <= 1; iz++) {
                    texture.push();
                    texture.translate(ix * 200, iy * 200, iz * 200);
                    texture.fill(100 + ix * 50, 100 + iy * 50, 100 + iz * 50);
                    texture.stroke(255, 0, 0);
                    texture.strokeWeight(1);
                    texture.rotateX(beat * 0.1 + ix);
                    texture.rotateY(beat * 0.1 + iy);
                    texture.rotateZ(beat * 0.1 + iz);
                    texture.scale(1.0 + Easing.easeInOutExpo(Easing.zigzag(beat)) * 0.5);
                    if (this.boxTexture) texture.texture(this.boxTexture);
                    texture.box(50);
                    texture.pop();
                }
            }
        }

        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + beat * 0.5 + GVM.leapRamp(beat, 32, 8, Easing.easeOutCubic) * Math.PI;
            const radius = 800;

            texture.push();
            texture.translate(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            texture.rotateY(-angle + Math.PI / 2);
            texture.stroke(255, 150);
            texture.fill(255, 100);
            texture.box(60);
            texture.pop();
        }

        for (let i = 0; i < 300; i++) {
            const x = Math.cos(beat + i * 0.1) * 800 + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 0) * 200 - 100;
            const y = Math.cos(beat * 0.01 + i * 0.1) * 800 + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 1) * 500 - 250;
            const z = Math.sin(beat + i * 0.1) * 800 + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 2) * 200 - 100;

            texture.push();
            texture.translate(x, y, z);
            texture.strokeWeight(0.5);
            texture.rotateX(beat * 0.2);
            texture.rotateY(beat * 0.3);
            texture.rotateZ(beat * 0.4);
            texture.stroke(255, 200);
            texture.fill(255, 10);
            texture.box(20);
            texture.pop();
        }

        texture.pop();

        // 周りパート
        texture.push();
        texture.rotateX(beat * 0.1);
        texture.rotateY(beat * 0.12);
        texture.rotateZ(beat * 0.17);

        texture.push();
        texture.translate(0, -1000, 0);
        texture.rotateX(Math.PI / 2);
        texture.rotateY(beat * 0.05);
        texture.rotateZ(beat * 0.03);
        texture.stroke(255, 255, 0);
        texture.fill(255, 10);
        for (let i = 0; i < 5; i++) {
            texture.rotateZ((Math.PI * 2) / 5);
            texture.ellipse(0, 0, 1000 * i / 5, 1200 * i / 5);
        }
        texture.pop();

        texture.push();
        texture.translate(0, 1000, 0);
        texture.rotateX(Math.PI / 2);
        texture.rotateY(beat * 0.05);
        texture.rotateZ(beat * 0.03);
        texture.stroke(255, 255, 0);
        texture.fill(255, 10);
        for (let i = 0; i < 5; i++) {
            texture.rotateZ((Math.PI * 2) / 5);
            texture.ellipse(0, 0, 1000 * i / 5, 1200 * i / 5);
        }
        texture.pop();

        texture.pop();

        texture.push();
        texture.stroke(255, 255, 0);
        texture.noFill();
        texture.rotateX(beat * 0.1);
        texture.rotateY(beat * 0.12);
        texture.rotateZ(beat * 0.17);
        texture.sphere(3000);
        texture.pop();

        texture.pop();
    }
}