export function randItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function randInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
