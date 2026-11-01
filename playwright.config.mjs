import {defineConfig,devices} from '@playwright/test';
const chromiumOptions=process.env.OPENMAP_CHROMIUM?{executablePath:process.env.OPENMAP_CHROMIUM,args:['--no-sandbox','--enable-unsafe-swiftshader']}:undefined;
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:true,workers:2,timeout:60000,
 reporter:[['list']],outputDir:process.env.OPENMAP_QA_DIR||'test-results',
 use:{baseURL:'http://127.0.0.1:8080',headless:true,trace:'retain-on-failure'},
 projects:[{name:'desktop',use:{browserName:'chromium',viewport:{width:1440,height:1000},launchOptions:chromiumOptions}},{name:'mobile',use:{...devices['Pixel 7'],launchOptions:chromiumOptions}},
  {name:'firefox',use:{browserName:'firefox',viewport:{width:1440,height:1000}}},{name:'webkit',use:{browserName:'webkit',viewport:{width:1440,height:1000}}}],
 webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:8080',reuseExistingServer:!process.env.CI}
});
