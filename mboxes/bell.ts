import dynamic from '../mbox_dynamics/bells.dynamic';

const score = `
<settings>
  pitchShift: 0
  $bass: v50; $guit: v55; $back: v40; $solo: v55; 

<out b120>
> СЧЁТ   %_ [4*120]                   # 480
> ИНТРО  %A [16*120_16*120]           # 1920 - 1920 
> МЯСО_1 %B [8*120_8*120_8*120_8*120] # 960 - 960 - 960 - 960
> СОЛО_1 %C [8*120_8*120_8*120_4*120] # 960 - 960 - 960 - 480
> МЯСО_1 %D [8*120_8*120_8*120_8*120] # 960 - 960 - 960 - 960
> СОЛО_2 %E [8*120_8*120_8*120_4*120] # 960 - 960 - 960 - 480 
> МЯСО_3 %F [8*120_8*120_8*120_8*120] # 960 - 960 - 960 - 960
> ИНТРО  %G [16*120_16*120]           # 1920 - 1920

<СОЛО_2 b120 set>
  соло2_1
  соло2_2
  соло2_3
  соло2_4

<соло2_4 b110 $>
$guit: 0 ву+то=240 бу+во=120 су+ро=120 $guitar*ED
$bass: 0 вы=240    бы=120    сы=120 $cBass*f
$solo: 0 зе=40 ве=40 ме=40  ме=80 те=40  ба=40 те=40 ме=40  зе=40 ба=40 те=40 $trump
#
<соло2_3 b110 $>
$guit: 0 МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0 мы=80    му=40    120 мы=80    му=40 $cBass*f
$solo: 0 120 ба=40 те=40 ме=40  зе=40 ме=40 те=40  ве=40 ме=40 те=40 $trump
$guit: 480 БУ+во=80 бу+во=40 360 $guitar*ED
$bass: 480 бы=80    бы=40 $cBass*f
$solo: 480 ве=40 зе=40 ве=40  ме=40 те=40 ба=40  ве=80 40 $trump
#
<соло2_2 b110 $>
$guit: 0      МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0      мы=80    му=40    120 мы=80    му=40 $cBass*f
$solo: 0 120  ма=40 ла=40 ба=40  ре=40 те=40 ла=40  ре=40 те=40 ла=40 $trump
$guit: 480 БУ+во=80 бу+во=40 120 40 *EDM су=40 лу=40 ку=40 бу=40 су=40  $guitar*ED
$bass: 480 бы=80    бы=40 $cBass*f
$solo: 480 ба=80 те=40 ба=40 ла=40 ва=40 ла=80 $trump
#
<соло2_1 b110 $>
$guit: 0        МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0        мы=80    му=40    120 мы=80    му=40    $cBass*f
$solo: 120      ма=40 за=40 ба=40 ла=40 за=40 ма=40 ла=40 за=40 ма=40 $trump
$guit: 480  БУ+во=80 бу+во=40 120 40 *EDM су=40 лу=40 ку=40 бу=40 су=40  $guitar*ED
$bass: 480  бы=80    бы=40    $cBass*f
$solo: 480  ва=80 за=40 ва=40 ма=40 та=40 бо=80 $trump

#################################################

<СОЛО_1 b120 set>
соло1_1 # EE EE BB(ga#abg)
соло1_2 # EE EE BB(ga#abg)
соло1_3 # EE EE BB
соло1_4 # #F B G

<соло1_4 b110 $>
$guit: 0 ву+то=240 бу+во=120 су+ро=120 $guitar*ED
$bass: 0 вы=240    бы=120    сы=120 $cBass*f
$solo: 0 ва=80 ве=40 ме=40 те=40 ла=40  ре=40 те=40 ла=40 ба=40 ла=40 ва=40 $trump

<соло1_3 b110 $>
# EE EE BB
$guit: 0 МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0 мы=80    му=40    120 мы=80    му=40 $cBass*f
$solo: 0 120 ба=40 за=40 ма=40  бе=80 бе=40  ле=40 зе=40 ме=40 $trump
#
$guit: 480 БУ+во=80 бу+во=40 360 $guitar*ED
$bass: 480 бы=80    бы=40 $cBass*f
$solo: 480 ве=80 ве=40  ме=40 те=40 ба=60 20 ба=40 те=40 ба=40 ла=40 за=40 $trump

<соло1_2 b110 $>
# EE EE BB(ga#abg)
$guit: 0      МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0      мы=80    му=40    120 мы=80    му=40 $cBass*f
$solo: 0  120 за=40 ва=40 ма=40  зе=80 зе=40  ве=40 ме=40 ба=40 $trump
#
$guit: 480 БУ+во=80 бу+во=40 120 40 *EDM су=40 лу=40 ку=40 бу=40 су=40  $guitar*ED
$bass: 480 бы=80    бы=40 $cBass*f
$solo: 480 ре=80 ре=40  те=40 ла=40 ба=60 $trump

<соло1_1 b110 $>
# EE EE BB(ga#abg)
$guit: 0        МУ+бу=80 му+бу=40 120 МУ+бу=80 му+бу=40 $guitar*ED
$bass: 0        мы=80    му=40    120 мы=80    му=40    $cBass*f
$solo:      120 ба=40 за=40 ма=40 ме=80 ме=40  ре=40 те=40 ла=40 $trump
#
$guit: 480  БУ+во=80 бу+во=40 120 40 *EDM су=40 лу=40 ку=40 бу=40 су=40  $guitar*ED
$bass: 480  бы=80    бы=40    $cBass*f
$solo: 480  ба=80 ба=40  ла=40 ва=40 ма=60 $trump

#################################################

<МЯСО_1 b120 set>
мясо1_1 # EE(gae) EE(abe) EE(gae) a#ae #abd
мясо1_1 # EE(gae) EE(abe) EE(gae) a#ae #abd
мясо1_2 # B(a#fba) #F(a#fb#d) B(a#fbb) #FG
мясо1_3 # EE(gae) EE(abe) EE(gae) a#ae #abd   #

<МЯСО_3 b120 set>
мясо1_1 # EE(gae) EE(abe) EE(gae) a#ae #abd
мясо1_1 # EE(gae) EE(abe) EE(gae) a#ae #abd
мясо1_2 # B(a#fba) #F(a#fb#d) B(a#fbb) #FG
мясо3_3

<мясо1_3 b120 $>
# EE(gae) EE(abe) EE(gae) a#ae #abd
$guit: 0    му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 0    мы=80    му=40         сы=80       му=40 $cBass*f
$guit: 240  му+бу=80 му+бу=40 *EDM лу=40 бу=40 мо=40 $guitar*ED  #240
$bass: 240  мы=80    му=40         лы=80       му=40 $cBass*f
$guit: 480  му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 480  мы=80    му=40         сы=80       мы=40 $cBass*f
$guit: 720  су+ро=120              ву+то=120         $guitar*ED  #240
$bass: 720  сы=120                 вы=120 $cBass*f
# 8Q   960

<мясо3_3 b120 $>
# EE(gae) EE(abe) EE(gae) G #F F 
$guit: 0    му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 0    мы=80    му=40         сы=80       му=40 $cBass*f
$guit: 240  му+бу=80 му+бу=40 *EDM лу=40 бу=40 мо=40 $guitar*ED  #240
$bass: 240  мы=80    му=40         лы=80       му=40 $cBass*f
$guit: 480  му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 480  мы=80    му=40         сы=80       мы=40 $cBass*f
$guit: 720  су+ро=80 ву+то=80 фу+до=80 $guitar*ED  #240
$bass: 720  сы=80    вы=80    фы=80    $cBass*f

<мясо1_2 b120 $>
# B(a#fba) #F(a#fb#d) B(a#fbb) #FG
$guit: 0    БУ+во=80=90  ло=40 во=40 бу=40 бо=40    $guitar*ED
$bass: 0    бы=80    лы=40 ву=80       бу=40    $cBass*f
$guit: 240  ВУ=80=100 ло=40 во=40 бу=40 на=40       $guitar*ED
$bass: 240  вы=80 лы=40 ву=80       ну=40       $cBass*f
$guit: 480  БУ+во=80=90 ло=40 во=40 бу=40 бо=40    $guitar*ED
$bass: 480  бы=80    лы=40 ву=80       бу=40    $cBass*f
$guit: 720  ВУ=40 ло=40 ко=40 со=40 ку=40 мо=40 $guitar*EDM
$bass: 720  ву=120            су=120    $cBass*f
# 8Q   960

<мясо1_1 b120 $>
# EE(gae) EE(abe) EE(gam) a#ae #abd
$guit: 0    му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 0    МЫ=80    МУ=40         сы=80       му=40 $cBass*f
$guit: 240  му+бу=80 му+бу=40 *EDM лу=40 бу=40 мо=40 $guitar*ED  #240
$bass: 240  МЫ=80    МУ=40         лы=80       му=40 $cBass*f
$guit: 480  му+бу=80 му+бу=40 *EDM су=40 лу=40 му=40 $guitar*ED  #240
$bass: 480  МЫ=80    МУ=40         сы=80       му=40 $cBass*f
$guit: 720  лу=40 ку=40 мо=40      ку=40 бу=40 ро=40 $guitar*EDM #240
$bass: 720  лы=80       му=40      кы=80       ру=40 $cBass*f
# 8Q   960

#################################################

<СЧЁТ b120 $>
$bass: ме=120 ме=120 ме=120 ме=120 $xylo
$guit: ме=120 ме=120 ме=120 ме=120 $xylo
$back: ме=120 ме=120 ме=120 ме=120 $xylo
$solo: ме=120 ме=120 ме=120 ме=120 $xylo


#################################################

<ИНТРО b120 set>
интро_1
интро_2

<интро_1 b120 $>
# EmGDAd EmGAD EmGDAd EmADAd
#            .__      ._.           ._.           ._.
#$solo: 0     | ма=120 | са=80 ла=40 | ба=80 ла=40 | са=80 ма=40 $trump
$solo: 0       ма=120 са=80 v50 ла=40  ба=240_80_-2=40_-2=80_-3=40 [ма са ла ба_ла_са_ма] $trump
$bass:          му=240                 су=240    $cBass*f
$back:          му+бо=240              су+ро=240 $organ
#            ._.           ._.               ___  ___
#$solo: 480   | са=80 ла=40 ба=80=60 са=120 [са_ла_ба са] $trump
$solo: 480    | са=200=180_80_2=40=20_2=80 са=280=160 [са_ла_ба са] $trump
$bass: 480     ру=240                 лу=120    ру=120    $cBass*f
$back: 480     ро+лу=240              лу+мо=120 ро+лу=120 $organ
#            .__      ._.           ._.           ._.
#$solo: 960   | се=120 ве=80 ме=40   ре=80 ба=40   ла=80 са=40 [се_ве_ме ре_ба_ла_са] $trump
$solo: 960    | се=240_120_-1=80_-2=40 ре=240_80_-3=40_-2=80_-2=40 [се_ве_ме ре_ба_ла_са] $trump
$bass: 960     му=240                 су=240 $cBass*f
$back: 960     му+бо=240              су+ро=240 $organ
#            ._.           ._.               __.     ._.
$solo: 1440  | ба=80 ре=40 | ме=40 40 ла=120 | ба=40 | ла=80 са=40 $trump
$bass: 1440    лу=240                 ру=240    $cBass*f
$back: 1440    лу+мо=240              ро+лу=240 $organ

#################################################

<интро_2 b120 $>
#            .__      ._.           ._.           ._.
$solo: 0  | ма=120 | са=80 ла=40 | ба=80 ла=40 | са=80 ма=40 $trump
$bass: 0    му=240                 су=240 $cBass*f
$back: 0    му+бо=240              су+ро=240 $organ
#            ._.             ._.             ___  ___
$solo: 480  | са=80 ла=40 | ба=40 40 са=160 | 0  | ра=120 $trump
$bass: 480    ру=240                 лу=120    ру=120     $cBass*f
$back: 480    ро+ло=240              лу+мо=120 ро+лу=120  $organ
#            .__      ._.           ._.           ._.
$solo: 960  | ма=120 | са=80 ма=40 | ла=80 са=40 | ма=80 ра=40 $trump
$bass: 960    му=240                 лу=240    $cBass*f
$back: 960    му+бо=240              лу+мо=240 $organ
#            ._.           ._.           .__        .__
$solo: 1440  | бо=80 ра=40 | ма=80 са=40 | ма=80 40 | ра=120 $trump
$bass: 1440    ру=240                      лу=120     ру=120 $cBass*f
$back: 1440    ро+лу=240                   лу+мо=120  ро+лу=120 $organ

#################################################

`.trim();

// <div style="margin: .5rem;">
// <pre style="font-family: monospace; margin: .5rem 0 0;">
// </pre>
// </div>

const info = `
<div style="margin: .5rem;">

</div>
`.trim();

export default {
  content: info,
  tracks: [],
  score,
  dynamic,
  dynamicOld: dynamic,
  exportToLineModel: true,
  ns: 'band-song',
};
