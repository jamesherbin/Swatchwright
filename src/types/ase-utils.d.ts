declare module 'ase-utils' {
    export interface AseColor {
        name: string;
        model: 'RGB';
        color: [number, number, number];
        type: 'global' | 'spot' | 'normal';
    }

    export interface AseData {
        version: string;
        groups: unknown[];
        colors: AseColor[];
    }

    export function encode(data: AseData): ArrayBuffer | Uint8Array;
}
