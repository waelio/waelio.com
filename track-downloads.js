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
    // Fetch last 14 days (approx 2 weeks) to compare
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 14);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    const url = `https://api.npmjs.org/downloads/range/${startStr}:${endStr}/${pkg}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data.downloads) {
      // Split into last 7 days and previous 7 days
      const days = data.downloads;
      if (days.length < 14) return null;
      
      const previousWeek = days.slice(0, 7).reduce((sum, day) => sum + day.downloads, 0);
      const lastWeek = days.slice(days.length - 7).reduce((sum, day) => sum + day.downloads, 0);
      
      return {
        pkg,
        previousWeek,
        lastWeek,
        diff: lastWeek - previousWeek,
        trend: lastWeek > previousWeek ? '📈 UP' : (lastWeek < previousWeek ? '📉 DOWN' : '➖ SAME')
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
  
  // Sort by highest downloads last week
  validResults.sort((a, b) => b.lastWeek - a.lastWeek);
  
  let totalPrev = 0;
  let totalLast = 0;
  
  console.log('\n=============================================================================');
  console.log(' NPM DOWNLOADS TRACKER (Last 7 Days vs Previous 7 Days)');
  console.log('=============================================================================\n');
  
  console.log(String("PACKAGE").padEnd(35) + String("PREV 7d").padEnd(12) + String("LAST 7d").padEnd(12) + String("DIFF").padEnd(10) + "TREND");
  console.log("-".repeat(77));
  
  for (const r of validResults) {
    totalPrev += r.previousWeek;
    totalLast += r.lastWeek;
    
    const diffStr = r.diff > 0 ? `+${r.diff}` : `${r.diff}`;
    console.log(
      String(r.pkg).padEnd(35) + 
      String(r.previousWeek).padEnd(12) + 
      String(r.lastWeek).padEnd(12) + 
      String(diffStr).padEnd(10) + 
      r.trend
    );
  }
  
  console.log("-".repeat(77));
  const totalDiff = totalLast - totalPrev;
  const totalDiffStr = totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`;
  const totalTrend = totalLast > totalPrev ? '📈 UP' : (totalLast < totalPrev ? '📉 DOWN' : '➖ SAME');
  
  console.log(
    String("TOTAL").padEnd(35) + 
    String(totalPrev).padEnd(12) + 
    String(totalLast).padEnd(12) + 
    String(totalDiffStr).padEnd(10) + 
    totalTrend
  );
  
  console.log('\n💡 Note: NPM download counts often fluctuate due to bot traffic being filtered, CI/CD pipeline caching, or weekend dips.');
}

run();
