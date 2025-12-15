export const angleClamp = (angle: number): number => {
    return angle % (Math.PI * 2);
}

export const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
}