import {EventEmitter} from '../../libs/common/event-emitter';
import {DEFAULT_TONE_INSTR, defaultSynthSettings, toneAndDrumPlayerSettings} from '../../libs/muse/keyboards';
import {TextBlock} from '../../libs/muse/utils';
import {Sound} from '../../libs/muse/sound';
import {MultiPlayer} from '../../libs/muse/multi-player';
import {Synthesizer} from '../../libs/muse/synthesizer';
import {Ticker} from '../../libs/muse/ticker';
import {KeyboardType} from '../keyboard-ctrl';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();

const synthesizer = new Synthesizer();
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(toneAndDrumPlayerSettings); // defaultSynthSettings

const ticker = new Ticker(Sound.ctx);

export type EditedItem = {
    rowInPartId: string, // partNio-rowNio
    songName: string,
    duration: number,
    partId: string,
    partNio: number, // номер части
    rowNio: number,  // номер строки внутри части
}

class IdeService extends  EventEmitter {
    _lastBoardView: KeyboardType = '' as any;
    multiPlayer = multiPlayer;
    metronome = metronome;
    synthesizer = synthesizer;
    ticker = ticker;
    boards: any = {};

    get lastBoardView(): KeyboardType {
        if (!this._lastBoardView) {
            this._lastBoardView = (localStorage.getItem('lastBoardView') || 'drums') as any;
        }

        return this._lastBoardView;
    }

    set lastBoardView(view: string) {
        this._lastBoardView = (view || 'drums') as any;
        localStorage.setItem('lastBoardView', this._lastBoardView);
    }

    editedItems: EditedItem[] = [];

    private _guid = 1;
    useToneInstrument: number = DEFAULT_TONE_INSTR;
    currentEdit: {
        songId: string,
        blocks: TextBlock[],
        bpmValue: number,
        allSongParts: string[],
        editPartsNio?: number[],
        metaByLines: {[key: string]: string},
        freezeStructure: boolean,
        source?: 'my' | 'band' | null | undefined,
    } = { } as any;

    get guid(): number {
        return this._guid++;
    }
}

export const ideService = new IdeService();

export const ideEvents = {
    openFile: 'openFile'
}
