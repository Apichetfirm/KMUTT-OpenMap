import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:true,workers:process.env.CI?2:2,timeout:60000,
 reporter:[['list']],outputDir:process.env.OPENMAP_QA_DIR||'test-results',
 use:{baseURL:'http://127.0.0.1:8080',headless:true,trace:'retain-on-failure',
  launchOptions:process.env.OPENMAP_CHROMIUM?{executablePath:process.env.OPENMAP_CHROMIUM,args:['--no-sandbox','--enable-unsafe-swiftshader']}:undefined},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{...devices['Pixel 7']}}],
 webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:8080',reuseExistingServer:!process.env.CI}
});
