group_by(.rpt_year, .rpt_country_code)
| map({
  year:     .[0].rpt_year,             # 年度
  city:     .[0].rpt_country_code,     # 縣市代碼
  domestic: map(.calcu_dog_num) | add, # 家犬總估計數
  roaming:  map(.stray_dog_num) | add, # 遊蕩犬總估計數
})
