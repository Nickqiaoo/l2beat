import { ActivityApiChartPoint, ActivityApiCharts } from '@l2beat/shared-pure'

export function formatActivityChart(
  dailyData: ActivityApiChartPoint[],
): ActivityApiCharts {
  const len = dailyData.length
  var change : number = 0
  var tps =  parseFloat((dailyData[len-1][1]/86400).toFixed(1))
  if (len >= 8){
    var today = dailyData[len-1][1]
    var last = dailyData[len-8][1]
    change = parseFloat(((today - last) / last * 100).toFixed(2));
  }

  dailyData.forEach(chartPoint => {
    chartPoint[3] = parseFloat((chartPoint[1] / 86400).toFixed(1)); 
  });
  return {
    daily: {
      types: ['timestamp', 'transactions', 'ethereumTransactions', 'tps'],
      data: dailyData,
    },
    summary: {
      tps: tps,
      change: change,
      max_day: ''
    }
  }
}
