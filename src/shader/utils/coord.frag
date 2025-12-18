// coord.frag - UV座標変換ユーティリティ
// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.

// モザイクエフェクト
vec2 mosaic(vec2 uv, vec2 res, float n) {
    return vec2((floor(uv.x * n) + 0.5) / n, (floor(uv.y * n * res.y / res.x) + 0.5) / (n * res.y / res.x));
}

// カメラシェイク（画面揺れ）エフェクト
// uv: 入力UV座標
// beat: ビート値
// time: 時間値
// intensity: 揺れの強さ（0.0-1.0推奨）
vec2 applyCameraShake(vec2 uv, float beat, float time, float intensity) {
    // ビートベースの高速な揺れ
    float shakeX = random(vec2(floor(beat * 16.0), 3721.4982)) * 2.0 - 1.0;
    float shakeY = random(vec2(floor(beat * 16.0), 8294.2847)) * 2.0 - 1.0;
    
    // 時間ベースの細かい揺れ
    shakeX += (random(vec2(time * 20.0, 1234.5678)) * 2.0 - 1.0) * 0.5;
    shakeY += (random(vec2(time * 20.0, 8765.4321)) * 2.0 - 1.0) * 0.5;
    
    // UV座標をオフセット
    return uv + vec2(shakeX, shakeY) * intensity;
}
