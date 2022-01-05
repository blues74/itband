const info = `
<div style="margin: .5rem;">
  <b>И вновь продолжается бой</b>
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=hNSCjRqKtc8"
    target="_blank"
  >
    пример
  </a> |
  <a
    class="link external"
    href="https://muzon-muzon.ru/index/i_vnov_ppodolzhaetsya_boj/0-431"
    target="_blank"
  >
    ноты
  </a>

<pre style="font-family: monospace; margin: .5rem 0 0;">

Cm
G7sus Cm Eb
Fm6 G7 Cm
G7sus Cm Eb
Gm D7 G  

G Fm G7 Cm 
Fm Bb7 Eb
Ab Fm Eb 
C7 Fm G7 Cm
Ab Fm Eb 
C7 Fm G7 Cm

<strong>G7sus Cm        Eb</strong>
неба  утреннего стяг
<strong>        Fm6   G7     Cm</strong>
в жизни важен первый шаг
<strong>G7sus   Cm           Eb</strong>
слышишь реют над страною
<strong>      Gm    D7    G</strong>
ветры ярост-ных а-так

<strong>G  Fm           G7     Cm</strong>
и  вновь продол-жается бой
<strong>   Fm         Bb7         Eb</strong>
и  сердцу тре-вожно в гру-ди
<strong>   Ab       Fm       Eb</strong>
и  ленин та-кой моло-дой
<strong>C7 Fm      G7          Cm</strong>
и  юный ок-тябрь впере-ди
<strong>   Ab       Fm       Eb</strong>
и  ленин та-кой моло-дой
<strong>C7 Fm      G7          Cm</strong>
и  юный ок-тябрь впере-ди

</pre>
<br/><br/>
</div>
`;

const content = `
  ${info}
`.trim();

const parts = `
<tick4@ b120>
-  : 1   2   3   4   :
@cowbell: x   x   x   x   :
--------------------------------------------------------------------------------
<tick3@ b120>
-  : 1   2   3   :
@cowbell: x   x   x   :
--------------------------------------------------------------------------------
<simple44@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<btl_Су1$ b120>
$organ: су-100
--------------------------------------------------------------------------------
<btl_Но4$ b120>
$organ: но-400
--------------------------------------------------------------------------------
<btl_Су3$ b120>
$organ: су-300
--------------------------------------------------------------------------------
<btl_Су4$ b120>
$organ: су-400
--------------------------------------------------------------------------------
<btl_СуСуСу_СуФуСу_СуФуСу$ b120>
$organ: су-50 су-50 су-50  су-50 фу-50 су-50  су-50 фу-50 су-50
--------------------------------------------------------------------------------
<btl_До4$ b120>
$organ: до-400
--------------------------------------------------------------------------------
<btl_До3$ b120>
$organ: до-300
--------------------------------------------------------------------------------
<btl_До3Су1$ b120>
$organ: до-300 су-100
--------------------------------------------------------------------------------
<btl_Фу3$ b120>
$organ: фу-300
--------------------------------------------------------------------------------
<btl_Фу3Су1$ b120>
$organ: фу-300 су-100
--------------------------------------------------------------------------------
<btl_Су3Ро1$ b120>
$organ: су-300 ро-100
--------------------------------------------------------------------------------
<pause100@ b120>
-  : 1   :
@hc:     :
--------------------------------------------------------------------------------
<pause200@ b120>
-  : 1   2   :
@hc:         :
--------------------------------------------------------------------------------
<pause300@ b120>
-  : 1   2   3   :
@hc:             :
--------------------------------------------------------------------------------
<pause400@ b120>
-  : 1   2   3   4   :
@hc:                 :
--------------------------------------------------------------------------------
<hat@ b120>
-  : 1   2   3   4   :
@hc: x   x   x   x   :
--------------------------------------------------------------------------------
<hat8@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :

`.trim();

const melody = `
<out b120 r1000>
tick3@
btl_Вход@     btl_Вход_voice$
pause50$
btl_Неба@     btl_Неба_voice$
btl_ВЖизни@   btl_ВЖизни_voice$
btl_Слышишь@  btl_Слышишь_voice$
btl_Ветры@    btl_Ветры_voice$
btl_Проигрыш@ btl_Проигрыш_voice$
btl_ИВновь@   btl_ИВновь_voice$
btl_ИСердцу@  btl_ИСердцу_voice$
btl_ИЛенин@   btl_ИЛенин_voice$
btl_ИЮный@    btl_ИЮный_voice$
btl_ИЛенин@   btl_ИЛенин_voice$
btl_ИЮный@    btl_ИЮный_voice$
pause400@

<out b120 r1>
tick3@
btl_TukTuk2@ btl_Су1$
btl_test2@   btl_До4$
btl_test2@   btl_Но4$
btl_test2@   btl_Фу3Су1$
btl_testOut@ btl_До3Су1$
btl_test2@   btl_До4$
btl_test2@   btl_Но4$
btl_test2@   btl_Су3Ро1$

<out b120 r1>
tick3@
btl_TukTuk@ btl_Су1$
btl_44@     btl_До4$
btl_44@     btl_Но4$
btl_44@     btl_Фу3Су1$
btl_34@     btl_До3$
btl_TukTuk@ btl_Су1$
btl_44@     btl_До4$
btl_44@     btl_Но4$
btl_44@     btl_Су3Ро1$
btl_44@     btl_СуСуСу_СуФуСу_СуФуСу$

<pause50$ b120>
$organ: 50

<btl_Вход@ b120>
-  : 1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x :

<btl_Вход_voice$ b170>
$organ: му-100 су-50 ку-50 то-50 мо-50 со-50 ко-50  бу-100 ро-50 фо-50 зо-50 ра-50 d700
--------------------------------------------------------------------------------
<btl_Неба_voice$ b120>
#     не-50 ба-50 ут-250 рен-50 не-50 го-50 стяг-100
$sax: да-50 ра-50 на-250  ра-50 на-50 фа-50   са-100 d800

<btl_Неба@ b120>
#    Н Б У         Р Н Г С
#    е а т         е е о т
#                  н     я
#                        г
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: Н Б У         Р Н Г С           :
@sn: x x     x       x       x       :
@bd:     x       x x   x x       x   :

<btl_Неба_voice$ b120>
#     не-50 ба-50 ут-250 рен-50 не-50 го-50 стяг-100
$sax: да-50 ра-50 на-250  ра-50 на-50 фа-50   са-100 d800
--------------------------------------------------------------------------------
<btl_ВЖизни@ b120>
#    В Н В   Ж       П В Ш           :
#    ж и а   е       е ы а           :
#    и       н       р й г           :
#    з                               :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: В Н В   Ж       П В Ш           :
@sn: x x     x       x       x       :
@bd:     x       x     x x       x   :


<btl_ВЖизни_voice$ b120>
#   вжиз-50 ни-50 ва-100 жен-200 пер-50 вый-50 шаг-100
$sax: фа-50 на-50 ра-100  фа-200  на-50  ра-50  да-100 d800
--------------------------------------------------------------------------------
<btl_Слышишь@ b120>
#    С Ш Р         Ю Н С Н О Ю       :
#    л и е         т а т о           :
#    ы ш             д р             :
#      ь               а             :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: С Ш Р         Ю Н С Н О Ю       :
@sn: x x     x       x       x       :
@bd:     x       x x   x x       x   :

<btl_Слышишь_voice$ b120>
#    слы-50 шишь-50 ре-250 ют-50 над-50 стра-50 но-50  о-50  ю-200
$sax: да-50   ра-50 на-250 ра-50  на-50   фа-50 са-50 за-50 са-200 d800
--------------------------------------------------------------------------------
<btl_Ветры@ b120>
#    В Р Я         Р Н А :                                    
#    е ы           о ы   :                                  
#    т             с х   :                                
#                  т     :                               
-  : 0   1   |   |   |   :
@hc: x x x x x x x x x x :
#sn: В Р Я         Р Н А :
@sn: x x     x       x   :
@bd:     x       x x   x :

<btl_Ветры_voice$ b120>
#     вет-50 ры-50  я-250 рост-50 ных-50  а-50
$sax:  са-50 ла-50 ка-250   ла-50  са-50 ва-50 d500
--------------------------------------------------------------------------------
<btl_Проигрыш@ b120>
#    Т                           :
#    а                           :
#    к                           :
-  : 0   1   |   |   |   2   |   :
@hc: x x x x x x x x x x x x x x :
@sn: Т   x   x   x x x   x x x   :
@bd: x   x   x   x x x   x x x   :

<btl_Проигрыш_voice$ b120>
#     так-50
$sax:  са-50 d700
--------------------------------------------------------------------------------
<btl_ИВновь@ b120>
#    И   В   П Д Ж Е   С Б           :
#        н   р о а т   я о           :
#        о   о л         й           :
#        в                           :
#        ь                           :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   В   П Д Ж Е   С Б           :
@sn: x       x       x       x       :
@bd:     x     x x x   x x       x   :

<btl_ИВновь_voice$ b120>
#      и-100 вновь-100 про-50 дол-50 жа-50 ет-100 ся-50 бой-100
$sax: са-100    за-100  фа-50  на-50 ра-50 да-100 бо-50  да-100 d800
--------------------------------------------------------------------------------
<btl_ИСердцу@ b120>
#    И   С   Ц Т В Н   В Д           :
#        е   у р о о   г и           :
#        р     е ж     р             :
#        д             у             :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   С   Ц Т В Н   В Д           :
@sn: x       x       x       x       :
@bd:     x     x x x   x x       x   :

<btl_ИСердцу_voice$ b120>
#      и-100 серд-100 цу-50 тре-50 вож-50 но-100 вгру-50 ди-250
$sax: са-100   за-100 фа-50  на-50  ра-50 да-100   ко-50 са-250 d800
--------------------------------------------------------------------------------
<btl_ИЛенин@ b120>
#    И   Л   Н       Т   К   М Л Д   :
#        е   и       а   о   о о о   :
#            н           й       й   :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   Л   Н       Т   К   М Л Д   :
@sn: x       x       x       x       :
@bd:     x       x       x     x x   :

<btl_ИЛенин_voice$ b120>
#     и-100  ле-100 нин-200 та-100 кой-100 мо-50 ло-50 дой-100 
$sax: на-100 де-100  де-200 ре-100  не-100 ре-50 де-50  ка-100 d800
--------------------------------------------------------------------------------
<btl_ИЮный@ b120>
#    И   Ю Н   О Т   В Р Д           :
#        н ы   к я   п е и           :
#          й     р   е               :
#                ь                   :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   Ю Н   О Т   В Р Д           :
@sn: x       x       x       x       :
@bd:     x x   x x     x x       x   :

<btl_ИЮный_voice$ b120>
#     и-100   ю-50 ный-100 ок-50 тябрь-100 впе-50 ре-50 ди-100
$sax: де-100 за-50  фа-100 на-50    ра-100  да-50 бо-50 да-100 d800
--------------------------------------------------------------------------------

<btl_TukTuk@ b120>
-  : 1   :
@sn: x x :

<btl_44@ b120>
-  : 1     2     3     4     :
@hc: x  x  x  x  x  x  x  x  :
@sn:       2           4     :
@bd: 1           3           :

<btl_34@ b120>
-  : 1     2     3     :
@hc: x  x  x  x  x  x  :
@sn:       2           :
@bd: 1           3     :

<btl_14@ b120>
-  : 1     :
@hc: x  x  :
@sn:       :
@bd: 1     :

<btl_test1$ b120>
$organ: да-50 ра-50

<btl_test2$ b120>
$organ: на-50 на-50 на-50  на-50 на-50 ра-50  на-50 фа-50

<btl_TukTuk2@ b120>
-  : 1   :
@sn: x x :

<btl_test2@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn: x     x     x   :
@bd:    xx     x     :

<btl_testOut@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x     :
@sn: x     x     x x :
@bd:    xx    xx     :

${parts}
`;

const beat44 = `
<out b120 r1000>
simple44@

<simple44@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

const test = `
<out b120 r1000>
cowbell@
rideBell@
handClap@
maracas@
tambourine@
triangle@
timbale@

<out b120 r1000>
conga@
bongo@
cuica@
woodBlock@
guiro@
whistle@
cabasa@
claves@
agogo@
vibraSlap@

<out b120 r1000>
hiHat@
snare@
bassDrum@
lowTom@
midTom@
highTom@
sideRimshot@
crashCymbal@
rideCymbal@
splashCymbal@
chineseCymbal@

<hiHat@ b120>
-  : 1   2   3   4   5   6   :
@ho: x   x                   :
@hc:         x   x           :
@hp:                 x   x   :


<snare@ b120>
-   : 1   2   3   4   :
@sn : x   x           :
@sn1:         x   x   :


<bassDrum@ b120>
-   : 1   2   3   4   :
@bd : x   x           :
@bd1:         x   x   :


<lowTom@ b120>
-   : 1   2   3   4   :
@tl2: x   x           :
@tl1:         x   x   :


<midTom@ b120>
-   : 1   2   3   4   :
@tm2: x   x           :
@tm1:         x   x   :


<highTom@ b120>
-   : 1   2   3   4   :
@th2: x   x           :
@th1:         x   x   :


<sideRimshot@ b120>
-            : 1   2   3   4   :
@sideRimshot : x   x   x   x   :


<crashCymbal@ b120>
-              : 1   2   3   4   :
@crashCymbal2  : x   x           :
@crashCymbal1  :         x   x   :


<rideCymbal@ b120>
-             : 1   2   3   4   :
@rideCymbal2  : x   x           :
@rideCymbal1  :         x   x   :


<splashCymbal@ b120>
-             : 1   2   3   4   :
@splashCymbal : x   x   x   x   :


<chineseCymbal@ b120>
-             : 1   2   3   4   :
@chineseCymbal: x   x   x   x   :


<whistle@ b120>
-             : 1   2   3   4   :
@shortWhistle : x   x           :
@longWhistle  :         x   x   :


<guiro@ b120>
-           : 1   2   3   4   :
@shortGuiro : x   x           :
@longGuiro  :         x   x   :


<conga@ b120>
-              : 1   2   3   4   5   6   :
@muteHighConga : x   x                   :
@openHighConga :         x   x           :
@lowConga      :                 x   x   :


<cabasa@ b120>
-        : 1   2   3   4   :
@cabasa  : x   x   x   x   :


<maracas@ b120>
-        : 1   2   3   4   :
@maracas : x   x   x   x   :


<claves@ b120>
-       : 1   2   3   4   :
@claves : x   x   x   x   :


<timbale@ b120>
-            : 1   2   3   4   :
@highTimbale : x   x           :
@lowTimbale  :         x   x   :


<agogo@ b120>
-          : 1   2   3   4   :
@highAgogo : x   x           :
@lowAgogo  :         x   x   :


<rideBell@ b120>
-         : 1   2   3   4   :
@rideBell : x   x   x   x   :

<cowbell@ b120>
-         : 1   2   3   4   :
@cowbell  : x   x   x   x   :


<bongo@ b120>
-          : 1   2   3   4   :
@highBongo : x   x           :
@lowBongo  :         x   x   :


<triangle@ b120>
-             : 1   2   3   4   :
@muteTriangle : x   x           :
@openTriangle :         x   x   :


<woodBlock@ b120>
-              : 1   2   3   4   :
@highWoodBlock : x   x           :
@lowWoodBlock  :         x   x   :


<cuica@ b120>
-          : 1   2   3   4   :
@muteCuica : x   x           :
@openCuica :         x   x   :


<tambourine@ b120>
-           : 1   2   3   4   :
@tambourine : x x x x x x x x :


<vibraSlap@ b120>
-           : 1   2   3   4   :
@vibraSlap  : x x x x x x x x :


<handClap@ b120>
-           : 1   2   3   4   :
@handClap   : x   x   x   x   :

`.trim();

export default {
  content,
  tracks: [
    { key: 'beat44', value: beat44, name: 'бит 4/4' },
    { key: 'harmony', value: melody, name: 'Мелодия' },
    // { key: 'test', value: test, name: 'Тест' },
  ],
};
