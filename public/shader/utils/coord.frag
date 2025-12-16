// coord.frag - UV座標変換ユーティリティ
// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.

// モザイクエフェクト
vec2 mosaic(vec2 uv, vec2 res, float n) {
    return vec2((floor(uv.x * n) + 0.5) / n, (floor(uv.y * n * res.y / res.x) + 0.5) / (n * res.y / res.x));
}
