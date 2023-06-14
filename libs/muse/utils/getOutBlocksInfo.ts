'use babel';

import {NoteLineInfo} from '../types';
import {
    TextBlock,
    findBlockById,
    getBlockType,
    getSafeVolume,
    getVolumeFromString,
    getNoteLnsByDrumInstruments,
    getNoteLnsByToneInstruments,
    parseInteger, getRepeatFromString,
    toneChar, drumChar, DEFAULT_VOLUME,
    mergeVolume, clearEndComment,
} from './utils-note';

import {getNoteLineInfo, isNoteWithDurationOrPause} from './getNoteLineInfo';

type NoteLn = {
    name: string,
    noteLine: string,
    parentVolume: number,
    repeat: number,
    noteLineInfo: NoteLineInfo,
    colLoopDurationQ: number,
}

type OutBlocksInfo = {
    rows: {
        noteLns: NoteLn[];
        headLoopRepeat: number;
        headLoopDurationQ: number;
        rowDurationByHeadQ: number;
        rowRepeat: number;
        bpm?: number,
    }[],
    durationQ: number,
}

/**
 * meta в конце
 */
export function getNoteLineMetaAndInstr(noteLine: string, instr?: string): {
    noteLine: string,
    meta: string,
    instr: string,
} {
    const arr = noteLine.split(' ');

    let i = arr.length;

    for (i; i > 0; i--) {
        if(isNoteWithDurationOrPause(arr[i-1])) {
            break;
        }
    }

    //console.log('getNoteAndMetaFromNoteLine', noteLine);

    const meta = arr.slice(i);
    noteLine = arr.slice(0, i).join(' ');

    for (const item of meta) {
        if (item.startsWith(toneChar) || item.startsWith(drumChar)) {
            instr = item;

            break;
        }
    }

    //console.log({meta, noteLine, instr});

    return {
        noteLine,
        meta: meta.join(' '),
        instr,
    }
}

/**
 *  noteLns: {
 *      organ-1: r1 v100 $organ до-100
 *      organ-2: r1 v100 $organ ро-100
 *  },
 *  repeat: number,
 *  durationQ: number,
 *
 */
export function getOutBlocksInfo(
    blocks: TextBlock[],
    pOutBlock: TextBlock | string = 'out'
): OutBlocksInfo {
    let outBlock: TextBlock;

    if (typeof pOutBlock === 'string') {
        outBlock = findBlockById(blocks, pOutBlock);
    } else {
        outBlock = pOutBlock;
    }

    const result = <OutBlocksInfo>{
        rows: [],
        durationQ: 0
    };

    if (!outBlock) {
        console.warn('Block OUT not found');
        return result;
    }

    const rootVolume = getSafeVolume(outBlock.volume);

    // строки для вывода в out
    const textRows = outBlock.rows
        .map((item) => clearEndComment(item)) // jjkl
        .map((item) => item.trim())
        .filter((item, i) => {
            return i && item && !item.startsWith('#');
        });

    if (!Array.isArray(textRows) || !textRows.length) {
        console.warn('Bad rows', outBlock);

        return result;
    }

    let totalDurationQ = 0;
    // box
    //    row
    //       col
    //          noteLines

    // цикл по строкам out - это не ссылки на другие блоки
    textRows.forEach((row, iRow) => {
        const colArr = (row || '')
            .split(' ')
            .map((item) => item.trim())
            .filter((item) => !!item);

        let headLoopRepeat = 1;
        let headLoopDurationQ = 0;
        let colRepeat = 1;
        let block: TextBlock;
        let rowNoteLns: NoteLn[] = [];

        //console.log('findBlockById', colArr);

        for (let iCol = 0; iCol < colArr.length; iCol++) {
            const item = colArr[iCol];
            const typeByName = getBlockType(item); // $: voice @:drum
            const colInfoArr = (item || '').split('-').filter(item => !!item);
            const colInfoStr = colInfoArr.join(' ');
            let noteLinesWithName: {name: string, noteLine: string}[];
            let colNoteLns: NoteLn[] = [];
            let colId = colInfoArr[0].trim();
            let colVolume: number;
            let head = '';
            let colLoopDurationQ = 0;

            colRepeat = parseInteger(colInfoArr[1], 0) || getRepeatFromString(colInfoStr, headLoopRepeat);

            block = findBlockById(blocks, colId);

            if (!block) {
                throw new Error(`Block not <${colId}> found`);
            }

            if (iCol === 0) {
                head = 'head ';
                headLoopRepeat = colRepeat;
            }

            //volume = getVolumeFromString(itemInfoStr, 0) || getVolumeFromString(block.head);
            colVolume = getVolumeFromString(colInfoStr, DEFAULT_VOLUME);

            if (block.type === 'drums' || typeByName === 'drums') {
                noteLinesWithName = getNoteLnsByDrumInstruments(block.rows);
            } else {
                noteLinesWithName = getNoteLnsByToneInstruments(block.rows);
            }

            noteLinesWithName.forEach(noteLineWithName => {
                //console.log('noteLinesByName', item);

                const info = getNoteLineMetaAndInstr(noteLineWithName.noteLine, noteLineWithName.name);
                const volume = getVolumeFromString(info.meta);
                const noteLine = `${head}r${colRepeat} v${volume} ${info.instr} ${info.noteLine}`;
                const noteLineInfo = getNoteLineInfo(noteLine);

                colLoopDurationQ = Math.max(colLoopDurationQ, noteLineInfo.durationQ);

                if (iCol === 0) {
                    headLoopDurationQ = colLoopDurationQ;
                }

                colNoteLns.push({
                    name: noteLineWithName.name,
                    noteLine,
                    noteLineInfo,
                    repeat: colRepeat,
                    parentVolume: mergeVolume(colVolume, rootVolume),
                    colLoopDurationQ: 0,
                })
            });

            //console.log('colNoteLns', colNoteLns);

            colNoteLns.forEach(noteLn => {
                //console.log('noteLn', noteLn);

                noteLn.colLoopDurationQ = colLoopDurationQ;
                rowNoteLns.push(noteLn);
            });
        }

        let rowRepeat = 1;
        let rowDurationByHeadQ = headLoopDurationQ * headLoopRepeat;
        totalDurationQ = totalDurationQ + (rowDurationByHeadQ * rowRepeat);

        result.rows.push({
            noteLns: rowNoteLns,
            headLoopRepeat,
            headLoopDurationQ,
            rowDurationByHeadQ,
            rowRepeat,
        });
    });

    result.durationQ = totalDurationQ;

    //console.log('RES', result);

    return result;
}