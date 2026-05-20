// Script to track NPM downloads for all Waelio packages and compare trends.
// Run with: node track-downloads.js

const MAINTAINER = 'waelio';

async function getPackagesForMaintainer(maintainer) {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${maintainer}&size=250`);
    const data = await res.json();
    return data.objects.map(obj => obj.package.name);
  } catch (error) {
    console.error("Error fetching packages:", error.message);
    return [];
  }
}

async function getDownloadStats(pkg) {
  try {
    // Fetch last 21 days (3 weeks) to compare
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 21);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    const url = `https://api.npmjs.org/downloads/range/${startStr}:${endStr}/${pkg}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data.downloads) {
      const days = data.downloads;
      if (days.length < 21) return null;
      
      const week3 = days.slice(0, 7).reduce((sum, day) => sum + day.downloads, 0);
      const week2 = days.slice(7, 14).reduce((sum, day) => sum + day.downloads, 0);
      const week1 = days.slice(days.length - 7).reduce((sum, day) => sum + day.downloads, 0);
      
      const diff = week1 - week2;
      const trend = week1 > week2 ? '📈 UP' : (week1 < week2 ? '📉 DOWN' : '➖ SAME');
      
      return {
        pkg,
        week3,
        week2,
        week1,
        diff,
        trend
      };
    }
  } catch (error) {
    // Ignore errors for individual packages
  }
  return null;
}

async function run() {
  console.log(`🔍 Fetching packages for maintainer: ${MAINTAINER}...`);
  // Add some known packages just in case the search API misses them due to indexing delays
  const knownPackages = [
    "@waelio/cli", "@waelio/builder", "@waelio/agent", "@waelio/utils",
    "waelio-utils", "quasar-app-extension-waelio", "@waelio/ustore", 
    "@waelio/messaging", "@waelio/sync", "@waelio/data", "@waelio/negotiate"
  ];
  
  const searchPackages = await getPackagesForMaintainer(MAINTAINER);
  const allPackages = [...new Set([...knownPackages, ...searchPackages])];
  
  console.log(`📦 Found ${allPackages.length} packages. Fetching download stats (this may take a few seconds)...`);
  
  const statsPromises = allPackages.map(getDownloadStats);
  const results = await Promise.all(statsPromises);
  
  const validResults = results.filter(r => r !== null);
  
  // Sort by highest downloads last week (week1)
  validResults.sort((a, b) => b.week1 - a.week1);
  
  let totalWeek3 = 0;
  let totalWeek2 = 0;
  let totalWeek1 = 0;
  
  console.log('\n=============================================================================================');
  console.log(' NPM DOWNLOADS TRACKER (3-Week Trend: Week 3 vs Week 2 vs Week 1/Last 7 Days)');
  console.log('=============================================================================================\n');
  
  console.log(String("PACKAGE").padEnd(35) + String("WEEK 3").padEnd(12) + String("WEEK 2").padEnd(12) + String("WEEK 1").padEnd(12) + String("DIFF (W2->W1)").padEnd(16) + "TREND");
  console.log("-".repeat(95));
  
  for (const r of validResults) {
    totalWeek3 += r.week3;
    totalWeek2 += r.week2;
    totalWeek1 += r.week1;
    
    const diffStr = r.diff > 0 ? `+${r.diff}` : `${r.diff}`;
    console.log(
      String(r.pkg).padEnd(35) + 
      String(r.week3).padEnd(12) + 
      String(r.week2).padEnd(12) + 
      String(r.week1).padEnd(12) + 
      String(diffStr).padEnd(16) + 
      r.trend
    );
  }
  
  console.log("-".repeat(95));
  const totalDiff = totalWeek1 - totalWeek2;
  const totalDiffStr = totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`;
  const totalTrend = totalWeek1 > totalWeek2 ? '📈 UP' : (totalWeek1 < totalWeek2 ? '📉 DOWN' : '➖ SAME');
  
  console.log(
    String("TOTAL").padEnd(35) + 
    String(totalWeek3).padEnd(12) + 
    String(totalWeek2).padEnd(12) + 
    String(totalWeek1).padEnd(12) + 
    String(totalDiffStr).padEnd(16) + 
    totalTrend
  );
  
  console.log('\n💡 Note: NPM download counts often fluctuate due to bot traffic being filtered, CI/CD pipeline caching, or weekend dips.');
}

run();
