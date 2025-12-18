// post.frag - ポストエフェクト用フラグメントシェーダー
// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.

precision mediump float;

varying vec2 vTexCoord;

uniform float u_beat;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D u_uiTex;
uniform float u_faderValues[9];

vec3 mainColor = vec3(0.1, 0.9, 0.5);

// ユーティリティファイルをインクルード
#include "./utils/math.frag"
#include "./utils/coord.frag"
#include "./utils/color.frag"
#include "./utils/midi.frag"

void main(void) {
    vec2 uv = vTexCoord;
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

    // =============

    vec2 bgUV = vTexCoord;
    vec4 bgCol = vec4(0.0, 0.0, 0.0, 1.0);

    col = bgCol;

    // =============

    vec2 mainUV = vTexCoord;

    // float size = 0.05;
    // mainUV += vec2(random(uv + vec2(4729.4279, 2947.2947)) * size - size * 0.5, random(uv + vec2(2947.2947, 4729.4279)) * size - size * 0.5);
    // mainUV = vec2(floor(mainUV.x * 64.0) / 64.0, floor(mainUV.y * 36.0) / 36.0);

    mainUV -= 0.5;
    mainUV *= (1. + length(mainUV) * 0.05) * 0.5;
    mainUV += 0.5;

    // ランダムなラインスライス効果を適用
    mainUV = applyRandomLineSlice(mainUV, u_beat);

    vec4 mosaicTex = vec4(0.0);
    vec2 mosaicUV = vTexCoord;

    mosaicUV = mosaic(mosaicUV, u_resolution, 50.0);
    mosaicTex.r = random(mosaicUV + vec2(1.7, 9.2) + floor(u_beat)) * 0.4 + 0.6;
    mosaicTex.g = random(mosaicUV + vec2(5.2, 1.3) + floor(u_beat)) * 0.5;
    mosaicTex.b = random(mosaicUV + vec2(9.4, 7.2) + floor(u_beat)) * 0.3 + 0.5;

    vec4 mainCol = texture2D(u_tex, mainUV);

    if(getFaderValue(0) != 1.0){
        mainCol.rgb = mix3(mainCol.rgb, mosaicTex.rgb, pow(gray(mainCol.rgb) + 0.2, 4.0));
        col.rgb = mainCol.rgb;
    } else {
        if(gray(mainCol.rgb) > 0.2 && mainCol.a > 0.0){
            col.rgb = vec3(1.0, 1.0, 0.0);
        }
    }

    if(abs(sin(vTexCoord.y+u_time * 0.2)) > 0.999){
        vec2 vTexCoordR = vec2(vTexCoord.x + random(vec2(vTexCoord.x+u_time, vTexCoord.y+u_time)) * 0.005, vTexCoord.y+random(vec2(vTexCoord.x+u_time,vTexCoord.y+u_time))*.005);
        mainCol.rgb = texture2D(u_tex,vTexCoordR).rgb;
    }

    vec4 uiCol = texture2D(u_uiTex, vTexCoord);
    col.rgb = mix(col.rgb, uiCol.rgb, uiCol.a);

    gl_FragColor = col;
}