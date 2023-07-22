import { drumInfo } from '../libs/muse/drums';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils/utils-note';
import { parseInteger } from '../libs/common';
import { LineModel, Line, NoteItem, KeyData, Cell } from './line-model';
import { getMidiConfig, MidiConfig } from '../libs/muse/utils/getMidiConfig';
import { getOutBlocksInfo, OutBlockRowInfo } from '../libs/muse/utils/getOutBlocksInfo';
import { createOutBlock, TextBlock } from '../libs/muse/utils/utils-note';

import ideService from './ide/ide-service';
import { DrumBoard, drumNotesInfo } from './drum-board';
import { KeyboardCtrl, BpmInfo, KeyboardPage } from './keyboard-ctrl';

const ids = {
    rowInPartId: 'row-in-part-id',
    duration: 'duration',
    rowNio: 'row-nio',
    partNio: 'part-nio',
    songName: 'song-name',
    ideAction: 'ide-action',
    ideContent: 'ide-content',
    bottomCommandPanel: 'bottom-command-panel',
    actionDrumNote: 'action-drum-note',
};

const drumKodesTop = [
    {note: 'ho', alias: 'ча'},
    {note: 'cc', alias: 'щи'},
    {note: 'rc', alias: 'ци'},
];

const drumKodesMid = [
    {note: 'th', alias: 'та'},
    {note: 'tm', alias: 'тo'},
    {note: 'tl', alias: 'ту'},
];

const drumKodesBot = [
    {note: 'hc', alias: 'чи'},
    {note: 'sn', alias: 'ба'},
    {note: 'bd', alias: 'пы'},
];

const someDrum = {
    note: '',
    headColor: 'lightgray',
    bodyColor: 'lightgray',
    char: '?',
}

type EditedItem = {
    rowInPartId: string, // partNio-rowNio
    songName: string,
    duration: number,
    partNio: number, // номер части
    rowNio: number,  // номер строки внутри части
}

type ChessCell = {
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,
}

type StoredItem = {
    rowInPartId: string,
    type: string,
    status: string,
    rows: Line[]
}

type StoredSongNode ={
    [key: string]: {
        items: StoredItem[]
    }
};

const DOWN = 1;
const UP = 0;

export class DrumCtrl extends KeyboardCtrl {
    bpmInfo: BpmInfo = this.getEmptyBpmInfo();
    mode: 'record' | null = null;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];
    tickStartMs: number = 0;

    editedItems: EditedItem[] = [];
    board: DrumBoard;

    constructor(public page: KeyboardPage) {
        super(page);

        this.board = new DrumBoard();
    }

    highlightInstruments() {
        getWithDataAttr(ids.actionDrumNote, this.page.pageEl).forEach(el => {
            el.style.fontWeight = '400';
            el.style.backgroundColor = 'white';
        });

        const notes = this.liner.getNotesByOffset(this.activeCell.offset);

        notes.forEach(note => {
            getWithDataAttrValue(ids.actionDrumNote, note.note, this.page.pageEl).forEach(el => {
                el.style.fontWeight = '700';
                el.style.backgroundColor = 'lightgray';
            });
        });
    }

    get hasEditedItems(): boolean {
        return !!this.editedItems.length;
    }

    get hasIdeItem(): boolean {
        const item = ideService.currentEdit;

        return !!item && !!item.editPartsNio && !!item.topOutParts &&  !!item.outBlock && !!item.blocks;
    }

    loadFile() {
        // https://webtips.dev/download-any-file-with-javascript
        let songName = ideService.currentEdit?.name || '';

        if (!songName) return;

        let songNode: StoredSongNode;

        if (!localStorage.getItem(songName)) {
            songNode = {};
        } else {
            songNode = JSON.parse(localStorage.getItem(songName));
        }

        let data = JSON.stringify(songNode);
        //let type = 'application/json';
        let type = 'application/text';
        let name = `${songName}.txt`;

        downloader(data, type, name)

        function downloader(data, type, name) {
            let blob = new Blob([data], {type});
            let url = (window as any).URL.createObjectURL(blob);
            downloadURI(url, name);
            (window as any).URL.revokeObjectURL(url);
        }

        function downloadURI(uri, name) {
            let link = document.createElement("a");
            link.download = name;
            link.href = uri;
            link.click();
        }
    }

    saveEditingItems() {
        if (!this.hasEditedItems) return;

        let songName = this.editedItems[0].songName;
        let songNode: StoredSongNode;

        if (!localStorage.getItem(songName)) {
            songNode = {};
        } else {
            songNode = JSON.parse(localStorage.getItem(songName));
        }

        this.editedItems.forEach(item => {
            const rows = this.liner.rows.filter(row => row.rowInPartId === item.rowInPartId);
            if (!rows.length) return;

            let itemsNode = songNode[item.rowInPartId];
            if (!itemsNode) {
                itemsNode = {
                    items: []
                };
                songNode[item.rowInPartId] = itemsNode;
            }

            let drumsNode = itemsNode.items.find(iItem => iItem.rowInPartId === item.rowInPartId && iItem.type === 'drums');
            if (!drumsNode) {
                drumsNode = {
                    rowInPartId: item.rowInPartId,
                    type: 'drums',
                    status: 'draft',
                    rows: []
                };
                itemsNode.items.push(drumsNode);
            }

            drumsNode.rows = rows;
        });

        localStorage.setItem(songName, JSON.stringify(songNode));
    }

    addAndSortEditingItem(item: EditedItem, el: HTMLElement) {
        if (this.editedItems.find(iItem => iItem.rowInPartId === item.rowInPartId)) {
            this.editedItems = this.editedItems.filter(iItem => iItem.rowInPartId !== item.rowInPartId);
            el.style.fontWeight = '400';

            return;
        }

        this.editedItems.push(item);
        el.style.fontWeight = '600';

        this.editedItems.sort((a, b) => {
            if (a.partNio < b.partNio) return -1;
            if (a.partNio > b.partNio) return 1;

            if (a.rowNio < b.rowNio) return -1;
            if (a.rowNio > b.rowNio) return 1;

            return 0;
        });
    }

    songRowClick(el: HTMLElement) {
        const item: EditedItem = {
            rowInPartId: el.dataset['rowInPartId'],
            songName: el.dataset['songName'],
            partNio: parseInteger(el.dataset['partNio'], 0),
            rowNio: parseInteger(el.dataset['rowNio'], 0),
            duration: parseInteger(el.dataset['duration'], 0),
        };

        this.addAndSortEditingItem(item, el);

        let rows = [];
        let blockOffsetQ = 0;

        this.editedItems.forEach(editedItem => {
            let iRows: Line[] = this.liner.rows.filter(row => row.rowInPartId === editedItem.rowInPartId);

            let songNode: StoredSongNode = localStorage.getItem(editedItem.songName) as any;
            if (!iRows.length && songNode) {
                songNode = JSON.parse(songNode as any as string);

                if (songNode[editedItem.rowInPartId]) {
                    let items = songNode[editedItem.rowInPartId].items;
                    let node = items.find(item => item.rowInPartId === editedItem.rowInPartId && item.type === 'drums');
                    if (node) {
                        iRows = node.rows;
                    }
                }
            }

            if (!iRows.length) {
                iRows = this.liner.getLinesByMask(editedItem.duration);
            }

            iRows.forEach(row => {
                row.rowInPartId = editedItem.rowInPartId;
                row.blockOffsetQ = blockOffsetQ;
            });

            rows = [...rows, ...iRows];
            blockOffsetQ = blockOffsetQ + editedItem.duration;
        });

        this.liner.setData(rows);
        this.printChess(this.liner.rows);
    }

    playOne() {
        this.page.stop();

        const notes = this.liner.getDrumNotes('temp');

        if (!notes) return;

        let blocks = [
            '<out r100>',
            'temp',
            notes
        ].join('\n');

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            bpm: this.page.bpmValue,
        });
    }

    playBoth() {
        this.page.stop();
        if (!this.hasEditedItems) return;

        let rowsForPlay: string[] = [];

        const midiConfig = this.getMidiConfig();
        let blocks = midiConfig.blocks;
        let playBlock = midiConfig.playBlockOut as TextBlock;

        const playingRows = playBlock.rows.filter(item => {
            const nio = un.getNFromString(item);
            return !!this.editedItems.find(item => item.rowInPartId === nio.rowInPartId);
        });

        playingRows.forEach(playRow => {
            const nio = un.getNFromString(playRow);
            let rows = this.liner.rows.filter(row => row.rowInPartId === nio.rowInPartId)
            rows = this.liner.cloneRows(rows);
            rows.forEach(row => (row.blockOffsetQ = 0));

            const notes = this.liner.getDrumNotes(ideService.guid.toString(), rows);

            if (notes) {
                const block = un.getTextBlocks(notes)[0];

                rowsForPlay.push(`${playRow} ${block.id}`);
                blocks = [...blocks, block];
            } else {
                rowsForPlay.push(`${playRow}`);
            }
        });

        playBlock = createOutBlock({
            id: 'out',
            type: 'set',
            rows: rowsForPlay,
            bpm: this.page.bpmValue
        });

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            playBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            metaByLines: ideService.currentEdit.metaByLines,
        });
    }

    playActive() {
        if (!this.hasEditedItems) return;

        const midiConfig = this.getMidiConfig();
        const playBlock = midiConfig.playBlockOut as TextBlock;
        const playingRows = playBlock.rows.filter(item => {
            const nio = un.getNFromString(item);
            return !!this.editedItems.find(item => item.rowInPartId === nio.rowInPartId);
        });

        this.page.stop();

        if (!playingRows.length) return;

        const newOutBlock = createOutBlock({
            id: 'out',
            type: 'set',
            rows: playingRows,
            bpm: this.page.bpmValue
        });

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks: midiConfig.blocks,
            playBlock: newOutBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            metaByLines: ideService.currentEdit.metaByLines,
        });
    }


    subscribeIdeEvents() {
        getWithDataAttrValue(ids.ideAction, 'play-both', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => this.playBoth());
        });

        getWithDataAttrValue(ids.ideAction, 'save', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.saveEditingItems());
        });

        getWithDataAttrValue(ids.ideAction, 'load', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.loadFile());
        });

        getWithDataAttrValue(ids.ideAction, 'back', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                this.page.context.$f7router.navigate(`/mbox/${ideService.currentEdit.name}/`);
            });
        });

        getWithDataAttr(ids.rowInPartId, this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => this.songRowClick(el));
        });

        getWithDataAttrValue(ids.ideAction, 'clear', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                ideService.currentEdit = {} as any;
                this.editedItems = [];
                getWithDataAttr(ids.ideContent, this.page.pageEl).forEach((el: HTMLElement) => {
                    el.innerHTML = null;
                });
                getWithDataAttr('bottom-command-panel', this.page.pageEl).forEach((el: HTMLElement) => {
                    el.innerHTML = null;
                });
                getWithDataAttr('edit-row-actions', this.page.pageEl).forEach((el: HTMLElement) => {
                    el.style.display = 'block';
                });
                this.liner.fillLinesStructure('480');
                this.printChess(this.liner.rows);
            });
        });

        getWithDataAttrValue(ids.ideAction, 'play-active', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playActive());
        });

        getWithDataAttrValue(ids.ideAction, 'stop', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                this.page.stop();
            });
        });
    }

    drumNoteClick(el: HTMLElement) {
        const rowCol = this.activeCell.rowCol;
        const cell = getWithDataAttrValue('chess-cell-row-col', rowCol)[0];

        if (!cell) return;

        const totalOffsetQ = parseInteger(cell.dataset['chessTotalOffset'], null);

        if (totalOffsetQ === null) return;

        const note = el.dataset['actionDrumNote'];

        if (!note) return;

        let noteInfo = (drumNotesInfo[note] || someDrum) as NoteItem;
        noteInfo = {
            ...noteInfo,
            note,
            durQ: 10,
        }

        const notes = this.liner.getNotesByOffset(totalOffsetQ);

        let isDelete = false;

        for (let iNote of notes) {
            if (iNote.note === note) {
                isDelete = true;

                this.liner.deleteNoteByNoteAndOffset(totalOffsetQ, note);
            }
        }

        if (!isDelete) {
            let info = this.liner.addNoteByOffset(totalOffsetQ, noteInfo);
            this.printChess(this.liner.rows);
            this.highlightCellByRowCol(rowCol);
            this.activeCell.id = info.note.id;
        } else {
            this.printChess(this.liner.rows);
            this.highlightCellByRowCol(rowCol);
        }
    }

    moveCell(id: number, value: number) {
        const result = this.liner.moveCell(id, value);

        if (result) {
            this.printChess(this.liner.rows);
            this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    deleteCell(el: HTMLElement) {
        const cellEl = getWithDataAttrValue('chess-cell-row-col', this.activeCell.rowCol)[0];

        if (!cellEl) return;

        const totalOffset = parseInteger(cellEl.dataset['chessTotalOffset'], null);

        if (totalOffset === null) return;

        this.liner.deleteCellByOffset(totalOffset);
        this.printChess(this.liner.rows);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    deleteRow() {
        if (!this.activeCell.rowCol) {
            return null;
        }

        this.liner.deleteRow(this.activeCell.row);
        this.printChess(this.liner.rows);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    insertRow() {
        this.liner.addRowAfter(this.activeCell.row - 1);
        this.printChess(this.liner.rows);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    addRow() {
        this.liner.addRowAfter(this.activeCell.row);
        this.printChess(this.liner.rows);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    subscribeCommonCommands() {
        const page = this.page;
        const pageEl = page.pageEl;

        getWithDataAttrValue('page-action', 'play-one', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playOne());
        });

        getWithDataAttrValue('page-action', 'get-bpm-or-stop', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                // остановить запись
                if (this.keyData) {
                    this.keyData.next = Date.now();
                    this.keySequence.push(this.keyData);
                    this.getOut(page.bpmValue, this.keySequence);
                    this.clearRecordData();
                    page.stopTicker();

                    return;
                }

                const bpmInfo = this.bpmInfo;
                const time = Date.now();

                bpmInfo.pressCount++;

                if (bpmInfo.lastDownTime) {
                    bpmInfo.totalMs = bpmInfo.totalMs + (time - bpmInfo.lastDownTime);
                }
                bpmInfo.lastDownTime = time;

                if (bpmInfo.totalMs) {
                    const avg = bpmInfo.totalMs / (bpmInfo.pressCount - 1);
                    bpmInfo.bpm = Math.round(60000 / avg);
                }

                el.innerText = '' + (bpmInfo.bpm || '');
                //this.bpmRange.setValue(bpmInfo.bpm);
                //this.bpmValue = bpmInfo.bpm;
            });
        });

        // getWithDataAttrValue('page-action', 'clear', this.pageEl).forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', (evt: MouseEvent) => {
        //         getWithDataAttrValue('common-drum', 'get-bpm-or-stop', this.pageEl).forEach((el: HTMLElement) => {
        //             this.drumCtrl.clearBpmInfo();
        //             el.innerText = '';
        //         });
        //     });
        // });

        getWithDataAttrValue('page-action', 'record', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                if (this.mode !== 'record') {
                    this.mode = 'record';
                    el.style.fontWeight = '700';
                } else {
                    this.mode = null;
                    el.style.fontWeight = '400';
                }
            });
        });

        getWithDataAttr('action-drum-key', pageEl).forEach((el: HTMLElement) => {
            //console.log(el, el.dataset['actionDrum']);

            const note1 = (el.dataset['actionDrumKey'] || '').split('+')[0];

            if (!note1) {
                return;
            }

            const note2 = (el.dataset['actionDrum'] || '').split('+')[1];
            const notes = [note1, note2].filter(item => !!item && !item.startsWith('empty'));
            const volume = note1 === 'cowbell' ? 0.30 : undefined
            const keyboardId = el.dataset['keyboardId'];
            const color = el.dataset['color'];
            const char = el.dataset['char'];

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const time = Date.now();

                if (this.mode === 'record') {
                    this.handleKeyRecord(note1, time, color, char, DOWN);
                }

                notes.forEach(keyOrNote => {
                    //console.log(keyOrNote);

                    page.synthesizer.playSound({
                        keyOrNote,
                        volume,
                        id: keyboardId,
                        onlyStop: false,
                    });
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = '1px solid black';
                    });
                }
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const time = Date.now();

                if (this.mode === 'record') {
                    return this.handleKeyRecord(note1, time, color, char, UP);
                }

                notes.forEach(keyOrNote => {
                    page.synthesizer.playSound({
                        keyOrNote,
                        id: keyboardId,
                        onlyStop: true,
                    });
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = null;
                    });
                }
            });
        });

        getWithDataAttrValue('action-out', 'test', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                // 3*(2*120+1*60)_2*60
                //this.liner.fillLinesStructure('1*120_1*60_1*120_1*60');
                //this.liner.fillLinesStructure('480');
                //this.printModel(this.liner.rows);
            });
        });
    }

    subscribeEditCommands() {
        this.subscribeMoveCommands();

        getWithDataAttrValue('edit-action', 'delete-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteCell(el));
        });

        getWithDataAttr(ids.actionDrumNote, this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.drumNoteClick(el));
        });

        getWithDataAttrValue('edit-row-action', 'add-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addRow());
        });

        getWithDataAttrValue('edit-row-action', 'insert-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.insertRow());
        });

        getWithDataAttrValue('edit-row-action', 'delete-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteRow());
        });
    }

    drumInstrumentClick(el: HTMLElement) {

    }

    subscribeEvents() {
        this.subscribeCommonCommands();
        this.subscribeEditCommands();
        this.subscribeIdeEvents();
    }

    clearRecordData() {
        this.keyData = null;
        this.keySequence = [];
    }

    clearBpmInfo() {
        this.bpmInfo = this.getEmptyBpmInfo();
    }

    getBottomCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let result = '';

        result = `
            <div data-bottom-command-panel>
                <div style="${rowStyle}">
                    <!--span 
                        style="${style}"
                        data-ide-action="ready"
                    >ready</span-->
                    <span
                        style="${style}"
                        data-ide-action="save"
                    >save</span>
                    &nbsp;
                    <span
                        style="${style}"
                        data-ide-action="load"
                    >load</span>
                    <!--span
                        style="${style}"
                        data-ide-action="clear"
                    >clear</span-->
                    <span
                        style="${style}"
                        data-ide-action="stop"
                    >stop</span>
                    <span
                        style="${style} color: blue;"
                        data-ide-action="play-both"
                    >play2</span>
                </div>
            </div>
        `.trim();

        return result;
    }

    getDrumNotesPanel(): string {
        const rowStyle = `width: 100%; font-family: monospace; margin-top: .5rem; margin-bottom: .5rem; user-select: none;`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;

        let wrapper = `
            <div style="display: flex; width: 90%; justify-content: space-between; user-select: none; margin-bottom: .5rem;">
                <div style="border-radius: .5rem; margin-left: .5rem; padding-left: .5rem; padding-right: .5rem; border: 1px solid lightgray;">
                    %instruments%
                </div>
                <div style="padding: .5rem;">
                    %actions%
                </div>                
            </div>
        `.trim();

        let topRow = ''
        drumKodesTop.forEach(item => {
            const info = drumNotesInfo[item.note];
            topRow += `
                <span
                    style="${style}"
                    data-${ids.actionDrumNote}="${info.note}"
                >${info.vocalism}</span>
            `;
        });
        topRow = `<div style="${rowStyle}">${topRow}</div>`;

        let midRow = ''
        drumKodesMid.forEach(item => {
            const info = drumNotesInfo[item.note];
            midRow += `
                <span
                    style="${style}"
                    data-${ids.actionDrumNote}="${info.note}"
                >${info.vocalism}</span>
            `;
        });
        midRow = `<div style="${rowStyle}">${midRow}</div>`;

        let botRow = ''
        drumKodesBot.forEach(item => {
            const info = drumNotesInfo[item.note];
            botRow += `
                <span
                    style="${style}"
                    data-${ids.actionDrumNote}="${info.note}"
                >${info.vocalism}</span>
            `;
        });
        botRow = `<div style="${rowStyle}">${botRow}</div>`;

        let actions = `
            <span
                style="${style}"
                data-action-type="stop"
            >stop</span>
            &nbsp;
            <span
                style="${style} color: blue;"
                data-page-action="play-one"
            >play</span>        
        `.trim();

        wrapper = wrapper.replace('%instruments%', topRow + midRow + botRow);
        wrapper = wrapper.replace('%actions%', actions);

        return wrapper;
    }

    getDrumBoardContent(keyboardId: string): string {
        return this.board.getContent(keyboardId);
    }

    getPatternsContent(): string {
        const style = `font-size: 1.7rem; margin: .5rem; user-select: none; font-family: monospace;`;

        const content = `
            <div style="${style}" data-type="drum-pattern">
                O-k-T-k-O---V---<br/>                    
                O-k-T-k-O---O-kt<br/>
                O-ktK-v-O---O---<br/>
                O-k-|-k-O-k-V---<br/>
                O---|-k-O---V---<br/>
                O---T-k-O---V---<br/>
                O---T-k-O---O---<br/>                                                        
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                O-----k-----<br/>
                T-----k-----<br/>
                O-----------<br/>
                V-----------<br/>
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                O-----k-----<br/>
                T-----k-----<br/>
                O-----------<br/>
                O-----k--t--<br/>
            </div>     
            <br/>                   
            <div style="${style}" data-type="drum-pattern">
                QoxoAoq_<br/>
                X_qoA_xv<br/>
                Q_q_Aoxo<br/>
                X_x_A_xv
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                Q_q_Aoq_<br/>
                X_q_A_xv<br/>
                Q_q_Aoxo<br/>
                X_qoA_xv
            </div>`.trim();

        return content;
    }

    getMidiConfig(): MidiConfig {
        const currentEdit = ideService.currentEdit;

        //console.log('getMidiConfig');

        const rows = currentEdit.editPartsNio.reduce((acc, partNio) => {
            const part = currentEdit.topOutParts[partNio - 1];
            const nio = un.getNFromString(part);
            let N = '';

            if (!nio.part) {
                N = ` ${un.getNRowInPartId(partNio)}`;
            }

            acc.push(`> ${part}${N}`);

            return acc;
        }, [] as string[] );

        //console.log('rows', rows);

        const outBlock = un.createOutBlock({
            id: 'out',
            bpm: this.page.bpmValue,
            rows,
            volume: 50,
            type: 'text'
        });

        //console.log('outBlock', outBlock);

        const midiConfig: MidiConfig = {
            blocks: currentEdit.blocks,
            excludeIndex: [],
            currRowInfo: {first: 0, last: 0},
            currBlock: outBlock,
            midiBlockOut: null as any,
            playBlockOut: null as any,
            topBlocksOut: [],
        };

        getMidiConfig(midiConfig);

        return midiConfig;
    }

    getIdeContent(): string {
        if (!this.hasIdeItem) return '';

        const currentEdit = ideService.currentEdit;
        const cmdStyle = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;

        this.page.bpmValue = currentEdit.outBlock.bpm;

        const midiConfig = this.getMidiConfig();
        const outBlocksInfo = getOutBlocksInfo(midiConfig.blocks, midiConfig.playBlockOut);
        const rowsByParts: {row: OutBlockRowInfo, partNio: number, rowNio: number}[][] = [];

        outBlocksInfo.rows.reduce((acc, row, i) => {
            const n = un.getNFromString(row.text);

            if (!n.part || !n.row ) {
                return acc;
            }

            if (!acc[n.part]) {
                acc[n.part] = [];
                rowsByParts.push(acc[n.part]);
            }

            acc[n.part].push({
                partNio: n.part,
                rowNio: n.row,
                row,
            })

            return acc;
        }, <{[key: string]: {row: OutBlockRowInfo, partNio: number, rowNio: number}[]}>{});

        let editingPartsContent = '';

        rowsByParts.forEach(rowsByPart => {
            const partNio = rowsByPart[0].partNio;

            editingPartsContent += `
                <div >
                    <span style="margin: .5rem; font-weight: 600;"
                    >${currentEdit.topOutParts[partNio - 1]}-${partNio}</span>
            `.trim();

            rowsByPart.forEach(info => {
                const row = info.row;
                const rowCount = Math.ceil(row.rowDurationByHeadQ / un.NUM_120);
                let cellCount = 0;

                if (row.rowDurationByHeadQ % un.NUM_120) {
                    cellCount = Math.floor((row.rowDurationByHeadQ % un.NUM_120) / 10);
                }

                editingPartsContent += `<span
                    style="padding: .25rem; margin: .25rem; display: inline-block; background-color: #d7d4f0;"
                    data-${ids.rowInPartId}="${info.partNio}-${info.rowNio}"
                    data-duration="${row.rowDurationByHeadQ}"
                    data-song-name="${currentEdit.name}"
                    data-part-nio="${info.partNio}"                    
                    data-row-nio="${info.rowNio}"
                >${info.rowNio}:${rowCount + (cellCount ? '.' + cellCount : '')}</span>`;
            });

            editingPartsContent += '</div>';
        });

        return `
            <div data-${ids.ideContent}>
                <div style="padding-left: 1rem;">
                    <span
                        style="${cmdStyle}"
                        data-ide-action="back"
                    >back</span>
                    <!--span
                        style="${cmdStyle}"
                        data-ide-action="play-all"
                    >playAll</span-->                
                    <span
                        style="${cmdStyle} color: blue;"
                        data-ide-action="play-active"
                    >playActive</span>  
                    <span
                        style="${cmdStyle}"
                        data-ide-action="stop"
                    >stop</span>
                    &nbsp;&nbsp;
                    <span
                        style="${cmdStyle}"
                        data-ide-action="clear"
                    >clear</span>                    
                </div>
                
                <div style="margin-top: .5rem;">
                    ${editingPartsContent}
                </div>

            </div>
        `.trim();
    }

    getContent(keyboardId: string): string {
        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                &emsp;${this.page.getMetronomeContent()}
            </div>`.trim();

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum-key="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');

        //console.log(drums);

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${metronome}
                ${this.getDrumBoardContent(keyboardId)}
                ${this.getTopCommandPanel()}
                ${this.getDrumNotesPanel()}
                
                <div
                    data-name="chess-wrapper"
                    style="width: 90%; padding-left: 1rem;"
                ></div>
                
                ${this.hasIdeItem ? this.getBottomCommandPanel() : ''}
                ${this.getIdeContent()}                
                
                <div style="font-size: 1.5rem;">
                    ${drums}
                </div>
                
                <div 
                    data-name="drum-patterns"                
                    style="width: 90%; padding-left: 2%;"
                >
                    ${this.getPatternsContent()}               
                </div>                
            </div>`.trim();

        return content;
    }

    handleKeyRecord(note: string, time: number, color: string, char: string, type: 0 | 1) {
        //console.log(code, time, type);

        if (this.mode !== 'record') {
            return;
        }

        // ПЕРВОЕ НАЖАТИЕ
        if (!this.keyData && type === DOWN) {
            this.keyData = {
                note,
                char,
                code: note,
                down: time,
                up: 0,
                next: 0,
                //quarterTime: this.tickInfo.quarterTime,
                //quarterNio: this.tickInfo.quarterNio,
                quarterTime: 0,
                quarterNio: 0,
                color: color || 'black',
                color2: '',
            };

            return;
        }

        if (this.keyData) {
            if (type === UP) {
                this.keyData.up = time;
            }

            if (type === DOWN) {
                this.keyData.next = time;
                this.keySequence.push(this.keyData);

                this.keyData = {
                    note,
                    char,
                    code: note,
                    down: time,
                    up: 0,
                    next: 0,
                    quarterTime: 0,
                    quarterNio: 0,
                    color: color || 'black',
                    color2: '',
                };
            }
        }
    }

    getOut(bpm: number, seq: DrumCtrl['keySequence'] ) {
        const rows = LineModel.GetLineModelFromRecord(bpm, this.tickStartMs, seq);
        this.liner.setData(rows);
        this.printChess(rows);
    }

    printChess(rows: Line[]) {
        const rem = 'rem';
        const getMask = (count: number): ChessCell[] => {
            const arr = Array(count).fill(null);
            return arr.map(() => ({
                bgColor: 'whitesmoke',
                noteId: 0,
                cellId: 0,
                char: '',
                startOffsetQ: 0,
                totalOffsetQ: 0,
                underline: false,
            }));
        }

        let totalOut = '';
        let height = 1.26;
        let padding = .07;
        let rowHeight = 1.4;

        const getTextAndColor = (arr: NoteItem[]): ChessCell => {
            const result: ChessCell = {
                noteId: 0,
                cellId: 0,
                char: '',
                //color: 'white',
                bgColor: 'lightgray',
                underline: false,
                startOffsetQ: 0,
                totalOffsetQ: 0,
            }

            const map = {
                bd: 0,
                sn: 0,
                hc: 0
            }

            arr = arr.filter(item => {
                if (item.note === 'bd' || item.note === 'sn' || item.note === 'hc') {
                    map[item.note] = item.id;

                    return false;
                }

                return true;
            });

            if (arr.length) {
                result.char = (drumNotesInfo[arr[0].note])?.char || '?';
                result.noteId = arr[0].id || 0;
            }
            else {
                result.char = map.hc ? '_' : '';
                result.noteId = map.hc ? map.hc : 0;
            }

            if (map.bd && map.sn) {
                result.noteId = map.bd;
                result.bgColor = 'black';
            } else if (map.bd) {
                result.noteId = map.bd;
                result.bgColor = drumNotesInfo.bd.headColor;
            } else if (map.sn) {
                result.noteId = map.sn;
                result.bgColor = drumNotesInfo.sn.headColor;
            } else if (arr.length) {
                result.bgColor = drumNotesInfo[arr[0].note]?.headColor || 'darkgray';
            }

            if (map.hc) {
                result.underline = true;
            }

            const cell = this.liner.getCellByNoteId(result.noteId);
            result.cellId = cell?.id;

            return result;
        }

        rows.forEach((row, iRow) => {
            const nextRow = rows[iRow + 1];
            const offsets = this.liner.getOffsetsByRow(row);
            const hasLine = (!!nextRow && nextRow.blockOffsetQ !== row.blockOffsetQ);
            const rowBorderBottom = hasLine ? '1px solid gray;' : 'none;';

            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    font-size: 1.2rem;
                    line-height: .9rem;
                    color: white;                    
                    user-select: none;
                    padding-top: .07rem;
                    height: 1.4rem;
                    border-bottom: ${rowBorderBottom};
                ">`;

            const cellSizeQ = 10;
            const cols = getMask(row.durQ / row.cellSizeQ);
            cols.forEach((col, i) => {
               col.startOffsetQ = row.startOffsetQ + (cellSizeQ * i);
               col.totalOffsetQ = col.startOffsetQ + row.blockOffsetQ;
            });

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / cellSizeQ;
                const notes = this.liner.getNotesListByOffset(row, offset);

                const col = cols[iCell];
                const textAndColor = getTextAndColor(notes);

                col.cellId = textAndColor.cellId;
                col.noteId = textAndColor.noteId;
                col.bgColor = textAndColor.bgColor;
                col.char = textAndColor.char;
                col.underline = textAndColor.underline;
            }

            cols.forEach((col, iCol) => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${iCol}"
                        data-chess-cell-row-col="${iRow}-${iCol}"
                        data-chess-cell-id=""
                        data-chess-total-offset="${col.totalOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            z-index: 0;
                            position: absolute;
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${iCol * height}${rem};
                        "
                    ></span>`.trim();
            });

            cols.forEach((cell, iCell) => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';
                const rem = 'rem';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${iCell}"
                        data-chess-cell-row-col="${iRow}-${iCell}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${iCell}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            z-index: 0;
                            text-decoration: ${textDecoration};
                            left: ${iCell * height}${rem};
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();
    }
}