'use babel';

import * as un from './utils-note';
import {drumChar, toneChar} from './utils-note';

export type FileSettings = {
    import: string[],
    exclude: string[],
    dataByTracks: {[key: string]: string},
    pitchShift: string[],
    boardShift: string[],
    bpm: string[],
    //[key: string]: any,
};

export function getPitchShiftSetting(settings: any): number {
    if (!Array.isArray((settings as FileSettings)?.pitchShift)) {
        return 0;
    }

    return un.parseInteger((settings as FileSettings).pitchShift[0], 0);
}

export function getFileSettings(blocks: un.TextBlock[] ): FileSettings {
    const result: FileSettings = {
        import: [],
        exclude: [],
        dataByTracks: <any>{},
        pitchShift: [],
        boardShift: [],
        bpm: [],
    };

    const block = blocks.find(
        (item) => item.id.toLowerCase() === 'settings'
    );

    if (!block) {
        return result;
    }

    const text = block.rows
        .map(item => item.trim())
        .filter(item => !item.startsWith('#'))
        .map(item => item.startsWith('_') ? item.replace(/^_ /, '').trim(): item)
        .join(';');

    let arr = text.split(';');
    arr = arr.map(item => item.trim()).filter(item => !!item);

    arr.forEach(item => {
        const arr = item.split(':');
        const name = (arr[0] || '').trim();
        const value = (arr[1] || '').trim();

        if (name) {
            if (!result[name]) {
                result[name] = [];
            }

            result[name].push(value);
        }
    });

    Object.keys(result).forEach(key => {
        if (!key.startsWith(toneChar) && !key.startsWith(drumChar)) {
            return;
        }

        result.dataByTracks[key] = result[key].join(' ');
    });

    return result;
}
