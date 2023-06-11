import {drumInfo} from '../muse/drums';

interface Page {
    getMetronomeContent(): string;
}

// const drumsMap = {
//     O: {
//         instr: 'drum_35',
//         note: 'bd',
//
//     },
//     V: {
//         note: 'sn',
//         instr: 'drum_40',
//     },
//     X: {
//         note: 'hc',
//         instr: 'drum_42',
//     },
// }

export class DrumCtrl {
    constructor(public page: Page) {}

    getContent(keyboardId: string): string {
        const topRowHeight = 5;
        const midRowHeight = 10;
        const botRowHeight = 5;
        let ind = 0;

        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                &emsp;${this.page.getMetronomeContent()}
            </div>`.trim();

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');


        // <pre style="font-family: monospace; font-size: 1.6rem; margin: 0; padding: 0; padding-left: 0;">
        //     QoxoAoq_
        // X_qoA_xv
        // Q_q_Aoxo
        // X_x_A_xv</pre>

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem; position: relative;">
                ${metronome}
                
                <div style="display: flex; user-select: none; touch-action: none;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightcyan; user-select: none; touch-action: none;"
                                data-action-drum="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >
                                <br/>&nbsp;K-k
                            </div>
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightyellow; user-select: none; touch-action: none;"
                                data-action-drum="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >
                                <br/>&nbsp;T-t
                            </div>
                        </div>                        
                        
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                            >         
                                <br/>&nbsp;?
                            </div>
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="bd+hc"                                                                
                            >  
                                <br/>&nbsp;X-x
                            </div>   
                        </div>
                                                 
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="sn+hc"                                
                            >       
                                <br/>&nbsp;X-x
                            </div>
                            
                        
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                            >     
                                <br/>&nbsp;?
                            </div>   
                        </div>                        
                        
                        <div
                            style="width: 100%; height: ${botRowHeight}rem; background-color: tan; user-select: none; touch-action: none;"
                            data-action-drum="bd"  
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="bd+hc"                                          
                        >
                            &nbsp;O-o
                        </div>                    
                    </div>

                    <div style="width: 33%; user-select: none; touch-action: none;">
                        <div
                            style="height: ${midRowHeight}rem; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
                            data-action-drum="sn"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="sn+hc"                                                        
                        >
                            &nbsp;V-v
                        </div>
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"
                                data-action-drum="sn+hc"
                                data-keyboard-id="${keyboardId}-${ind++}"                            
                        >
                            <br/>&nbsp;A-a
                        </div>                        
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"
                                data-action-drum="bd+hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                        >
                            <br/>&nbsp;Q-q
                        </div>
                    </div>                    
                </div>

                <div style="margin: .5rem; user-select: none; touch-action: none;">
                    <span style="font-size: 1.5rem; user-select: none; touch-action: none;" data-action="clear">
                        clr&nbsp;&nbsp;
                    </span>                
                </div>
                
                
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
O-k-T-k-O---O-kt
O-k-T-k-O---B---
O-ktK-v-O---O---
O-k-|-k-O-k-V---
O---|-k-O---B---
O---T-k-O---A---
O---T-k-O---O---</pre>                                                        
                </div>

                
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
QoxoAoq_X_qoA_xv
Q_q_AoxoX_x_A_xv</pre>                                                        
                </div>
                                    
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
Q_q_Aoq_X_q_A_xv
Q_q_AoxoX_qoA_xv</pre>
                </div>
                
            <div style="font-size: 1.5rem;">
                ${drums}            
            </div>
                
            </div>`.trim();

        return content;
    }
}
