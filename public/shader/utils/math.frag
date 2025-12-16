// math.frag - 数学関数ユーティリティ
// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.

float PI = 3.14159265358979;

// 疑似乱数生成
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 回転行列
mat2 rot(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

// atan2関数
float atan2(float y, float x) {
    return x == 0. ? sign(y) * PI / 2. : atan(y, x);
}

// デカルト座標→極座標
vec2 xy2pol(vec2 xy) {
    return vec2(atan2(xy.y, xy.x), length(xy));
}

// 極座標→デカルト座標
vec2 pol2xy(vec2 pol) {
    return pol.y * vec2(cos(pol.x), sin(pol.x));
}

// 値の範囲変換
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// ジグザグ波形生成
float zigzag(float x) {
    return abs(fract(x * 2.0) - 1.0);
}
