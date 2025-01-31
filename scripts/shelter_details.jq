group_by(.rpt_year, .rpt_country_code)
| map({
  year:    .[0].rpt_year,                # 年度
  city:    .[0].rpt_country_code,        # 縣市代碼
  s_max:   map(.max_stay_dog_num) | max, # 可留容犬最大值
  captu:   map(.in_gg_num) | add,        # 政府捕捉入所
  drop:    map(.in_lv_num) | add,        # 不擬續養
  rescue:  map(.in_re_num) | add,        # 動物救援
  confis:  map(.in_lw_num) | add,        # 依法沒入 (confiscation)
  s_in:    map(.in_tot_num) | add,       # 合計入所數，即動保資訊網「收容隻數」
  adp_idv: map(.out_ad_ca_num) | add,    # 領養（個人認養）
  adp_org: map(                          # 領養（民間狗場、動保團體）
    .out_ad_fa_num + .out_ad_cv_num
  ) | add,
  adp:     map(                          # 領出（領養 + 領回），即動保資訊網「認養隻數」（些微誤差）
    .out_tback_num + .out_ad_ca_num +
    .out_ad_fa_num + .out_ad_cv_num
  ) | add,
  kill:    map(                          # 依法人道處理
    .out_hs_3_num + .out_hs_5_num +
    .out_hs_7_num + .out_hs_ot_num
  ) | add,
  die:     map(                          # 所內死亡
    .out_sd_num + .out_jd_num
  ) | add,
  return:  map(.out_rl_num) | add,       # 釋回原地
  out_etc: map(                          # 其他出所（逃脫、其他）
    .out_ec_num + .out_el_num
  ) | add,
  s_sum:   map(.fe_sum_num) | max,       # 在養數_小計
})
