group_by(.rpt_year, .rpt_country_code)
| map({
  year:   .[0].rpt_year,           # 年度
  city:   .[0].rpt_country_code,   # 縣市代碼
  accept: map(.accept_num) | add,  # 收容隻數
  adopt:  map(.adopt_total) | add, # 認領養數
  # _:      map(.adopt_total) | add, # 總認養數 NOTE: 數字奇怪，有時 adpot_num 有值但這邊是 0
  kill:   map(.end_num) | add,     # 人道處理數
  die:    map(.dead_num) | add,    # 所內死亡
})
