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

// エッジ検出エフェクト（ソーベルフィルター）
// tex: サンプリングするテクスチャ
// uv: UV座標
// resolution: 画面解像度（ピクセルサイズ計算用）
// threshold: エッジ検出の閾値（0.0-1.0、小さいほど敏感）
// edgeColor: エッジの色
vec3 applyEdgeDetection(sampler2D tex, vec2 uv, vec2 resolution, float threshold, vec3 edgeColor) {
    vec2 texelSize = 1.0 / resolution;
    
    // ソーベルフィルターのカーネル
    // 水平方向
    float h00 = gray(texture2D(tex, uv + texelSize * vec2(-1, -1)).rgb);
    float h01 = gray(texture2D(tex, uv + texelSize * vec2(-1,  0)).rgb);
    float h02 = gray(texture2D(tex, uv + texelSize * vec2(-1,  1)).rgb);
    float h20 = gray(texture2D(tex, uv + texelSize * vec2( 1, -1)).rgb);
    float h21 = gray(texture2D(tex, uv + texelSize * vec2( 1,  0)).rgb);
    float h22 = gray(texture2D(tex, uv + texelSize * vec2( 1,  1)).rgb);
    
    float sobelH = -h00 - 2.0 * h01 - h02 + h20 + 2.0 * h21 + h22;
    
    // 垂直方向
    float v00 = gray(texture2D(tex, uv + texelSize * vec2(-1, -1)).rgb);
    float v10 = gray(texture2D(tex, uv + texelSize * vec2( 0, -1)).rgb);
    float v20 = gray(texture2D(tex, uv + texelSize * vec2( 1, -1)).rgb);
    float v02 = gray(texture2D(tex, uv + texelSize * vec2(-1,  1)).rgb);
    float v12 = gray(texture2D(tex, uv + texelSize * vec2( 0,  1)).rgb);
    float v22 = gray(texture2D(tex, uv + texelSize * vec2( 1,  1)).rgb);
    
    float sobelV = -v00 - 2.0 * v10 - v20 + v02 + 2.0 * v12 + v22;
    
    // エッジの強度を計算
    float edgeStrength = sqrt(sobelH * sobelH + sobelV * sobelV);
    
    // 閾値でエッジを判定
    if (edgeStrength > threshold) {
        // エッジ部分を指定色で表示
        return edgeColor;
    } else {
        // エッジ以外は黒
        return vec3(0.0);
    }
}

vec3 patipati(vec3 col){
    return random(vec2(u_time)) < 0.95 ? col : vec3(1.0);
}