import * as un from '../libs/muse/utils/utils-note';
import {DEFAULT_VOLUME, getString} from '../libs/muse/utils/utils-note';
import {SongPartInfo} from '../libs/muse/utils/utils-note';
import {StoredRow} from './song-store';

export type KeyData = {
    quarterTime: number;
    quarterNio: number;
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
    color: string;
    color2: string;
    char: string;
};

export type LineNote = {
    id: number;
    durQ: number;
    note: string;
    startOffsetQ: number;

    lineOffsetQ?: number; // TODO
    headColor?: string;
    bodyColor?: string;
    char?: string;
    instCode?: string | number;
    instName?: string;
    volume?: number;
    slides?: string;
    pitchShift?: number;
    cent?: number;
};

export type Cell = {
    id: number;
    startOffsetQ: number;
    notes: LineNote[]
}

export type Line = {
    //nio: number,
    durQ: number,
    startOffsetQ: number,
    blockOffsetQ: number,
    rowInPartId: string,
    cellSizeQ: number,
    cells: Cell[],
    endLine?: boolean,
}

type CellCoord = {
    row: number,
    ind: number,
    col: number,
}

export const CELL_SIZE = 10;

function getSlides(val: string): string {
    val = (val || '').trim();

    val = val.replace(/\r\n/g, '\n');
    val = val.replace(/ /g, '\n');
    val = val.split(/\n/).filter(val => !!val).join('_');

    return val;
}

const DEF_DRUM_DUR = 1;

export class LineModel {
    lines: Line[] = [];

    findRowIndByOffset(offsetQ: number): number {
        return this.lines.findIndex(row => {
            const rowOffsetQ  = row.startOffsetQ + row.blockOffsetQ;
            return offsetQ >= rowOffsetQ && offsetQ < (rowOffsetQ + row.durQ)
        });
    }

    getRowByOffset(offsetQ: number): Line {
        return this.lines[this.findRowIndByOffset(offsetQ)];
    }

    getCellByNoteId(id: number): Cell {
        for (let row of this.lines) {
            for (let cell of row.cells) {
                for (let note of cell.notes) {
                    if (note.id === id) {
                        return cell;
                    }
                }
            }
        }

        return null as any;
    }

    addCellDuration(id: number, value: number): CellCoord | null {
        const info = this.getRowAndCellIndexes(id);


        if (!info) {
            return null;
        }

        const rows = this.lines;
        const cell = rows[info.row].cells[info.ind];

        cell.notes.forEach(note => {
            const newDurQ = note.durQ + value;

            note.durQ = newDurQ > 0 ? newDurQ : 0;
        });

        return info;
    }

    moveCell(id: number, value: number): CellCoord | null {
        const info = this.getRowAndCellIndexes(id);

        if (!info) {
            return null;
        }

        const rows = this.lines;
        const row = rows[info.row];
        const cell = rows[info.row].cells[info.ind];

        let newTotalOffsetQ = row.blockOffsetQ + cell.startOffsetQ + value;
        let oldTotalOffsetQ = row.startOffsetQ + row.blockOffsetQ;

        if (newTotalOffsetQ >= oldTotalOffsetQ && newTotalOffsetQ < (oldTotalOffsetQ + row.durQ)) {
            cell.startOffsetQ = newTotalOffsetQ - row.blockOffsetQ;

            return this.getRowAndCellIndexes(id);
        } else {
            const ind = this.findRowIndByOffset(newTotalOffsetQ);

            if (ind > -1) {
                const newRow = this.lines[ind];
                row.cells = row.cells.filter(item => item != cell);
                cell.startOffsetQ = newTotalOffsetQ - newRow.blockOffsetQ;
                newRow.cells.push(cell);

                return this.getRowAndCellIndexes(id);
            }
        }

        return null;
    }

    setData(rows: Line[]) {
        let noteId = 1;
        let cellId = 1;

        rows.forEach(row => {
            row.cells.forEach(cell => {
                cell.id = cellId++;
                cell.notes.forEach(note => {
                    note.id = noteId++;
                })
            })
        });

        this.lines = rows;
    }

    delete_NoteByNoteAndOffset(offset: number, note: string) {
        const {row, cells} = this.getCellsByOffset(offset);

        if (!row) return;

        cells.forEach(cell => {
            cell.notes = cell.notes.filter(iNote => iNote.note !== note);
        });

        row.cells = row.cells.filter(cell => !!cell.notes.length);
    }

    delete_CellByOffset(offsetQ: number) {
        const row = this.lines[this.findRowIndByOffset(offsetQ)];

        if (!row) return;

        offsetQ = offsetQ - row.blockOffsetQ;

        row.cells = row.cells.filter(cell => {
            return cell.startOffsetQ !== offsetQ;
        });
    }

    getAllCells(): Cell[] {
        const result: Cell[] = [];

        this.lines.forEach(row => {
            row.cells.forEach(cell => {
                result.push(cell);
            })
        })

        return  result;
    }

    getMaxCellId(): number {
        const cells = this.getAllCells();
        if (!cells.length) return 0;

        return Math.max(...cells.map(item => item.id));
    }

    getMaxNoteId(): number {
        const notes = this.getAllNotes();
        if (!notes.length) return 0;

        return Math.max(...notes.map(item => item.id));
    }

    getAllNotes(): LineNote[] {
        const cells = this.getAllCells();

        if (!cells.length) return [];

        return cells.reduce((acc, cell) => {
            return acc = [...acc, ...cell.notes]
        }, []);
    }

    addNoteByOffset(offsetQ: number, note: LineNote): {
        note: LineNote,
        coord: CellCoord,
    } {
        const row = this.getRowByOffset(offsetQ);

        if (!row) return;

        note.id = this.getMaxNoteId() + 1;
        note.startOffsetQ = offsetQ - row.blockOffsetQ;

        const id = this.getMaxCellId() + 1;

        row.cells.push({
           id,
           startOffsetQ: note.startOffsetQ,
           notes: [note]
        });

        return {
            note,
            coord: this.getRowAndCellIndexes(id)
        };
    }

    delete_Line(i: number, rowInPartId = '') {
        if (this.lines.length === 1) {
            this.lines = [];

            return;
        }

        const topArr = this.lines.slice(0, i+1);
        const botArr = this.lines.slice(i+1);
        const delRow = topArr.pop();
        this.addOffset(botArr, -delRow.durQ, rowInPartId);

        this.lines = [...topArr, ...botArr];
    }

    static GetEmptyLine(rowInPartId: string = ''): Line {
        return  {
            durQ: 120,
            startOffsetQ: 0,
            cells: [],
            cellSizeQ: CELL_SIZE,
            blockOffsetQ: 0,
            rowInPartId,
        };

    }

    getEmptyLine(rowInPartId: string = ''): Line {
        return LineModel.GetEmptyLine(rowInPartId);
    }

    addLineAfter(i: number, rowInPartId: string = '') {
        const newLine = LineModel.GetEmptyLine();

        newLine.rowInPartId = rowInPartId;

        if (!this.lines.length) {
            this.lines.push(newLine);

            return;
        }

        const topArr = this.lines.slice(0, i+1);
        const lastEl = topArr[topArr.length-1];
        const botArr = this.lines.slice(i+1);

        this.addOffset(botArr, 120, rowInPartId);

        newLine.startOffsetQ = lastEl ? lastEl.startOffsetQ + lastEl.durQ : 0;
        topArr.push(newLine);
        this.lines = [...topArr, ...botArr];
    }

    addOffset(arr: Line[], offsetQ: number, rowInPartId= '') {
        for (let i = 0; i < arr.length; i++) {
            const row = arr[i];

            if (rowInPartId && row.rowInPartId !== rowInPartId) {
                continue;
            }

            row.startOffsetQ = row.startOffsetQ + offsetQ;
            row.cells.forEach(cell => {
                cell.startOffsetQ = cell.startOffsetQ + offsetQ;
                cell.notes.forEach(note => {
                    note.startOffsetQ = note.startOffsetQ + offsetQ;
                })
            })

        }
    }

    getRowAndCellIndexes(id: number): CellCoord | null {
        if (!id || !this.lines) {
            return null;
        }

        const rows = this.lines;

        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[i].cells.length; j++) {
                if (rows[i].cells[j].id === id) {
                    const offset = rows[i].cells[j].startOffsetQ - rows[i].startOffsetQ;

                    return {
                        row: i,
                        ind: j,
                        col: Math.ceil(offset / rows[i].cellSizeQ)
                    };
                }
            }
        }

        return null;
    }

    getItemById(id: number): Cell | null {
        if (!id) {
            return null;
        }

        for (let row of this.lines) {
            for (let item of row.cells) {
                if (item.id === id) {
                    return item;
                }
            }
        }

        return null;
    }

    getLineModelFromRecord(bpm: number, startTimeMs, seq: KeyData[] ): Line[] {
        return LineModel.GetToneLineModelFromRecord(bpm, startTimeMs, seq);
    }

    static GetToneLineModelFromRecord(bpm: number, startTimeMs, seq: KeyData[] ): Line[] {
        let qms = Math.round(60000/ bpm); // ms в четверти
        let rows: Line[] = [];

        // начало и номер четверти
        for (let i = 0; i<seq.length; i++) {
            const item = seq[i];
            const next = seq[i+1];
            let diffMs = item.down - startTimeMs;
            let quarterNio = Math.floor(diffMs/qms);
            item.quarterTime = startTimeMs + (qms * quarterNio);
            item.quarterNio = quarterNio;

            if (next && ((next.down - item.down) < 20) ) {
                next.down = item.down;
            }
        }

        const lastInd = seq.length - 1;
        const firstTime = seq[0].quarterTime;
        const lastTime = seq[lastInd].next;

        // количество четвертей
        const rowCount = Math.ceil((lastTime - firstTime)/qms);

        for (let ind = 0; ind < rowCount; ind++) {
            rows.push({
                durQ: 120,
                startOffsetQ: ind * 120,
                cellSizeQ: CELL_SIZE,
                cells: [],
                blockOffsetQ: 0,
                rowInPartId: '',
            })
        }

        const getLineByStartOffsetQ = (startOffsetQ: number): Line => {
            return rows.find(item => {
                return startOffsetQ >= item.startOffsetQ && startOffsetQ < (item.startOffsetQ + item.durQ);
            });
        }

        const getCellByStartOffsetQ = (startOffsetQ: number, row: Line): Cell => {
            return row.cells.find(item => startOffsetQ === item.startOffsetQ);
        }

        let cellId = 1;

        seq.forEach((item, i) => {
            let itemNew: LineNote = {
                id: i + 1,
                bodyColor: '',
                headColor: '',
                note: '',
                durQ: 0,
                startOffsetQ: 0,
                char: item.char,
            }

            const startOffsetQ = Math.floor((item.down - firstTime) / qms * un.NUM_120 / 10) * 10;

            itemNew.startOffsetQ = startOffsetQ;
            itemNew.durQ = Math.floor(
                (item.up - item.down) / qms * un.NUM_120 / 10
            ) * 10 || 10;
            itemNew.headColor = item.color;
            itemNew.note = item.note;

            let row = getLineByStartOffsetQ(startOffsetQ);

            if (row) {
                //let cell = getCellByStartOffsetQ(startOffsetQ, row) as Cell;
                let cell: Cell;

                if (!cell) {
                    cell = {
                        id: cellId++,
                        startOffsetQ: itemNew.startOffsetQ,
                        notes: []
                    }

                    row.cells.push(cell);
                }

                cell.notes.push(itemNew);
            }
        });

        return rows;
    }

    static GetLineModelFromRecord(bpm: number, startTimeMs, seq: KeyData[] ): Line[] {
        let qms = Math.round(60000/ bpm); // ms в четверти
        let rows: Line[] = [];

        // начало и номер четверти
        for (let i = 0; i<seq.length; i++) {
            const item = seq[i];
            const next = seq[i+1];
            let diffMs = item.down - startTimeMs;
            let quarterNio = Math.floor(diffMs/qms);
            item.quarterTime = startTimeMs + (qms * quarterNio);
            item.quarterNio = quarterNio;

            if (next && ((next.down - item.down) < 20) ) {
                next.down = item.down;
            }
        }

        const lastInd = seq.length - 1;
        const firstTime = seq[0].quarterTime;
        const lastTime = seq[lastInd].next;

        // количество четвертей
        const rowCount = Math.ceil((lastTime - firstTime)/qms);

        for (let ind = 0; ind < rowCount; ind++) {
            rows.push({
                durQ: 120,
                startOffsetQ: ind * 120,
                cellSizeQ: CELL_SIZE,
                cells: [],
                blockOffsetQ: 0,
                rowInPartId: '',
            })
        }

        const getLineByStartOffsetQ = (startOffsetQ: number): Line => {
            return rows.find(item => {
                return startOffsetQ >= item.startOffsetQ && startOffsetQ < (item.startOffsetQ + item.durQ);
            });
        }

        const getCellByStartOffsetQ = (startOffsetQ: number, row: Line): Cell => {
            return row.cells.find(item => startOffsetQ === item.startOffsetQ);
        }

        let cellId = 1;

        seq.forEach((item, i) => {
            let itemNew: LineNote = {
                id: i + 1,
                bodyColor: '',
                headColor: '',
                note: '',
                durQ: 0,
                startOffsetQ: 0,
                char: item.char,
            }

            const startOffsetQ = Math.floor((item.down - firstTime) / qms * un.NUM_120 / 10) * 10;

            itemNew.startOffsetQ = startOffsetQ;
            itemNew.durQ = Math.floor(
                (item.up - item.down) / qms * un.NUM_120 / 10
            ) * 10 || 10;
            itemNew.headColor = item.color;
            itemNew.note = item.note;

            let row = getLineByStartOffsetQ(startOffsetQ);

            if (row) {
                //let cell = getCellByStartOffsetQ(startOffsetQ, row) as Cell;
                let cell: Cell;

                if (!cell) {
                    cell = {
                        id: cellId++,
                        startOffsetQ: itemNew.startOffsetQ,
                        notes: []
                    }

                    row.cells.push(cell);
                }

                cell.notes.push(itemNew);
            }
        });

        return rows;
    }

    static GetSortedNotes(rows: Line[]): LineNote[] {
        rows = Array.isArray(rows) ? rows : [];
        const notes: LineNote[] = [];

        rows.forEach(row => {
            row.cells.forEach(cell => {
                cell.notes.forEach(note => {
                    note.startOffsetQ = cell.startOffsetQ;
                    notes.push(note);
                })
            });
        });

        this.SortByStartOffsetQ(notes);

        return notes;
    }

    getSortedNotes(rows: Line[]): LineNote[] {
        return LineModel.GetSortedNotes(Array.isArray(rows) ? rows : this.lines);
    }

    sortByField(arr: any[], field: string) {
        arr.sort((first, second) => {
            if (first[field] < second[field]) {
                return -1;
            }

            if (first[field] > second[field]) {
                return 1;
            }

            return 0;
        });
    }

    static SortByStartOffsetQ(arr: (Cell | LineNote) []) {
        arr.sort((first, second) => {
            if (first.startOffsetQ < second.startOffsetQ) {
                return -1;
            }

            if (first.startOffsetQ > second.startOffsetQ) {
                return 1;
            }

            return 0;
        });
    }

    sortByStartOffsetQ(arr: (Cell | LineNote) []) {
        LineModel.SortByStartOffsetQ(arr);
    }

    static GetNoteNames(arr: LineNote[]): string[] {
        const result: {[key: string]: string} = {};

        arr.forEach(item => {
            result[item.note] = item.note;
        });

        return Object.values(result);
    }

    static GetInstrNames(arr: LineNote[]): string[] {
        const result: {[key: string]: string} = {};

        arr.forEach(item => {
            result[item.instName] = item.instName;
        })

        return Object.values(result);
    }

    getNoteNames(arr: LineNote[]): string[] {
        return LineModel.GetNoteNames(arr);
    }

    static GetDurationQByLines(lines: Line[]) {
        lines = Array.isArray(lines) ? lines : [];

        if (lines.length) {
            return lines[lines.length-1].startOffsetQ + lines[lines.length-1].durQ;
        }

        return 0;
    }

    getDurationQByLines(lines?: Line[]) {
        return LineModel.GetDurationQByLines(Array.isArray(lines) ? lines : this.lines);
    }

    getOffsetsByRow(row: Line): number[] {
        const result = []
        const map = {};

        row.cells.forEach(cell => {
            if (!map[cell.startOffsetQ]) {
                map[cell.startOffsetQ] = true;
                result.push(cell.startOffsetQ);
            }
        });

        return result;
    }

    getNotesListByOffset(row: Line, startOffsetQ: number): LineNote[] {
        const result: LineNote[] = []

        row.cells.forEach(cell => {
            if (cell.startOffsetQ !== startOffsetQ) {
                return
            }

            cell.notes.forEach(note => result.push(note));
        });

        return result;
    }

    getNoteById(id: string | number): LineNote {
        if (!id) return null;

        for (let line of this.lines) {
            for (let cell of line.cells) {
                for (let note of cell.notes) {
                    if (note.id == id) {
                        return note;
                    }
                }
            }
        }

        return null;
    }

    getNotesByOffset(offsetQ: number): LineNote[] {
        const result: LineNote[] = []

        const row = this.getRowByOffset(offsetQ);

        if (!row) return result

        row.cells.forEach(cell => {
            if ((cell.startOffsetQ + row.blockOffsetQ) !== offsetQ) {
                return;
            }

            cell.notes.forEach(note => result.push(note));
        });

        return result;
    }

    getCellsByOffset(offsetQ: number): {
        row: Line,
        cells: Cell[]
    } {
        const result = {
            row: null as Line,
            cells: [],
        }

        const row = this.getRowByOffset(offsetQ);

        if (!row) return result;

        result.row = row;

        row.cells.forEach(cell => {
            if ((cell.startOffsetQ + row.blockOffsetQ) !== offsetQ) {
                return;
            }

            result.cells.push(cell);
        })

        return result;
    }

    getNotesHashByOffset(row: Line, startOffsetQ: number): {[key: string]: string} {
        const result: {[key: string]: string} = {};

        row.cells.forEach(cell => {
            if (cell.startOffsetQ !== startOffsetQ) {
                return
            }

            cell.notes.forEach(note => {
                result[note.note] = note.note;
            });
        });

        return result;
    }

    static ClearBlockOffset(rows: Line[]): Line[] {
        rows.forEach(row => {
            row.blockOffsetQ = 0;
        });

        return rows;
    }

    static RecalcAndClearBlockOffset(rows: Line[]): Line[] {
        rows.forEach(row => {
            row.startOffsetQ = row.startOffsetQ + row.blockOffsetQ;
            row.cells.forEach(cell => {
                cell.startOffsetQ = cell.startOffsetQ + row.blockOffsetQ;
            });
            row.blockOffsetQ = 0;
        });

        return rows;
    }

    recalcAndClearBlockOffset(rows: Line[]): Line[] {
        return LineModel.RecalcAndClearBlockOffset(rows);
    }

    // getNoteNames(arr: NoteItem[]): string[] {
    //     let durationQ = 0;
    //
    //     return Object.values(result);
    // }

    static GetToneNotes(x: {
        blockName: string,
        track: string,
        instrName: string,
        rows: Line[]
    }): string {
        let blockName = x.blockName || 'no_name';
        let rows = this.CloneLines(x.rows);
        rows = this.RecalcAndClearBlockOffset(rows);

        const totalDurQ = this.GetDurationQByLines(rows);
        const notes = this.GetSortedNotes(rows);
        const noteNames = this.GetNoteNames(notes);

        if (!totalDurQ || !notes.length || !noteNames.length) {
            return '';
        }

        let result = `<${blockName} $>` + '\n';
        result += `${x.track}: `;

        notes.forEach((note, i) => {
            const instName = note.instName || x.instrName;
            const nextNote = notes[i+1];
            let durationForNext = 0;
            let pause = '';
            let volume = `v${un.parseInteger(note.volume, DEFAULT_VOLUME)}`;
            let slides = getSlides(note.slides);
            let cent = note.cent ? `.${note.cent}` : '';

            if (slides) {
                slides = slides.startsWith('~') ? `:${slides}` : `_${slides}`;
            }

            if (nextNote) {
                durationForNext = nextNote.startOffsetQ - note.startOffsetQ;
            } else {
                durationForNext = totalDurQ - note.startOffsetQ;
            }

            if (i === 0 && note.startOffsetQ) {
                pause = `${note.startOffsetQ} `;
            }

            //result += `${pause} ${instName} ${note.note}=${durationForNext}=${note.durQ} `;
            result += `${pause} ${instName} ${note.note}${cent}=${durationForNext}=${note.durQ}:${volume}${slides} `;
        });

        return result;
    }

    static GetDrumNotes(blockName: string, trackName: string, lines: Line[]): string {
        blockName = blockName || 'no_name';
        trackName = trackName || un.drumsTrack;

        lines = this.CloneLines(lines);
        lines = this.RecalcAndClearBlockOffset(lines);

        //console.log('GetDrumNotes', blockName, trackName, lines);

        const totalDurQ = this.GetDurationQByLines(lines);
        const notes = this.GetSortedNotes(lines);

        notes.forEach(note => {
           if (!note.instName) {
               note.instName = `@${note.note}`;
           }
        });

        //console.log('NOTES', notes);

        const instrNames = this.GetInstrNames(notes).map(name => name.replace(/@/g, ''));
        const map: {[key: string]: {
                chars: string[],
                lastDurQ: number
        }} = {};

        if (!totalDurQ || !notes.length || !instrNames.length) {
            return '';
        }

        const cellCount = totalDurQ / CELL_SIZE;
        const quarterCount = Math.floor(cellCount / 12);

        const emptyLine = new Array(cellCount).fill(' ');
        const headerLine = [...emptyLine];

        for (let i = 0; i < quarterCount; i++) {
            headerLine[i*12] = '|';
        }

        instrNames.forEach(instrName => {
            map[instrName] = {chars: [...emptyLine], lastDurQ: 0};

            const iNotes = notes.filter(note => note.instName === `@${instrName}`);

            for (let i = 0; i < iNotes.length; i++) {
                const note = iNotes[i];
                const nextNote = iNotes[i+1];

                const j = Math.floor(note.startOffsetQ / 10);

                map[instrName].chars[j] = 'x';

                if (note.durQ === DEF_DRUM_DUR) {
                    continue;
                }

                if (!nextNote) {
                    if (note.durQ !== DEF_DRUM_DUR) {
                        map[instrName].lastDurQ = note.durQ;
                    } else {
                        map[instrName].lastDurQ = 480;
                    }
                }
            }
        });

        //console.log(map);

        let result = `<${blockName} @>\n`;

        let noteNameLen = instrNames.reduce((acc, val) => {
            if (val.length > acc) return val.length;

            return acc;
        }, 0);

        result += '-' + new Array(noteNameLen).fill(' ').join('') + ': ' + headerLine.join('') + `: ${trackName}` + '\n';

        Object.keys(map).forEach(key => {
            const emptyStr = new Array(noteNameLen - key.length).fill(' ').join('');

            const lastDurQ = !map[key].lastDurQ ? '' : map[key].lastDurQ;

            result += '@' + key + emptyStr + ': ' + map[key].chars.join('') + `: ${lastDurQ}` + '\n';
        });

        // <tick @>
        // -             : 1   2   3   :
        // @cowbell      : 1           :
        // @nil          :     2   3   :

        //console.log('GetDrumNotes', result);

        return result;
    }

    getDrumNotes(blockName: string, trackName: string, lines: Line[]): string {
        lines = Array.isArray(lines) ? lines : this.lines;

        return LineModel.GetDrumNotes(blockName, trackName, lines);
    }

    static CloneLine(line: Line): Line {
        line = {...line};

        line.cells = line.cells.map(cell => {
            cell = {...cell};

            cell.notes = cell.notes.map(note => {
                return {...note};
            });

            return cell;
        });

        return line;
    }

    static CloneLines(lines: Line[]): Line[] {
        lines = Array.isArray(lines) ? lines : [];

        return lines.map(line => LineModel.CloneLine(line));
    }

    cloneRows(rows?: Line[]): Line[] {
        rows = Array.isArray(rows) ? rows : this.lines;

        return LineModel.CloneLines(rows);
    }

    getLinesByMask(pMask: string | number): Line[] {
        const rows: Line[] = [];
        let startOffsetQ = 0;

        if (un.parseInteger(pMask, 0)) {
            const durQ = un.parseInteger(pMask);
            const fullLineCount = Math.floor(durQ / un.NUM_120);
            const endLineDurQ = durQ % un.NUM_120;

            for (let i = 0; i < fullLineCount; i++) {
                rows.push({
                    durQ: 120,
                    cells: [],
                    startOffsetQ,
                    cellSizeQ: CELL_SIZE,
                    blockOffsetQ: 0,
                    rowInPartId: '',
                });
                startOffsetQ = startOffsetQ + 120;
            }

            if (endLineDurQ) {
                rows.push({
                    durQ: endLineDurQ,
                    cells: [],
                    startOffsetQ,
                    cellSizeQ: CELL_SIZE,
                    blockOffsetQ: 0,
                    rowInPartId: '',
                });
            }

            return rows;
        }

        pMask = ('' + pMask).trim();
        // let arr = val.trim().split('\n');
        // arr = arr.filter(item => !!item)
        //     .map(item => item.trim())
        //     .filter(item => item && !item.startsWith('#') && item.includes('['));

        let topArr = pMask.split('_');
        topArr.forEach(row => {
            const arr = row.split('*');
            const durQ = un.parseInteger(arr[arr.length-1], 0);
            let blockCount = 1;
            let rowInBlock = 1;

            if (arr.length === 3 ) {
                blockCount = un.parseInteger(arr[0], 0);
                rowInBlock = un.parseInteger(arr[1], 0);
            }
            else if (arr.length === 2) {
                rowInBlock = un.parseInteger(arr[0], 0);
            }

            for (let i = 0; i < blockCount; i++) {
                for (let j = 0; j < rowInBlock; j++) {
                    rows.push({
                        durQ: durQ,
                        cells: [],
                        startOffsetQ,
                        cellSizeQ: CELL_SIZE,
                        endLine: j === rowInBlock -1,
                        blockOffsetQ: 0,
                        rowInPartId: '',
                    });

                    startOffsetQ = startOffsetQ + durQ;
                }
            }

        });

        return rows;
    }

    fillLinesStructure(mask: string | number) {
        this.lines = this.getLinesByMask(mask);
    }

    static SplitByMask(x: {track: string, type: string, partInfo: un.SongPartInfo, lines: Line[]}): StoredRow[] {
        //console.log('SplitMask.x', x);

        let result: StoredRow[] = [];
        let mask = (x.partInfo.mask || '').trim();

        let maskArr = mask.split('_');
        let linesSrc = [...x.lines];

        let rowNio = 0;

        // маски нет
        if (!maskArr[0]) {
            rowNio++;

            result = [{
                track: x.track,
                lines: linesSrc,
                type: x.type,
                rowInPartId: `${x.partInfo.partNio}-${rowNio}`,
                rowNio: rowNio,
                partId: x.partInfo.partId,
                status: '',
            }];

            //console.log('SplitMask.result 1', result);
            return result;
        }

        maskArr.forEach(maskItem => {
            maskArr = maskItem.split('*');

            let lineDurQ = 120;
            let lineInBlock = 1;
            let blockCount = 1;

            if (maskArr.length === 1) {
                lineDurQ = un.parseInteger(maskArr[0], 120);
            }

            if (maskArr.length === 2) {
                lineInBlock = un.parseInteger(maskArr[0], 4);
                lineDurQ = un.parseInteger(maskArr[1], 120);
            }

            if (maskArr.length === 3) {
                blockCount = un.parseInteger(maskArr[0], 1);
                lineInBlock = un.parseInteger(maskArr[1], 4);
                lineDurQ = un.parseInteger(maskArr[2], 120);
            }

            for (let i = 0; i < blockCount; i++) {
                if (!linesSrc.length) {
                    break;
                }

                rowNio++;
                let lines = linesSrc.splice(0, lineInBlock);
                let offset = lineInBlock * lineDurQ;

                linesSrc.forEach(line => {
                    line.startOffsetQ = line.startOffsetQ - offset;
                    line.cells.forEach(cell => {
                        cell.startOffsetQ = cell.startOffsetQ - offset;
                        cell.notes.forEach(note => {
                            note.startOffsetQ = note.startOffsetQ - offset;
                        });
                    });
                });

                result.push({
                    track: x.track,
                    lines,
                    type: x.type,
                    rowInPartId: `${x.partInfo.partNio}-${rowNio}`,
                    rowNio: rowNio,
                    partId: x.partInfo.partId,
                    status: '',
                });

                //console.log('arr', arr);
            }

            //console.log('maskItem', maskItem, blockCount, lineInBlock, lineDurQ);
        });

        if (linesSrc.length) {
            rowNio++;

            result.push({
                track: x.track,
                lines: linesSrc,
                type: x.type,
                rowInPartId: `${x.partInfo.partNio}-${rowNio}`,
                rowNio: rowNio,
                partId: x.partInfo.partId,
                status: '',
            });
        }

        //console.log('SplitMask.result 2', result);

        return result;
    }
}
