function getKeyStep(
  step: string,
  symbol: string,
  withBorder: string = '',
  bgColor: string = 'white'
): string {
  // let step = note[0];

  //let fontW = ['m', 'f', 'v', 's'].find((item) => item === step) ? 800 : 400;
  // let borderNone = ['d', 'z', 'n', 'b'].find((item) => item === step)
  //   ? 'border: none;'
  //   : '';
  let fontColor = 'black';

  // if (note[1] === 'u') {
  //   borderNone = 'border: none;';
  //   // fontColor = 'lightgray';
  // }

  //let border = borderNone || 'border: 1px solid grey;';
  let border = 'border: 1px solid grey;';
  let borderSide = '';

  if (withBorder.includes('t')) {
    borderSide += 'border-top: 3px solid black;';
  }

  if (withBorder.includes('r')) {
    borderSide += 'border-right: 3px solid black;';
  }

  if (withBorder.includes('b')) {
    borderSide += 'border-bottom: 3px solid black;';
  }

  if (withBorder.includes('l')) {
    borderSide += 'border-left: 3px solid black;';
  }

  let fontWeight = 400;

  return `<div
    style="
      box-sizing: border-box;    
      margin: 0;
      padding: 0;
      display: inline-block;
      font-size: 1.3rem;
      width: 2.3rem;
      height: 2.3rem;
      user-select: none;
      text-align: center;
      ${border}
      ${borderSide}
      color: ${fontColor};
      background-color: ${bgColor};
      font-weight: ${fontWeight};" 
      data-name="note-step:${step}"
      data-relative-key="${step}"
      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

function getKey(note: string, symbol: string, duration: number = 25): string {
  let step = note[0];

  let fontW = ['m', 'f', 'v', 's'].find((item) => item === step) ? 800 : 400;
  let borderNone = ['d', 'z', 'n', 'b'].find((item) => item === step)
    ? 'border: none;'
    : '';
  let fontColor = 'black';

  if (note[1] === 'u') {
    borderNone = 'border: none;';
    // fontColor = 'lightgray';
  }

  let border = borderNone || 'border: 1px solid grey;';

  return `<div
    style="
      box-sizing: border-box;    
      margin: 0;
      padding: 0;
      display: inline-block;
      font-size: 1.5rem;
      width: 1.5rem;
      user-select: none;
      text-align: center;
      ${border}
      color: ${fontColor};
      font-weight: ${fontW};" 

      data-note-key="b60 ${note}-${duration}"
      data-name="note-val-${note}"
      data-note-lat="${note}"

      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

//    margin: 0; display: inline-block; width: .9rem; text-align: center;
//    border: 1px solid lightgrey; border-right: none;

function getKeyboard2(): string {
  return `

<div data-relative-key="0" style="font-size: 1.5rem; user-select: none;">
???????????????????? 
????8?????????????????? 
???????????????? 
???????????????????????? 
???????????????????? 
????????7?????? 
???????????????? 
???????????????????? 
???????????????????? 
????9?????????????????????? 
???????????????? 
???????????? 
</div>

<div
  style="display: flex; flex-direction: column; align-items: center; user-select: none;"
  data-name="relative-keyboard-wrapper"
  data-relative-keyboard-base="do"
>

<div style="user-select: none;">
${getKeyStep('-04', '????', 'tl')}
${getKeyStep('-03', '????', 't')}
${getKeyStep('-02', '????', 'trb')}
${getKeyStep('-01', '????', 'tr')}
${getKeyStep('01', '????', 'lt')}
${getKeyStep('02', '????', 'ltb')}
${getKeyStep('03', '????', 't')}
${getKeyStep('04', '????', 'tr')}
</div>

<div style="user-select: none;">
${getKeyStep('-08', '8y', 'l')}
${getKeyStep('-07', '7y', 'rb')}
${getKeyStep('-06', '????', '')}
${getKeyStep('-05', '????', 'r')}
${getKeyStep('05', '????', 'l')}
${getKeyStep('06', '????', '')}
${getKeyStep('07', '7??', 'lb')}
${getKeyStep('08', '8??', 'r')}
</div>

<div style="user-select: none;">
${getKeyStep('-12', '??', 'rbl')}
${getKeyStep('-11', '????', 'b')}
${getKeyStep('-10', '????', 'b')}
${getKeyStep('-09', '9??', 'rb')}
${getKeyStep('09', '9??', 'lb')}
${getKeyStep('10', '????', 'b')}
${getKeyStep('11', '????', 'b')}
${getKeyStep('12', '??', 'lbr')}
</div>

<div style="user-select: none;">
${getKeyStep('-16', '16', 'tlr')}
${getKeyStep('-15', '15', 'tb')}
${getKeyStep('-14', '14', 't')}
${getKeyStep('-13', '13', 'tr')}
${getKeyStep('13', '13', 'lt')}
${getKeyStep('14', '14', 't')}
${getKeyStep('15', '15', 'tb')}
${getKeyStep('16', '16', 'trl')}
</div>

<div style="user-select: none;">
${getKeyStep('-20', '20', 'l')}
${getKeyStep('-19', '19', 'r')}
${getKeyStep('-18', '18', 'b')}
${getKeyStep('-17', '17', 'r')}
${getKeyStep('17', '17', 'l')}
${getKeyStep('18', '18', 'b')}
${getKeyStep('19', '19', 'l')}
${getKeyStep('20', '20', 'r')}
</div>

<div style="user-select: none;">
${getKeyStep('-24', '24', 'lb')}
${getKeyStep('-23', '23', 'b')}
${getKeyStep('-22', '22', 'b')}
${getKeyStep('-21', '21', 'rbl')}
${getKeyStep('21', '21', 'lbr')}
${getKeyStep('22', '22', 'b')}
${getKeyStep('23', '23', 'b')}
${getKeyStep('24', '24', 'br')}
</div>

</div>


`.replace(/\n/g, '');

  // <div
  //   style="
  //     display: flex; flex-direction: column; align-items: center; user-select: none;
  //     font-family: monospace;
  //   "
  //   data-name="relative-keyboard-wrapper"
  //   data-relative-keyboard-base=""
  // >
  // <div style="user-select: none;">
  // <span data-set-note data-name="set-note-de" style="user-select: none; margin-right: .5rem;">de</span>
  // <span data-set-note data-name="set-note-te" style="user-select: none; margin-right: .5rem;">te</span>
  // <span data-set-note data-name="set-note-re" style="user-select: none; margin-right: .5rem;">re</span>
  // <span data-set-note data-name="set-note-ne" style="user-select: none; margin-right: .5rem;">ne</span>
  // <span data-set-note data-name="set-note-me" style="user-select: none; margin-right: .5rem;">me</span>
  // <span data-set-note data-name="set-note-fe" style="user-select: none; margin-right: .5rem;">fe</span>
  // <span data-set-note data-name="set-note-ve" style="user-select: none; margin-right: .5rem;">ve</span>
  // <span data-set-note data-name="set-note-se" style="user-select: none; margin-right: .5rem;">se</span>
  // <span data-set-note data-name="set-note-ze" style="user-select: none; margin-right: .5rem;">ze</span>
  // <span data-set-note data-name="set-note-le" style="user-select: none; margin-right: .5rem;">le</span>
  // <span data-set-note data-name="set-note-ke" style="user-select: none; margin-right: .5rem;">ke</span>
  // <span data-set-note data-name="set-note-be" style="user-select: none; margin-right: .5rem;">be</span>
  // </div>

  // <div style="user-select: none;">
  // <span data-set-note data-name="set-note-da" style="user-select: none; margin-right: .5rem;">da</span>
  // <span data-set-note data-name="set-note-ta" style="user-select: none; margin-right: .5rem;">ta</span>
  // <span data-set-note data-name="set-note-ra" style="user-select: none; margin-right: .5rem;">ra</span>
  // <span data-set-note data-name="set-note-na" style="user-select: none; margin-right: .5rem;">na</span>
  // <span data-set-note data-name="set-note-ma" style="user-select: none; margin-right: .5rem;">ma</span>
  // <span data-set-note data-name="set-note-fa" style="user-select: none; margin-right: .5rem;">fa</span>
  // <span data-set-note data-name="set-note-va" style="user-select: none; margin-right: .5rem;">va</span>
  // <span data-set-note data-name="set-note-sa" style="user-select: none; margin-right: .5rem;">sa</span>
  // <span data-set-note data-name="set-note-za" style="user-select: none; margin-right: .5rem;">za</span>
  // <span data-set-note data-name="set-note-la" style="user-select: none; margin-right: .5rem;">la</span>
  // <span data-set-note data-name="set-note-ka" style="user-select: none; margin-right: .5rem;">ka</span>
  // <span data-set-note data-name="set-note-ba" style="user-select: none; margin-right: .5rem;">ba</span>
  // </div>

  // <div style="user-select: none;">
  // <span data-set-note data-name="set-note-do" style="user-select: none; margin-right: .5rem;">do</span>
  // <span data-set-note data-name="set-note-to" style="user-select: none; margin-right: .5rem;">to</span>
  // <span data-set-note data-name="set-note-ro" style="user-select: none; margin-right: .5rem;">ro</span>
  // <span data-set-note data-name="set-note-no" style="user-select: none; margin-right: .5rem;">no</span>
  // <span data-set-note data-name="set-note-mo" style="user-select: none; margin-right: .5rem;">mo</span>
  // <span data-set-note data-name="set-note-fo" style="user-select: none; margin-right: .5rem;">fo</span>
  // <span data-set-note data-name="set-note-vo" style="user-select: none; margin-right: .5rem;">vo</span>
  // <span data-set-note data-name="set-note-so" style="user-select: none; margin-right: .5rem;">so</span>
  // <span data-set-note data-name="set-note-zo" style="user-select: none; margin-right: .5rem;">zo</span>
  // <span data-set-note data-name="set-note-lo" style="user-select: none; margin-right: .5rem;">lo</span>
  // <span data-set-note data-name="set-note-ko" style="user-select: none; margin-right: .5rem;">ko</span>
  // <span data-set-note data-name="set-note-bo" style="user-select: none; margin-right: .5rem;">bo</span>
  // </div>

  // <div style="user-select: none;">
  // <span data-set-note data-name="set-note-dy" style="user-select: none; margin-right: .5rem;">dy</span>
  // <span data-set-note data-name="set-note-ty" style="user-select: none; margin-right: .5rem;">ty</span>
  // <span data-set-note data-name="set-note-ry" style="user-select: none; margin-right: .5rem;">ry</span>
  // <span data-set-note data-name="set-note-ny" style="user-select: none; margin-right: .5rem;">ny</span>
  // <span data-set-note data-name="set-note-my" style="user-select: none; margin-right: .5rem;">my</span>
  // <span data-set-note data-name="set-note-fy" style="user-select: none; margin-right: .5rem;">fy</span>
  // <span data-set-note data-name="set-note-vy" style="user-select: none; margin-right: .5rem;">vy</span>
  // <span data-set-note data-name="set-note-sy" style="user-select: none; margin-right: .5rem;">sy</span>
  // <span data-set-note data-name="set-note-zy" style="user-select: none; margin-right: .5rem;">zy</span>
  // <span data-set-note data-name="set-note-ly" style="user-select: none; margin-right: .5rem;">ly</span>
  // <span data-set-note data-name="set-note-ky" style="user-select: none; margin-right: .5rem;">ky</span>
  // <span data-set-note data-name="set-note-by" style="user-select: none; margin-right: .5rem;">by</span>
  // </div>

  // </div>
}

function getKeyboard(): string {
  const keyboard = `
<div style="
    font-family: monospace;
    user-select: none;    
    padding: 0.5rem 0 0.5rem 0.5rem;"
>
${getKey('dy', '~')}${getKey('my', '!')}${getKey('zy', '@')}
${getKey('do', '#')}${getKey('mo', '$')}${getKey('zo', '%')}
${getKey('da', '^')}${getKey('ma', '&')}${getKey('za', '*')}
${getKey('de', '(')}${getKey('me', ')')}${getKey('ze', '_')}
<br/>
${getKey('ty', '?')}${getKey('fy', 'q')}${getKey('ly', 'w')}
${getKey('to', 'e')}${getKey('fo', 'r')}${getKey('lo', 't')}
${getKey('ta', 'y')}${getKey('fa', 'u')}${getKey('la', 'i')}
${getKey('te', 'o')}${getKey('fe', 'p')}${getKey('le', '[')}
<br/>
${getKey('ry', '?')}${getKey('vy', 'a')}${getKey('ky', 's')}
${getKey('ro', 'd')}${getKey('vo', 'f')}${getKey('ko', 'g')}
${getKey('ra', 'h')}${getKey('va', 'j')}${getKey('ka', 'k')}
${getKey('re', 'l')}${getKey('ve', ';')}${getKey('ke', "'")}
<br/>
${getKey('ny', '?')}${getKey('sy', 'z')}${getKey('by', 'x')}
${getKey('no', 'c')}${getKey('so', 'v')}${getKey('bo', 'b')}
${getKey('na', 'n')}${getKey('sa', 'm')}${getKey('ba', ',')}
${getKey('ne', '.')}${getKey('se', '/')}${getKey('be', '?')}
</div>

`.replace(/\n/g, '');

  return keyboard;
}

const info = `
<div style="margin: .5rem;">

<!--b>TEST</b-->
<!--pre style="font-family: monospace; margin: .5rem 0 0;"></pre-->

${getKeyboard2()}
<br/>

${getKey('bu', '????')}
<span style="user-select: none; font-size: 1.5rem" data-name="clear-keys-color">
  &nbsp;&nbsp;&nbsp;!clr
</span>
<span style="user-select: none; font-size: 1.5rem" data-name="select-random-key">
  &nbsp;&nbsp;!rnd
</span>

${getKeyboard()}

<div style="font-size: 1.5rem; font-family: monospace;">

<!-- li -->

???????? ??????????????    <br/>
???????????? ????????     <br/>
???????????? ?????????????? <br/>
????????????????  ????????  <br/>
???????????????? ???????????????? <br/>
???????????????? <br/>
???????????????? ????????????????  <br/>
</div>

<!--??????????????                               (????)<br/>
???????????????? ???????????? ???????? ???????????? ???????? ???????? (????)<br/>
??_???????????? ???????????? ???????? ???????????? ???????? ???????? (????)<br/>-->

<div style="font-size: 1.75rem; font-family: monospace;">


<!-- Am -->

<a data-note-line="b60 ????-100">wA  1=</a><br/>

<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??????????</a>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??8??8??</a>

<br/>

<a data-note-line="b60 ????-100">$E 3=</a><br/>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????8??8y8??</a>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????9??9y9??</a>

<!-- Am --> <br/><br/>

<!-- E -->
<a data-note-line="b60 ????-100">
  !E -1-
</a>
<br/>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??????????</a>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??9??9??</a>
<br/>

<a data-note-line="b60 ????-100">%G# 4=  %Ab 5-</a><br/>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????9??9??9??</a>

<!-- E --> <br/><br/>


<!-- G -->

<a data-note-line="b60 ????-100">zG  1-</a><br/>

<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??????????</a>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????7??9??9??</a>

<br/>

<a data-note-line="b60 ????-100">bB 5=</a><br/>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????9??9??9??</a>

<!-- G --><br/><br/>

<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????????8??????</a><br/>
<a data-note-line="b60 ????-100 ????-100 ????-100 ????-100">????9??????????(9??)</a><br/>


</div>

<br/><br/>
</div>
`;

const content = `
  ${info}
`.trim();

const parts = `
<tick4@>
-  : 1   2   3   4   :
@cowbell: x   x   x   x   :
--------------------------------------------------------------------------------
<tick3@>
-  : 1   2   3   :
@cowbell: x   x   x   :
--------------------------------------------------------------------------------
<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<simple44_drum@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<pause100@>
-  : 1   :
@hc:     :
--------------------------------------------------------------------------------
<pause200@>
-  : 1   2   :
@hc:         :
--------------------------------------------------------------------------------
<pause300@>
-  : 1   2   3   :
@hc:             :
--------------------------------------------------------------------------------
<pause400@>
-  : 1   2   3   4   :
@hc:                 :
--------------------------------------------------------------------------------
<hat@>
-  : 1   2   3   4   :
@hc: x   x   x   x   :
--------------------------------------------------------------------------------
<hat8@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
--------------------------------------------------------------------------------
<pause50$>
$organ: 50


`.trim();

const melody = `
<out b120 r1000>
iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@
iml_ItsMyLife_ItsNowOrNever_drum@

tick4@
iml_??????_drum@
iml_ThisAintASongForTheBrokenHearted_drum@
iml_NoSilentPrayerForTheFaithDeparted_drum@
iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@
iml_ItsMyLife_ItsNowOrNever_drum@

#simple44_drum@-4
pause400@

<iml_ItsMyLife_ItsNowOrNever_drum@>
-  : |   |   1   |   |   |   2   |   |   |   3   |   :
@hc:         x   x x x x x x x x x x x x x x x x x x :
@sn:             x       x       x       x       x   :
@bd:         x       x       x       x       x       :

<iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   5   |   :
@hc: x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x         :
@sn:     2       4       2       4       2       4       2       4   x   x   :
@bd: 1       3       1       3       1       3       1       3       x   x   :

<iml_NoSilentPrayerForTheFaithDeparted_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc: x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x :
@sn:     2       4       2       4       2       4       2       4   :
@bd: 1       3       1       3       1       3       1       3       :

<iml_ThisAintASongForTheBrokenHearted_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:                               x x x x x x x x x x x x x x x x x :
@sn: x                           x       x       x       x       x   :
@bd: x                         x     x       x       x       x       :

<iml_??????_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:         x x x x x x x x x x x x         x x x x x x x x x x x x :
@sn: x   x                           x   x       x       x       x   :
@bd: x   x     x     x     x x x     x   x         x x       x x     :


${parts}
`;

const beat44 = `
<out b120 r1000>
simple44@

<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

export default {
  content,
  tracks: [
    { key: 'beat44', value: beat44, name: '?????? 4/4: bpm120' },
    // { key: 'harmony', value: melody, name: '??????????????: bpm:120' },
  ],
};
