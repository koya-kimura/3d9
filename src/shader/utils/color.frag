// color.frag - 色操作ユーティリティ
// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.

// グレースケール変換
float gray(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

// 色反転
vec3 invert(vec3 col) {
    return vec3(1.0) - col;
}

// HSV→RGB変換（色相のみ）
vec3 hsv2rgb(in float h) {
    float s = 1.;
    float v = 1.;

    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6. - K.w);
    vec3 rgb = v * mix(vec3(K.x), clamp(p - K.x, 0., 1.), s);

    return rgb;
}

// vec3のミックス
vec3 mix3(vec3 a, vec3 b, float t) {
    return vec3(mix(a.x, b.x, t), mix(a.y, b.y, t), mix(a.z, b.z, t));
}
