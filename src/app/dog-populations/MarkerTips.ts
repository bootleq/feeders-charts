const html = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw(strings, ...values);

export const MarkerTips: Record<string, string> = {
  '垃圾不落地': html`
    <details>
      <summary>說明</summary>
      <p>
        民國 83 ~ 97 年前後，政府推行「垃圾不落地」政策，大幅減少戶外廚餘。
      </p>
      <p>
        對於早期遊蕩犬數量大幅下降，有見解認為「垃圾不落地」就是主因。
      </p>
      <p>
        參考 <a target='_blank' href='https://feeders.pages.dev/facts/2009-08-11_65' title='2009-08-11: 北縣流浪狗降幅全國第一 - 事實記錄 - Feeders'>2009-08-11: 北縣流浪狗降幅全國第一</a>
      </p>
      <p>
        政策於 95 年已擴及全國，但有地方差異，例如 108 年的監察報告指出，全國仍有 75 條路線未實施垃圾不落地（主為偏鄉或山地鄉），分布於臺南市、彰化縣、南投縣、苗栗縣等。
      </p>
    </details>
  `,

  '統計方式大改': html`
    <p>
      「全國遊蕩犬隻估計數量調查」前三次調查以住宅區為採樣標的，103 至 104 年擴大採樣範圍，增加市場、公園、商業區、工業區及農業區，共六大地理特徵。
    </p>
    <p>
      前後數字無法直接比較，監察院也曾對此批評。
    </p>
    <p>
      2020 開始較為穩定，委託成大統計系執行，只有較小幅的調整。
    </p>
    <p>
      註：統計範圍向來<strong>不含野犬</strong> (feral dog)。
    </p>
  `,

  '零撲殺公告': html`
    <p>
      2015-02-04 動保法第 9 次修法公布，廢除 12 夜，緩衝期兩年。
    </p>
    <p>
      雖然兩年後才正式實施，但已對收容所造成影響，例如減少捕捉、大量送往民間狗場。
    </p>
  `,

  '零撲殺施行': html`
    <p>
      2017-02-01 正式上路。
    </p>
    <p>
      後續參考報導者 The Reporter + 窩窩專題：<a target='_blank' href='https://www.twreporter.org/topics/6-years-after-no-kill-policy-adopted' title='零撲殺上路六年：當生命不再倒數十二夜，流浪犬何處為家？ - 報導者 The Reporter'>零撲殺上路六年：當生命不再倒數十二夜，流浪犬何處為家？</a>
    </p>
  `,

  '動保法第 6 次修法': html`
    <p>
      2008-01-16 公布，選摘：
    </p>
    <ul>
      <li>人身財損宰殺條件加上限制「有立即危險」</li>
      <li>明定不可為「肉用、皮毛、飼料用途」宰殺「犬貓」</li>
      <li>加重虐待動物的刑罰</li>
      <li>明訂捕捉動物不可使用的方法（爆裂物等），除非主管機關許可</li>
    </ul>
  `,
  '動保法第 7 次修法': html`
    <p>
      2010-01-27 公布，選摘：
    </p>
    <ul>
      <li>無人認領宰殺，由 7 天改為 12 天（十二夜）</li>
      <li>買賣業者須「完成晶片植入」後始得買賣或轉讓</li>
    </ul>
  `,
  '動保法第 9 次修法': html`
    <p>
      2015-02-04 公布，選摘：
    </p>
    <ul>
      <li>廢除 12 夜</li>
      <li>飼主必須為寵物植入晶片、登記」</li>
      <li>定義防治虐待細節，禁止絕育以外的手術</li>
    </ul>
  `,
  '動保法第 11 次修法': html`
    <p>
      2017-04-26 公布，選摘：
    </p>
    <ul>
      <li>明確禁吃狗肉，禁止「食用或持有其屠體、內臟或含有其成分之食品」</li>
      <li>宰殺、致傷亡的罰則加重</li>
      <li>未絕育的處罰不再勸導，直接開罰</li>
    </ul>
  `,


  '遊蕩犬管控精進策略': html`
    <p>
      因應遊蕩犬公安事件頻傳，農委會規劃精進策略，督促地方政府提出「熱區」，集中資源<strong>全面清查</strong>並執行三大重點工作：
    </p>
    <ul>
      <li>家犬完成寵物登記、絕育與管理</li>
      <li>無主犬貫徹捕捉、絕育、回置或移除問題犬</li>
      <li>疏導餵養者</li>
    </ul>
    <p>
      此為較長期措施，<a target='_blank' href='https://www.pet.gov.tw/Wandering/HeatMapV1.aspx' title='遊蕩犬熱區圖 - 寵物登記管理資訊網'>遊蕩犬熱區圖</a>可查詢 2023 起各年度、各地區狀況。
    </p>
  `,
  '生態熱區': html`
    <p>
      野生動物受遊蕩犬侵擾問題加劇，農業部再提計畫，改由「中央直接」依石虎出沒地點劃設「生態熱區」。
    </p>
    <p>
      2023 年 5 月「於特定生態熱區試辦特定臺灣原生種野生動物因犬隻侵擾改善專案」。
    </p>
    <p>
      生態敏感區政策，與一般熱區不同的點是「<strong>不回置犬隻</strong>」和「<strong>禁止餵養</strong>」。
    </p>
    <p>
      2024 野保熱區地圖：台中東勢 2 里；苗栗後龍、通霄、卓蘭 23 里；南投集集、中寮 19 村里。
    </p>
    <ul>
      <li>有主犬已執行 7,262 戶訪查，39.41% 覆蓋率，執行寵登絕育 517 隻</li>
      <li>無主犬已清查 278 隻，捕捉絕育收容 229 隻，處置率 82.4%</li>
    </ul>
    <p>
      執行狀況不透明，但 2024 年舉辦
      <a href='https://feeders.pages.dev/facts/2024-09-25_182' title='2024-09-25: 農業部生態熱區徵求創新方案，獎金 8 萬元 - 事實記錄 - Feeders'>徵求創新方案</a>，透露遇上瓶頸。
    </p>
  `,

  '動保司成立': html`
    <p>
      2023-08-01 農委會升格農業部，部長陳吉仲，動物保護司（動保司）也順應誕生，司長江文全。
    </p>
    <p>
      一般期待能改善長久以來農委會畜牧處、動保科位階過低、資源不足的問題。
    </p>
  `,

  '台南零安樂': html`
    <p>
      台南 2011 年起推動工作犬認養，2012 正式公告施行 TNVR 政策，2015 率先成為全國第一個實施流浪犬貓零安樂死的縣市。
    </p>
    <p>
      註：其實 2014 年 11 月就開始。
    </p>
  `,
  '台南工作犬': html`
    <p>
      2011 年起推動工作犬認養，至 2019 已有 7,607 隻狗就業，仍持續進行。
    </p>
  `,

  '新北餵養講習': html`
    <p>
      新北市開辦「乾淨餵食」講習，與餵養人互動，分享餵食方式、化解與社區住戶衝突，結業後核發餵食照護證（餵食證）。
    </p>
    <p>
      到 2019-10-05 共舉辦 10 梯次，但部分持證者製造髒亂，引起民怨，最後停止發放，共發放 400 人次。
    </p>
    <p>
      2020 年改辦「流浪動物源頭絕育講習」認證，上課後可領絕育補助。
    </p>
  `,
  '台南餵養講習': html`
    <p>
      台南市開辦餵養講習，頒發「餵養公約卡」還送 2000 飼料費。
    </p>
    <p>
      已於 2023 停辦，共計發放 148 張。
    </p>
  `,

  '悲傷 326 記者會': html`
    <p>
      動社（台灣動物社會研究會）公布於全台 326 縣市鄉鎮調查成果，揭露流浪犬貓處境，內容殘酷，督促政府採取行動。
    </p>
    <p>
      專題網站：<a target='_blank' href='https://www.east.org.tw/ext/animal-action.east.org.tw/'>台灣『奇蹟』──從生命到垃圾：系統檢視流浪犬貓動物福利問題</a>
      <small>（註：目前許多頁面變成亂碼）</small>
    </p>
    <p>
      詳見 <a href='https://www.east.org.tw/action/1285' target='_blank' title='公布全台326縣市鄉鎮流浪犬貓捕捉、收容現況調查，控訴政府集體、大規模虐待流浪犬貓'>動社發表文章</a>。
    </p>
  `,

  '動團安樂死聲明': html`
    <p>
      零撲殺後，民眾仍然有汙名化「安樂死」的情形。
      多個動團表態支持基於動物福利人道安樂死：<a target='_blank' href='https://www.spca.org.tw/post/zhen-dui-gong-li-shou-rong-chu-suo-dong-wu-ren-dao-chu-li-ji-zhi-zhi-luo-shi-dong-bao-tuan-ti-lian-he-sheng?fbclid=IwZXh0bgNhZW0CMTAAAR1ym-foOaOqbc50ypN5BRj2oGyv9fttlr7aki_3jjPzpoqPBaFpLlUhhQE_aem_xqbZ4cM26PGsw_KLyxkCww' title='針對公立收容處所動物人道處理機制之落實：動保團體聯合聲明'>針對公立收容處所動物人道處理機制之落實：動保團體聯合聲明</a>
    </p>
  `,

  '相信動物新北': html`
    <p>
      2016 年 5 月開始與新北市府合作
    </p>
    <p>
      執行期間 2017-2020
      <small>（<a target='_blank' href='https://www.faithforanimals.org.tw/tnvr-project/newtaipei'>來源</a>）</small>
    </p>
    <ul>
      <li>絕育率 64% → <strong>86.8%</strong></li>
      <li>家訪 16,118 戶</li>
      <li>絕育 8,578 隻</li>
    </ul>
    <p>
      2024 有再執行數狗，結果減量 45.9%（樣區犬數 1,497 → 810 隻）
    </p>
  `,

  '相信動物台北': html`
    <p>
      2016 年 1 月開始與台北市府合作（此前協會也有在各區抓紮）
    </p>
    <p>
      執行期間 2017-2019
      <small>（<a target='_blank' href='https://www.faithforanimals.org.tw/tnvr-project/taipei'>來源</a>）</small>
    </p>
    <ul>
      <li>絕育率原本就比較高，參考相信動物二年年報</li>
      <li>幼犬入所量 259 隻 → 133 隻 <small>(2018-2021)</small></li>
      <li>流浪犬民怨通報量 2,351 件 → 1,023 件 <small>(2018-2021)</small></li>
      <li>家訪 469 戶</li>
      <li>絕育 1,301 隻</li>
    </ul>
  `,

  '相信動物桃園': html`
    <p>
      2020 年 1 月開始與桃園市府合作
    </p>
    <p>
      執行期間 2020-2024
      <small>（<a target='_blank' href='https://www.faithforanimals.org.tw/tnvr-project/taoyuan'>來源</a>）</small>
    </p>
    <ul>
      <li>絕育率 45.6% → ??%</li>
      <li>家訪 27,832 戶</li>
      <li>絕育 9,400 隻</li>
    </ul>
  `,
  '相信動物基隆': html`
    <p>
      2016 年 5 月與基隆市府合作
    </p>
    <p>
      執行期間 2016-2017
      <small>（<a target='_blank' href='https://www.faithforanimals.org.tw/tnvr-project/keelung'>來源</a>）</small>
    </p>
    <ul>
      <li>絕育率 ??% → <strong>85%</strong></li>
      <li>家訪 1,102 戶</li>
      <li>絕育 908 隻</li>
    </ul>
  `,
  '相信動物新竹': html`
    <p>
      2023 年 6 月進入新竹
    </p>
    <p>
      執行期間 2023-今
      <small>（<a target='_blank' href='https://www.faithforanimals.org.tw/tnvr-project/hsinchu'>來源</a>）</small>
    </p>
    <ul>
      <li>絕育率 52% → （還未完成）</li>
      <li>家訪 5,718 戶</li>
      <li>絕育 1,329 隻</li>
    </ul>
  `,

  '電影《十二夜》上映': html`
    <p>
      2013-11-29 上映
    </p>
    <p>
      後續影響強勁，次年九合一大選是首次有多位縣市長候選人提出明確動保政見
    </p>
  `,
  '民雄收容所運送事件': html`
    <p>
      2016-04-25 嘉義縣家畜所運送民雄收容所內 71 隻犬貓到台南市徐園長護生園，36 隻狗熱衰竭或互咬而死。
    </p>
    <p>
      暴露出收容所將壓力轉給民間狗場的問題，經調查，2014 起兩年間多送了 3,400 隻動物給民間狗場（算認養），是該所收容數的 22.6 倍。
    </p>
    <p>
      參考 <a target='_blank' href='https://feeders.pages.dev/facts/2016-04-25_118' title='2016-04-25: 嘉義民雄收容所運送 71 隻犬貓，36 狗熱衰竭而死 - 事實記錄 - Feeders'>2016-04-25: 嘉義民雄收容所運送 71 隻犬貓，36 狗熱衰竭而死</a>
    </p>
  `,
  '犬攻擊穿山甲倍增': html`
    <p>
      特生中心統計 1993 ~ 2022 期間穿山甲救傷原因，
      受犬攻擊隻數在 2018 後大幅成長，連續 5 年每年皆有 20 隻左右，是過去的 <strong>3 倍</strong>。
    </p>
    <p>
      2018 後大約每兩隻救傷就有一隻來自犬攻擊，已取代獸鋏（1993 ~ 2009 期間約 70%）成為最大威脅。
    </p>
    <p>
      參考報導者 <a target='_blank' href='https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-conflict-with-wildlife#:~:text=犬隻攻擊已成穿山甲最大威脅' title='野外棲地誰的家──犬殺頻傳，遊蕩犬與野生動物衝突下的生態與公衛危機 - 報導者 The Reporter'>野外棲地誰的家──犬殺頻傳，遊蕩犬與野生動物衝突下的生態與公衛危機</a>
    </p>
  `,
  '壽山流浪狗倍增': html`
    <p>
      高雄壽山歷年生態調查，發現 2017 年流浪狗相對數量大幅增加 318%
    </p>
  `,

  '簡稚澄事件': html`
    <p>
      2016-05-05 桃園市動保處技士，新屋動保教育園區園長簡稚澄，服下狗的安樂死藥物自戕，5/12 不治。
    </p>
    <p>
      她在遺書中提到：「希望這件事能被世人看到，選擇用狗安樂死的方法，是要凸顯現有台灣動保結構的問題。末端的資源、人力不足，源頭管制工作無法做好，流浪狗到了最下游的收容所都是苦難。」
    </p>
    <p>
      <a target='_blank' href='https://www.facebook.com/viola.liu.142/posts/pfbid0pE1urkDaYJvtSUXzyzUfXS9nAKTWHhi9BbLkgUoF3wgTsHvasraCw3wikfDaXLcEl' title='敬請關心者共同轉貼~ 【不良的體制，會殺人】 桃園市推廣動物保護協會理事 劉盈如... | Facebook'>【不良的體制，會殺人】 桃園市推廣動物保護協會理事 劉盈如... | Facebook</a>
    </p>
  `,

} as const;
