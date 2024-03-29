import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';
import { Dom7Array } from 'dom7';

import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils';
import { standardTicks as ticks } from './ticks';
//import { getMidiConfig } from '../libs/muse/utils/getMidiConfig';
import { RowInfo } from '../libs/muse/utils/getMidiConfig';
import { FileSettings, getFileSettings, getPitchShiftSetting } from '../libs/muse/utils/getFileSettings';
import { parseInteger, SongPartInfo, TextBlock } from '../libs/muse/utils/utils-note';

import mboxes from '../mboxes';
import {Muse as m} from '../libs/muse';

import { LineModel } from './line-model';
import { ideService } from './ide/ide-service';
import { SongStore, SongNode, StoredRow, MY_SONG } from './song-store';
import * as svg from './svg-icons';
import { TrackDetailsDialog } from './dialogs/track-details-dialog';
import { TracksVolumeDialog } from './dialogs/tracks-volume-dialog';
import { textModelToLineModel, sortTracks } from './text-model-to-line-model';
import { WavRecorder } from './ide/wav-recorder';
import {GetTrackDialog} from './dialogs/get-track-dialog';

const blankHalfRem = '<span style="width: .5rem; display: inline-block;"></span>'

const {
    getMidiConfig
} = m.parse;

export class MBoxPage {
    view: 'list' | 'song' = 'list';

    recorder: WavRecorder;
    playingTick = '';
    bpmRange: Range.Range;
    excludePartNio: number [] = [];
    selectedSong = '';
    selectedSongName = '';

    ns = '';
    isMy = false;

    get bpmValue(): number {
        return ideService.bpmValue;
    }

    set bpmValue(bpmValue: number) {
        ideService.bpmValue = bpmValue;
    }

    get pageId(): string {
        return this.props.id;
    }

    get songId(): string {
        return this.props.song;
    }

    get pageEl(): HTMLElement {
        return this.context.$el.value[0] as HTMLElement;
    }

    get el$(): Dom7Array {
        return this.context.$el.value;
    }

    get outBlock(): TextBlock {
        return  this.blocks.find((item) => item.id === 'out');
    }

    get useLineModel():boolean {
        return !!(this.isMy || this.pageData.exportToLineModel || false);
    }

    get blocks (): un.TextBlock[] {
        return ideService.blocks;
    }

    get settings (): FileSettings  {
        return ideService.settings;
    }

    get allSongParts(): string[] {
        const parts = ideService.songStore?.data.parts || [];

        const result = parts.map((item, i) => {
            return `${item.name} %${item.id} №${i+1}`;
        });

        console.log('allSongParts\n', result.join('\n'));

        return result;
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    constructor(
        public props: Props,
        public context: ComponentContext,
    ) {}

    pageData: SongNode;

    getPageData(): SongNode {
        if (mboxes[this.songId]) {
            return mboxes[this.songId];
        }

        const song = SongStore.GetSong(this.songId, MY_SONG, true);
        song.source = 'my';
        song.ns = MY_SONG;

        return song;
    }

    initData(force: boolean) {
        const songId = this.songId;
        const pageData = this.pageData = this.getPageData();

        this.isMy = pageData.source === 'my';
        this.view = pageData.isSongList ? 'list' : 'song';
        this.ns   = pageData.ns;

        //console.log('pageMbox.onMounted', pageData);

        if (this.view === 'song') {
            let songData: SongNode;

            if (ideService?.songStore?.songId && ideService.songStore.songId === songId && !force) {
                // таже самая песня
            } else {
                ideService.blocks = un.getTextBlocks(pageData.score) || [];
                ideService.settings = getFileSettings(ideService.blocks);
                //ideService.pitchShift = getPitchShiftSetting(ideService.settings);
                ideService.pitchShift = 0;

                if (!mboxes[songId]) {
                    songData = pageData;
                } else {
                    songData = mboxes[this.songId];
                    songData = this.textModelToLineModel(this.songId, songData);
                }

                songData.ns = this.ns;

                ideService.songStore = new SongStore(songId, this.ns, songData);
                ideService.setDataByTracks(ideService.songStore.data);
            }
        }
    }

    onMounted() {
        this.initData(false);
        this.setRightPanelContent();
        this.setPageContent();
    }

    setRightPanelContent() {
        // dyName('panel-right-content').innerHTML = `
        //   <p data-name="action-info">табы</p>
        //   <p data-name="action-drums">барабан</p>
        // `;

        dyName('panel-right-content').innerHTML = ``.trim();
    }

    getMetronomeContent(): string {
        let metronomeView = `&emsp;
            <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
            <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
            <a data-tick-trigger="3:4"><b>3:4</b></a>&emsp;
            <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
            <a data-action-type="stop"><b>stop</b></a>&emsp;
            <div 
                class="range-slider"
                data-name="slider"
                data-label="true"
                data-min="0"   
                data-max="200"
                data-step="1"
                data-value="100"
                data-scale="true"
                data-scale-steps="10"
                data-scale-sub-steps="5"
            ></div>
        `.trim();

        // if (this.pageData.hideMetronome) {
        //     metronomeView = '';
        // }

        return metronomeView;
    }

    getSongListContent(): string {
        let content = this.pageData.content;
        let songListContent = '';
        let commands = '';

        if (this.isMy) {
            songListContent = '';
            const songs = SongStore.GetSongs(this.ns);

            songs.forEach(song => {
                content += `<div class="row" style="margin: .5rem; align-items: center;">
                    <div style="font-size: 1rem;">
                        <span
                            style="font-weight: 400; user-select: none;"
                            data-song-id="${song.id}"
                            data-song-item="${song.id}"
                            data-song-name="${song.name}"                                                    
                        >${song.name}</span>
                    </div>
                    <div style="margin-right: 1rem;">
                        ${svg.editBtn(`
                            data-edit-song-action
                            data-song-id="${song.id}"
                        `, '', 24)}
                    </div>
                </div>`;
            });

            commands = `
            <div style="margin: .5rem; margin-top: 1rem;">
                ${svg.moveTopBtn('data-move-song-up-action', '', 24)}
                ${svg.moveDownBtn('data-move-song-up-action', '', 24)}
                ${svg.renameBtn('data-rename-song-action', '', 24)}                
                ${svg.plusBtn('data-add-song-action', '', 24)}
                ${svg.minusBtn('data-delete-song-action', '', 24)}
            </div>
        `.trim();
        }

        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">${this.getMetronomeContent()}</div>        
        `.trim();

        return `
            ${metronome}
            ${commands}
            ${songListContent}
            <div data-name="pageContent">${content}</div>
        `.trim();
    }

    getSongPageContent(): string {
        return `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                ${this.getMetronomeContent()}
            </div>

            <div
                data-tracks-content-wrapper
                style="
                    margin: 0;
                    padding: .5rem .5rem 1rem 1rem;                    
                    border-top: 1px solid gray;
                    border-bottom: 1px solid gray;"
            >
                ${this.getTrackListContent()}                
            </div>
                            
            ${this.getSongPartsContent()}
            
            <div data-name="pageContent">
                ${this.pageData.content}
            </div>
        `.trim();
    }

    setPageContent() {
        const wrapper = `
            <div
                class="page-content"
                data="page-content"
                style="padding-top: 0;
                padding-bottom: 2rem;"
            >%content%</div>
        `.trim();

        let content = '';

        if (this.view === 'list') {
            content = wrapper.replace('%content%', this.getSongListContent());
            this.el$.html(content);
            this.updateSongListView();
        }
        else {
            content = wrapper.replace('%content%', this.getSongPageContent());
            this.el$.html(content);
            this.updatePartListView();
        }

        this.bpmRange = (this.context.$f7 as any).range.create({
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    this.bpmValue = range.value;

                    if (this.playingTick) {
                        this.playTick(this.playingTick);
                    }
                },
            },
        });

        // SET BPM
        let bpmValue = this.bpmValue;

        if (this.view === 'song') {
            if (this.songId === ideService.currentEdit.songId) {
                bpmValue = this.bpmValue;
            } else {
                //bpmValue = (this.isMy ? this.pageData.bmpValue : this.outBlock?.bpm) || 90;
                bpmValue = ideService.songStore?.data?.bmpValue || 90;
            }
        }

        setTimeout(() => {
            this.subscribeEvents();
            this.bpmValue = bpmValue;
            this.bpmRange.setValue(this.bpmValue);

            this.updateView();
        }, 100);
    }

    getTrackListContent(): string {
        let trackStyle = `
            display: inline-block;
            padding: .15rem;
            margin-right: .5rem; margin-top: .5rem;
            font-size: .9rem; font-weight: 400;
            user-select: none; touch-action: none;
            border: 1px solid gray; border-radius: .3rem;
        `.trim();

        let content = '';

        let actions = `
            <div style="margin: 1rem 0 0 0;">
                ${svg.uncheckBtn('data-uncheck-all-tracks-action', 'black', 24)}
                ${svg.checkBtn('data-check-all-tracks-action', 'black', 24)}
                ${svg.plusBtn('data-add-track-action', '', 24)}
                ${svg.minusBtn('data-delete-track-action', '', 24)}
                ${svg.editBtn('data-edit-track-action', '', 24)}
                ${svg.soundBtn('data-edit-tracks-volume-action', '', 24)}${blankHalfRem}
                ${svg.copyPasteBtn('data-clone-track-action', '', 24)}                
            </div>
        `.trim();

        const tracks = ideService?.songStore?.data?.tracks || [];

        tracks.forEach(track => {
            const underline = track.isHardTrack ? 'text-decoration: underline;': '';

            content += `
                    <span style="${trackStyle} ${underline}" data-use-track-action="${track.name}">
                        ${track.name}:${track.volume}
                    </span>            
            `.trim();
        });

        content += actions;

        return content;
    }

    getSongPartsContent(): string {
        let allSongParts = this.allSongParts;

        const commandsWrapper = `
            <div style="margin: .5rem 1rem;">
                %content%
            </div>        
        `.trim();

        let fileCommands = `
            ${svg.downloadBtn('data-download-song-action', '', 24)}&emsp;        
            ${svg.playAndSaveBtn('data-play-and-download-ogg-action', '', 24)}&emsp;
        `.trim();

        let editCommands = '';
        if (this.isMy) {
            const addPartCommand = `${svg.plusBtn('data-add-part-action', '', 24)}`;

            editCommands = `
                <div style="margin-top: 1rem;">
                    ${svg.moveTopBtn('data-move-part-up-action', '', 24)}
                    ${svg.moveDownBtn('data-move-part-down-action', '', 24)}                    
                    ${svg.editBtn('data-edit-selected-parts-action', '', 24)}
                    ${addPartCommand}
                    ${svg.minusBtn('data-delete-part-action', '', 24)}
                    ${svg.renameBtn('data-rename-part-action', '', 24)}
                    ${svg.copyPasteBtn('data-clone-part-action', '', 24)}
                </div>            
            `.trim();

            if (!allSongParts.length) {
                editCommands = addPartCommand;
            }

            fileCommands += `
                ${svg.uploadBtn('data-upload-song-action', '', 24)}&nbsp;              
                <input style="display: none;" type="file" data-upload-song-input multiple />                                
            `.trim();
        } else {
            editCommands = `
                <div style="margin-top: 1rem;">
                    ${svg.editBtn('data-edit-selected-parts-action', '', 24)}
                </div>            
            `.trim();
        }

        fileCommands += `
                ${svg.saveBtn('data-save-song-action', '', 24)}&nbsp;
        `.trim();

        fileCommands = `<div style="margin: 1rem;">
            ${fileCommands}
        </div>`.trim();

        let allCommands = `
            <div>
                ${svg.uncheckBtn('data-unselect-all-parts-action', '', 24)}
                ${svg.checkBtn('data-select-all-parts-action', '', 24)}
                ${svg.stopBtn('data-action-type="stop"', '', 24)}
                ${svg.playBtn('data-play-all-action', '', 24)}
                ${svg.playLoopBtn('data-loop-all-action', '', 24)}
            </div>
            ${editCommands}
        `.trim();

        allCommands = commandsWrapper.replace('%content%', allCommands);

        let tracks = allSongParts.reduce((acc, item, i) => {
            const info = un.getPartInfo(item);

            acc = acc + `
                <div class="row" style="margin: .5rem; align-items: center;">
                    <span
                        style="font-weight: 700; font-size: 1rem; user-select: none;"
                        data-part-nio="${i+1}"
                        data-part-item="${info.ref}"                        
                    >${info.partNio}&nbsp;&nbsp;${info.ref}</span>
                    <div style="margin-right: 1rem;">   
                        ${svg.editBtn(`
                            data-edit-part-action                        
                            data-part-nio="${i+1}"
                            data-part-id="${info.partId}"                                                        
                        `, '', 24)}
                    </div>                    
                </div>
            `.trim();

                return acc;
            }, '');

        return allCommands + tracks  + (allSongParts.length > 5 ? allCommands : '') + fileCommands;
    }

    playTick(name?: string) {
        name = name || '';
        this.playingTick = name;

        ideService.metronome.stopAndClearMidiPlayer();

        const tick = ticks[this.playingTick];

        if (!tick) {
            this.playingTick = '';

            return;
        }

        const blocks = `
        <out r1000000>
        tick

        ${tick}
        `;

        ideService.metronome.tryPlayMidiBlock({
            blocks,
            bpm: this.bpmValue,
        });
    }

    subscribeEvents() {
        this.subscribePageEvents();
        this.subscribeMetronomeEvents();
        this.subscribeSongsAndPartsActions();
        this.subTracksEvents();
    }

    getSelectedTracks(): string[] {
        const result = [];

        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            let trackName = el.dataset.useTrackAction
            let track = ideService.songStore.data.tracks.find(track => track.name === trackName);

            if (track && !track?.isExcluded) {
                result.push(track.name);
            }
        });

        return result;
    }

    subTracksEvents() {
        getWithDataAttr('add-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.addTrack());
        });

        getWithDataAttr('edit-tracks-volume-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.editTracksVolume());
        });

        getWithDataAttr('edit-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                const tracks = this.getSelectedTracks();

                if (tracks.length > 1) return;

                this.editTrack(tracks[0]);
            });
        });

        getWithDataAttr('delete-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                const tracks = this.getSelectedTracks();

                if (tracks.length > 1) return;

                const track = ideService.songStore.data.tracks.find(track => track.name === tracks[0]);

                if (!track || track.isHardTrack) return;

                this.confirm = (this.context.$f7 as any).dialog.confirm(
                   track.name,
                   'Удалить трэк?',
                    () => {
                        if (SongStore.DeleteTrack(ideService.songStore.data, track.name)) {
                            this.renderTracksView();
                            ideService.songStore.save();
                        }
                    },
                    () => {}, // cancel
                );

                this.confirm.open();
            });
        });

        getWithDataAttr('uncheck-all-tracks-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
                    ideService.songStore.data.tracks.forEach(track => {
                        track.isExcluded = true;
                    });
                });

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            })
        });

        getWithDataAttr('check-all-tracks-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
                    ideService.songStore.data.tracks.forEach(track => {
                        track.isExcluded = false;
                    });
                });

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            })
        });

        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                const trackName = el.dataset.useTrackAction;
                const track = ideService.songStore.data.tracks.find(track => track.name === trackName);

                if (!track) return;

                track.isExcluded = !track.isExcluded;

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            });
        });

        getWithDataAttr('clone-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.cloneTrack());
        });
    }

    update_TracksView() {
        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            const trackName = el.dataset.useTrackAction;
            const track = ideService.songStore.data.tracks.find(track => track.name === trackName);

            el.style.backgroundColor = track?.isExcluded ? 'white' : 'lightgray';
        });
    }

    renderTracksView() {
        const content = this.getTrackListContent();

        getWithDataAttr('tracks-content-wrapper', this.pageEl).forEach((el) => {
            el.innerHTML = content;
        });

        this.subTracksEvents();
        this.update_TracksView();
    }

    gotoEditSong(songId?: string) {
        songId = (songId || '').trim();

        if(!songId) return;

        this.context.$f7router.navigate(`/mbox/${songId}/`);
    }

    getSelectedParts(): string[] {
        const parts =  this.allSongParts
            .filter((nio, i) => !this.excludePartNio.includes(i + 1));

        return parts;
    }

    getSelectedPartsNio(): number[] {
        return this.allSongParts
            .map((item, i) => (i+1))
            .filter(nio => !this.excludePartNio.includes(nio));
    }

    gotoEditPart(pPartNio?: number | string) {
        let partNio = parseInteger(pPartNio, null);
        let editPartsNio: number[] = [];
        const isMy = this.isMy;

        if (partNio) {
            editPartsNio = [partNio];
        } else {
            editPartsNio = this.getSelectedPartsNio();
        }

        if (!editPartsNio.length) return;

        ideService.setDataByTracks(ideService.songStore.data);
        ideService.editedItems = [];

        ideService.currentEdit.songId = this.songId;
        ideService.currentEdit.allSongParts = this.allSongParts;
        ideService.currentEdit.blocks = this.blocks;
        ideService.currentEdit.editPartsNio = editPartsNio;
        ideService.currentEdit.source = this.pageData.source;
        ideService.currentEdit.freezeStructure = !isMy;
        ideService.currentEdit.settings = this.settings;
        ideService.currentEdit.ns = isMy ? MY_SONG : this.pageData.ns || '';
        ideService.currentEdit.useLineModel = isMy || this.pageData.exportToLineModel || false;

        //console.log('currentEdit', ideService.currentEdit);

        this.context.$f7router.navigate('/page/page_keyboard/');
    }

    subscribeSongsAndPartsActions() {
        // SONG ACTIONS
        getWithDataAttr('delete-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.deleteSong(this.selectedSong));
        });

        getWithDataAttr('edit-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditSong(el.dataset.songId));
        });

        getWithDataAttr('rename-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.renameSong(this.selectedSong));
        });

        getWithDataAttr('move-song-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.moveSong(this.selectedSong, -1));
        });

        getWithDataAttr('move-song-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.moveSong(this.selectedSong, 1));
        });

        getWithDataAttr('song-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectSong(el.dataset.songId, el.dataset.songName));
        });

        // PART ACTIONS
        getWithDataAttr('part-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectPart(el.dataset.partNio));
        });

        getWithDataAttr('edit-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditPart(el.dataset.partNio));
        });

        getWithDataAttr('delete-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.deletePart());
        });

        getWithDataAttr('rename-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.renamePart());
        });

        getWithDataAttr('clone-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.clonePart());
        });

        getWithDataAttr('move-part-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.movePart(-1));
        });

        getWithDataAttr('move-part-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.movePart(1));
        });

        getWithDataAttr('download-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.downloadFile());
        });

        getWithDataAttr('play-and-download-ogg-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.playAll(1, true));
        });

        getWithDataAttr('upload-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.uploadFileClick());
        });

        getWithDataAttr('save-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.saveSong());
        });

        getWithDataAttr('upload-song-input', this.pageEl).forEach((el) => {
            el.addEventListener('change', (evt) => this.uploadFile(evt));
        });
    }

    getOneSelectedPartNio(parts?: string[]): number {
        const allSongParts = Array.isArray(parts) ? parts : this.allSongParts;

        if ((allSongParts.length - this.excludePartNio.length) !== 1 ){
            return 0;
        } else {
            for (let i = 0; i < allSongParts.length; i++) {
                if (!this.excludePartNio.includes(i+1)) {
                    return i+1;
                }
            }
        }

        return 0;
    }

    getOneSelectedPartInfo(parts?: string[]): SongPartInfo {
        parts = Array.isArray(parts) ? parts: this.allSongParts;
        const partNio = this.getOneSelectedPartNio(parts);

        if (!partNio) return null;

        return un.getPartInfo(parts[partNio - 1]);
    }

    selectAllParts() {
        this.excludePartNio = [];
        this.updatePartListView();
    }

    unselectAllParts() {
        const allSongParts = this.allSongParts;

        this.excludePartNio = allSongParts.map((item, i) => i+1);
        this.updatePartListView();
    }

    selectPart(partNio: number | string) {
        partNio = parseInteger(partNio, null);

        if (!partNio) return;

        if (this.excludePartNio.includes(partNio)) {
            this.excludePartNio = this.excludePartNio.filter(item => item !== partNio );
        }
        else {
            this.excludePartNio.push(partNio);
        }

        this.updatePartListView();
    }

    movePart(offset: number) {
        const songStore = ideService.songStore;

        if (!songStore) return;

        const part = this.getOneSelectedPartInfo();

        if (!part) return;

        const isChanged = SongStore.MovePart(songStore.data, part.partId, offset);

        if (isChanged) {
            const allSongParts = this.allSongParts;
            this.excludePartNio = [];

            allSongParts.forEach((item, i) => {
                if (un.getPartInfo(item).partId !== part.partId) {
                    this.excludePartNio.push(i + 1);
                }
            });

            this.setPageContent();
            ideService.songStore.save();
        }
    }

    updateView() {
        this.update_TracksView();
        this.updatePartListView();
        this.updateSongListView();
    }

    updatePartListView() {
        getWithDataAttr('part-item', this.pageEl).forEach(el => {
            const partNio = parseInteger(el.dataset.partNio, 0);

            if (this.excludePartNio.includes(partNio)) {
                el.style.fontWeight = '400';
            } else {
                el.style.fontWeight = '700';
            }
        });
    }

    updateSongListView() {
        getWithDataAttr('song-item', this.pageEl).forEach(el => {
           el.style.fontWeight = '400';
           if (el.dataset.songId === this.selectedSong) {
               el.style.fontWeight = '700';
           }
        });
    }

    selectSong(songId: string, songName = '') {
        this.selectedSongName = songName;
        this.selectedSong = this.selectedSong === songId ? '' : songId;
        this.updateSongListView();
    }

    moveSong(songId: string, offset: number) {
        SongStore.MoveSong(songId, offset, this.ns);
        this.setPageContent();
    }

    editTracksVolume() {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();

                //console.log(ideService.songStore.data);
            }
        }

        new TracksVolumeDialog(this.context).openTrackDialog(cb);
    }

    editTrack(trackName: string) {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();
            }
        }

        new TrackDetailsDialog(this.context).openTrackDialog(
            ideService.songStore?.data,
            trackName,
            cb
        );
    }

    addTrack() {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();
            }
        }

        new TrackDetailsDialog(this.context).openTrackDialog(
            ideService.songStore.data,
            '',
            cb
        );
    }

    renameSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        this.prompt = (this.context.$f7 as any).dialog.prompt(
            'Название',
            'Наименование',
            (newName: string) => {
                SongStore.RenameSong(songId, newName.trim(), this.ns);
                this.setPageContent();
            },
            () => {},
            this.selectedSongName,
        );

        this.prompt.open();
    }

    deleteSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        this.confirm = (this.context.$f7 as any).dialog.confirm(
            '',
            'Удалить?',
            () => {
                SongStore.DeleteSong(songId, this.ns);
                this.setPageContent();
            },
            () => {}, // cancel
        );

        this.confirm.open();
    }

    clonePart() {
        const song = ideService.songStore?.data;
        const part = this.getOneSelectedPartInfo();

        if (!song || !part) return;

        const newPart = SongStore.ClonePart(song, part.partId);

        this.setPageContent();
        ideService.songStore.save();
    }

    cloneTrack() {
        const selectedTracks = this.getSelectedTracks();

        if (selectedTracks.length > 1) return;

        const trackName = selectedTracks[0];
        const song = ideService.songStore?.data;

        if (!song || !trackName) return;

        if (SongStore.CloneAndAddTrack(song, trackName)) {
            sortTracks(ideService.songStore.data.tracks);
            this.setPageContent();
            ideService.songStore.save();
        }
    }

    renamePart() {
        const songId = (this.songId || '').trim();
        const part = this.getOneSelectedPartInfo();

        if (!songId || !part) return;

        this.prompt = (this.context.$f7 as any).dialog.prompt(
            'Название только буквами, цифрами, знаками - или _ (без пробелов)',
            'Наименование',
            (newName: string) => {
                SongStore.RenamePart(ideService.songStore.data, part.partId, newName.trim());
                this.setPageContent();
                ideService.songStore.save();
            },
            () => {},
            part.name,
        );

        this.prompt.open();
    }

    deletePart() {
        const part = this.getOneSelectedPartInfo();

        if (!part) return;

        const partId = part.partId;

        // https://framework7.io/docs/dialog
        // app.dialog.confirm(text, title, callbackOk, callbackCancel)- create Confirm Dialog and open it
        this.confirm = (this.context.$f7 as any).dialog.confirm(
            '',
            'Удалить?',
            () => {

                if (SongStore.DeletePart(ideService.songStore.data, partId)) {
                    this.setPageContent();
                    ideService.songStore.save();
                }
            },
            () => {}, // cancel
        );

        this.confirm.open();
    }

    dialog: Dialog.Dialog;
    prompt: Dialog.Dialog;
    confirm: Dialog.Dialog;

    addSong(name: string) {
        const song = SongStore.AddSongToList(name, this.ns);
        this.setPageContent();
    }

    addPart(name: string) {
        if (SongStore.AddPartToSong(ideService.songStore.data, name)) {
            this.setPageContent();
            ideService.songStore.save();
        }
    }

    subscribePageEvents() {
        getWithDataAttr('add-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.prompt = (this.context.$f7 as any).dialog.prompt(
                    'Название только буквами, цифрами, знаками - или _ (без пробелов)',
                    'Наименование',
                    (name) => this.addPart(name),
                    () => {}, // cancel
                    ''
                );

                this.prompt.open();
            });
        });

        getWithDataAttr('add-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.prompt = (this.context.$f7 as any).dialog.prompt(
                    'Название только буквами, цифрами, знаками - или _ (без пробелов)',
                    'Наименование',
                    (name) => this.addSong(name),
                    () => {}, // cancel
                    ''
                );

                this.prompt.open();
            });
        });

        getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.tryPlayTextLine({
                    text: el?.dataset?.noteLine,
                });
            });
        });

        getWithDataAttrValue('action-type', 'stop', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.stop());
        });

        getWithDataAttr('play-all-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.playAll());
        });

        getWithDataAttr('loop-all-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.playAll(100));
        });

        getWithDataAttr('select-all-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectAllParts());
        });

        getWithDataAttr('unselect-all-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.unselectAllParts());
        });

        getWithDataAttr('edit-selected-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditPart());
        });
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.playTick(el?.dataset?.tickTrigger);
            });
        });

        getWithDataAttr('set-bmp-action', this.pageEl)?.forEach(
            (el: HTMLElement) => {
                el.addEventListener('pointerdown', () => {
                    this.bpmRange.setValue(parseInt(el?.dataset?.bpm, 10) || 100);
                    this.playTick(this.playingTick);
                });
            }
        );
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return ideService.multiPlayer.tryPlayTextLine({ text, repeat });
    }

    buildBlocksForMySong(blocks: TextBlock[]): TextBlock[] {
        //console.log('buildBlocksForMySong.blocks', blocks);

        blocks = []; // jjkl

        const song = ideService.songStore.clone();
        const hash = {};
        const list: {id: string, rows: StoredRow[][]}[] = [];
        const selectedParts = this.getSelectedParts();

        selectedParts.forEach(partStr => {
            const part = un.getPartInfo(partStr);
            const partRows = song.dynamic.filter(row => {
                const iPartId = (row.partId || '').trim();
                const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);

                if (part.partId && iPartId) {
                    return part.partId === iPartId;
                }

                return part.partNio === iPartNio;
            });

            partRows.sort((a, b) => {
                const iRowNioA = un.parseInteger(a.rowInPartId.split('-')[1], 0);
                const iRowNioB = un.parseInteger(b.rowInPartId.split('-')[1], 0);

                if (iRowNioA < iRowNioB) return -1;
                if (iRowNioA > iRowNioB) return 1;

                return 0;
            });

            partRows.forEach(row => {
                const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);
                const iRowNio = un.parseInteger(row.rowInPartId.split('-')[1], 0);

                if (!hash[iPartNio]) {
                    hash[iPartNio] = {
                        id: part.partId,
                        rows: [],
                    };
                    list.push(hash[iPartNio]);
                }

                if (!hash[iPartNio][iRowNio]) {
                    hash[iPartNio][iRowNio] = [];
                    hash[iPartNio].rows.push(hash[iPartNio][iRowNio]);
                }

                hash[iPartNio][iRowNio].push(row);
            });

        });

        let topOutBlocks: string[][] = [];

        list.forEach(part => {
            let partSetRows: string[] = [`<${part.id} set>`];

            part.rows.forEach(row => {
                let maxDurQ = 0;
                let targetDurQ = 0;
                let headGuid = `head_${ideService.guid.toString()}`;
                let rowRefs: string[] = [headGuid];

                row.forEach(item => {
                    const guid = `temp_${ideService.guid.toString()}`;
                    const durQ = LineModel.GetDurationQByLines(item.lines);

                    let notes = this.getNotes(guid, item);

                    if(!notes) {
                        notes = `<${guid} $>\n$organ: ${durQ}`;
                    }

                    const block = un.getTextBlocks(notes)[0];

                    blocks = [...blocks, block];

                    maxDurQ = durQ > maxDurQ ? durQ: maxDurQ;

                    rowRefs.push(guid);
                });

                const headBlock = un.getTextBlocks(`<${headGuid} $>\n$organ: ${maxDurQ}`)[0];

                blocks = [...blocks, headBlock];

                partSetRows.push(rowRefs.join(' '));
            });

            topOutBlocks.push(partSetRows);
        });

        topOutBlocks.forEach(part => {
            const partBlock = un.getTextBlocks(part.join('\n'))[0];
            blocks = [...blocks, partBlock];
        });

        return blocks;
    }

    getNotes(id: string, item: StoredRow): string {
        item.lines.forEach(line => {
            line.blockOffsetQ = 0;
        });

        if (item.type === 'drums' || item.track.startsWith(un.drumChar)) {
            const trackName = item.track || un.drumsTrack;

            return LineModel.GetDrumNotes(id, trackName, item.lines);
        }

        return LineModel.GetToneNotes({
            blockName: id,
            rows: item.lines,
            instrName: '$organ',
            track: item.track || '$unknown',
        });
    }

    textModelToLineModel(songId: string, songNodeInput: SongNode): SongNode {
        const song  = textModelToLineModel({
            songId,
            ns: songNodeInput.ns,
            settings: ideService.settings,
            blocks: ideService.blocks,
            songNodeInput: songNodeInput,
        });

        SongStore.SetSong(songId, song, songNodeInput.ns);

        return song;
    }

    playAll(repeatCount = 1, saveWav = false) {
        this.stop();

        let currRowInfo: RowInfo = { first: 0, last: 0}; // индекс в текущем блоке
        let blocks = this.useLineModel ? this.buildBlocksForMySong(this.blocks) : [...this.blocks];

        const x = {
            blocks,
            currBlock: null as un.TextBlock,
            currRowInfo: currRowInfo,
            excludeIndex: this.excludePartNio,
            midiBlockOut: null as un.TextBlock,
            playBlockOut: '' as string | un.TextBlock,
            topBlocksOut: [],
        };

        if (this.useLineModel) {
            const rows = this.getSelectedParts().map(row => `> ${row}`);

            x.excludeIndex = []; // либо надо билдить ВСЕ части
            x.currBlock = un.createOutBlock({
                id: 'out',
                type: 'text',
                bpm: this.bpmValue,
                rows,
                volume: ideService.outVolume,
            });
        } else {
            x.currBlock = x.blocks.find((item) => item.id === 'out');
        }

        //console.log('BLOCK', blocks);

        getMidiConfig(x);

        const playBlock = x.playBlockOut as TextBlock;

        //console.log('getMidiConfig', x);

        blocks = [...x.blocks];

        // DYNAMIC
        // if (!this.useLineModel && this.pageData.dynamic?.['@drums']) {
        //     const map = this.pageData.dynamic?.['@drums'];
        //
        //     playBlock.rows.forEach((row, i) => {
        //         let rowInPartId = un.getPartInfo(row).rowInPartId;
        //
        //         if (!rowInPartId || !map[rowInPartId] || !map[rowInPartId].items && !map[rowInPartId].items.length) {
        //             return;
        //         }
        //
        //         let rows = map[rowInPartId].items[0].rows;
        //
        //         if (Array.isArray(rows)) {
        //              rows = LineModel.CloneLines(rows);
        //              rows.forEach(row => (row.blockOffsetQ = 0));
        //         } else {
        //             return;
        //         }
        //
        //         const notes = LineModel.GetDrumNotes('temp' + ideService.guid.toString(), rows);
        //
        //         if (notes) {
        //             const block = un.getTextBlocks(notes)[0];
        //             blocks = [...blocks, block];
        //             playBlock.rows[i] = playBlock.rows[i] + ' ' + block.id;
        //         }
        //     });
        // }

        //console.log('getDataByTrack', this.getDataByTracks());
        //console.log('IDE_SERVICE', ideService);

        if (x.playBlockOut) {
            ideService.multiPlayer.tryPlayMidiBlock({
                blocks,
                playBlock,
                cb: (type: string, data: any) => {
                    //if (type === 'break' || type === 'finish') {
                    if (type === 'finish') {
                        if (this.recorder) {
                            this.recorder.stopAndSave();
                            this.recorder = null;
                        }
                        // this.playingWithMidi = false;
                    }
                    //console.log(type, data);
                },
                excludeLines: this.settings.exclude,
                dataByTracks: ideService.dataByTracks,
                //pitchShift: getPitchShiftSetting(this.settings),
                bpm: this.bpmValue,
                repeatCount,
                //beatsWithOffsetMs: un.getBeatsByBpmWithOffset(90, 8),
            });

            if (saveWav) {
                if (this.recorder) {
                    this.recorder.break();
                    this.recorder = null;
                }

                this.recorder = new WavRecorder(m.classes.Sound.ctx);
                this.recorder.start(this.songId);
            }

            return;
        }

        ideService.multiPlayer.stopAndClearMidiPlayer();
    }

    stop() {
        ideService.multiPlayer.stopAndClearMidiPlayer();
        if (this.recorder) {
            this.recorder.break();
            this.recorder = null;
        }
    }

    async play(text: string, repeatCount?: number) {
        ideService.multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }

    replaceSong(val: string) {
        val = (val || '').trim();

        if (!val) return null;

        let songNode: SongNode;

        songNode = JSON.parse(val) as SongNode;
        //songNode = SongStore.Transform(val);

        SongStore.SetSong(this.songId, songNode, this.ns);

        this.initData(true);
        this.setPageContent();
    }

    uploadFile(evt: Event) {
        const fileList = evt.target['files'];

        const loadText = async (file: File) => {
            const reader = new FileReader();
            // reader.readAsDataURL(file);
            reader.readAsText(file);

            reader.addEventListener('load', async (event) => {
                //console.log('ON LOAD TEXT 1', event);

                const result = event.target.result as string;

                this.replaceSong(result);
            });
        }

        if (fileList[0]) {
            loadText(fileList[0]);
        }
    }

    uploadFileClick() {
        getWithDataAttr('upload-song-input', this.pageEl).forEach((el) => {
            el.click();
        });
    }

    saveSong() { // save-song-action
        const songStore = ideService.songStore;

        if (!songStore) return;

        songStore.data.bmpValue = this.bpmValue

        songStore.save();
    }

//     const cb = (ok: boolean) => {
//         if (ok) {
//             this.renderTracksView();
//             ideService.songStore.save();
//         }
//     }
//
//     new TrackDetailsDialog(this.context).openTrackDialog(
//         ideService.songStore.data,
//     '',
//     cb
// );

    async choiceTracks(): Promise<any> {
        const songStore = ideService.songStore;

        if (!songStore) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            const dlg = new GetTrackDialog(this.context);

            dlg.openTrackDialog(songStore.data, (tracks) => {
                resolve(tracks || []);
            })
        });
    }

    async downloadFile() {
        const tracks: string[] = await this.choiceTracks();

        if (!tracks.length) return;

        // https://webtips.dev/download-any-file-with-javascript
        let songId = this.songId;

        if (!songId) return;

        let song = ideService?.songStore?.data!;

        if (!song) return;

        song = JSON.parse(JSON.stringify(song));
        song.tracks = song.tracks.filter(track => tracks.includes(track.name));
        song.dynamic = song.dynamic.filter(item => tracks.includes(item.track));

        let data = JSON.stringify(song, null, 2);
        //let type = 'application/json';
        let type = 'application/text';
        let name = `${songId}.txt`;

        //console.log('songNode', songNode);

        function downloadURI(uri, name) {
            let link = document.createElement("a");
            link.download = name;
            link.href = uri;
            link.click();
        }

        function downloader(data, type, name) {
            let blob = new Blob([data], {type});
            let url = (window as any).URL.createObjectURL(blob);
            downloadURI(url, name);
            (window as any).URL.revokeObjectURL(url);
        }

        downloader(data, type, name)
    }
}

// action-type:
// add-song  add-part
// stop

// SONGS:
// move-song-up-action move-song-down-action rename-song-action add-song-action delete-song-action

// PARTS:
// unselect-all-parts-action select-all-parts-action edit-selected-parts-action add-part-action
// move-part-up-action move-part-down-action rename-part-action clone-part-action delete-part-action

// PLAY: playAll

// SAVE: save-song-action
