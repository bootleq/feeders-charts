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
        對於早期遊蕩犬數量大幅下降，有見解為「垃圾不落地」就是主因。
      </p>
      <p>
        參考 <a target='_blank' href='https://feeders.pages.dev/facts/2009-08-11_65' title='2009-08-11: 北縣流浪狗降幅全國第一 - 事實記錄 - Feeders（暫名）'>2009-08-11: 北縣流浪狗降幅全國第一</a>
      </p>
      <p>
        政策於 95 年已擴及全國，但有地方差異，例如 108 年的監察報告指出，全國仍有 75 條路線未實施垃圾不落地（主為偏鄉或山地鄉），分布於臺南市、彰化縣、南投縣、苗栗縣等。
      </p>
    </details>
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
      後續參考報導者 The Reporter + 窩窩專題：
      <a href='https://www.twreporter.org/topics/6-years-after-no-kill-policy-adopted' title='零撲殺上路六年：當生命不再倒數十二夜，流浪犬何處為家？ - 報導者 The Reporter'>零撲殺上路六年：當生命不再倒數十二夜，流浪犬何處為家？</a>
    </p>
  `,
} as const;
