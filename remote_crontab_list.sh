# 百变大咖秀
0 10,11 * * 1-4 node /scripts/jd_entertainment.js >> /scripts/logs/jd_entertainment.log 2>&1

# 粉丝互动
15 10 * * * node /scripts/jd_fanslove.js >> /scripts/logs/jd_fanslove.log 2>&1

# 超级摇一摇
5 20 * * * node /scripts/jd_shake.js >> /scripts/logs/jd_shake.log 2>&1

# 联想集卡活动
10 15 15-29 3 * node /scripts/z_lenovo.js >> /scripts/logs/jd_lenovo.log 2>&1

# 京东超市-大转盘
10 10 * * * node /scripts/z_marketLottery.js >> /scripts/logs/jd_marketLottery.log 2>&1

# 母婴-跳一跳
10 8,14,20 17-25 3 * node /scripts/z_mother_jump.js >> /scripts/logs/jd_mother_jump.log 2>&1

#答题赢京豆
5 1 23-25 3 * node /scripts/z_grassy.js >> /scripts/logs/z_grassy.log 2>&1

#京东小魔方
10 10 25-27 3 * node /scripts/z_xmf.js >> /scripts/logs/z_xmf.log 2>&1
