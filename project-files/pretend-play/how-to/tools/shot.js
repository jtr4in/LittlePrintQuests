const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  for (const f of process.argv.slice(2)) {
    const p = await b.newPage({ viewport: { width: 1600, height: 2400 } });
    await p.goto('file://' + require('path').resolve(f)); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: f.replace('.html', '.png') }); console.log(f);
  }
  await b.close();
})();
