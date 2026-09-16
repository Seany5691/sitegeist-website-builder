 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 1300ms
 GET /?businessName=Klerksdorp+Engineering&ownerName=Gideon+Crouwkamp&city=North+West&whatsappNumber=0180112453&existingWebsiteUrl=https%3A%2F%2Fwww.klerksdorpengineering.co.za%2F&buildMode=TRIAL 200 in 117ms
 GET /.well-known/appspecific/com.chrome.devtools.json 404 in 164ms
 ○ Compiling /api/build-site ...
 ✓ Compiled /api/build-site in 1403ms (284 modules)
[Scraper] Starting 3-tier discovery for: https://www.klerksdorpengineering.co.za/
[Scraper] Tier 1: Sitemap discovery for https://www.klerksdorpengineering.co.za/
[Scraper] Tier 1: Found 4 URLs from https://www.klerksdorpengineering.co.za/sitemap.xml
[Scraper] Tier 1: Sitemap discovered 4 HTML pages and 0 images
[Scraper] Final: 4 HTML pages, 0 sitemap images
[Scraper] Parallel scraping 4 pages with local Playwright...
[Scraper] Processing batch 1: 3 pages
[Local Scraper] Scraping https://www.klerksdorpengineering.co.za/ via local Playwright Chromium...
[Local Scraper] Scraping https://www.klerksdorpengineering.co.za/services-products/ via local Playwright Chromium...
[Local Scraper] Scraping https://www.klerksdorpengineering.co.za/klerksdorp-exhausts/ via local Playwright Chromium...
[Local Scraper] Scraped https://www.klerksdorpengineering.co.za/ successfully - found 8 images
[Local Scraper] Scraped https://www.klerksdorpengineering.co.za/klerksdorp-exhausts/ successfully - found 18 images
[Local Scraper] Scraped https://www.klerksdorpengineering.co.za/services-products/ successfully - found 52 images
[Scraper] Processing batch 2: 1 pages
[Local Scraper] Scraping https://www.klerksdorpengineering.co.za/contact-us/ via local Playwright Chromium...
[Local Scraper] Scraped https://www.klerksdorpengineering.co.za/contact-us/ successfully - found 4 images
[Scraper] Successfully scraped 4 out of 4 pages
[Scraper] Sitemap harvested 0 images directly from XML
[Scraper] Aggregated 4 pages, 126 images, 5 logos
[Scraper] CSS Colors mined: 0 unique, Primary: #0ea5e9, Secondary: #6366f1
[Scraper] Discovered 4 internal pages
[Scraper] Total images: 126
[AI Engine] Synthesizing multi-page context...
[AI Engine] Synthesizing multi-page context (4 pages scraped)...
[Color Extractor] Extracting colors from: https://www.klerksdorpengineering.co.za/wp-content/uploads/2019/07/Klerksdorp-Engineering-Logo.jpg
[Color Extractor] Extracted from image: {
  primaryHex: '#453e07',
  secondaryHex: '#c6352c',
  accentHex: '#ccc847',
  bgHex: '#09090b'
}
[AI Engine] Extracted logo colors: {
  primaryHex: '#453e07',
  secondaryHex: '#c6352c',
  accentHex: '#ccc847',
  bgHex: '#09090b'
}
[Color Extractor] Merging logo and CSS colors...
[Color Extractor] Final palette: {
  primary: '#453e07',
  secondary: '#c6352c',
  accent: '#ccc847',
  bg: '#fafafa'
}
[AI Engine] Final merged palette: {
  primary: '#453e07',
  secondary: '#c6352c',
  accent: '#ccc847',
  bg: '#fafafa'
}
Build site error: Error: OpenRouter: 402 - This request requires more credits, or fewer max_tokens. You requested up to 4000 tokens, but can only afford 3833. To increase, visit https://openrouter.ai/settings/credits and upgrade to a paid account
    at generateSiteConfig (webpack-internal:///(rsc)/./lib/ai-engine.ts:294:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST (webpack-internal:///(rsc)/./app/api/build-site/route.ts:50:26)
    at async C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:53446
    at async e_.execute (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:44747)
    at async e_.handle (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:54700)
    at async doRender (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:1377:42)
    at async cacheEntry.responseCache.get.routeKind (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:1599:28)
    at async DevServer.renderToResponseWithComponentsImpl (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:1507:28)
    at async DevServer.renderPageComponent (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:1962:32)
    at async DevServer.pipeImpl (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:920:25)
    at async NextNodeServer.handleCatchallRenderRequest (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\next-server.js:272:17)
    at async DevServer.handleRequestImpl (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\base-server.js:816:17)
    at async C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\dev\next-dev-server.js:339:20
    at async Span.traceAsyncFn (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\trace\trace.js:154:20)
    at async DevServer.handleRequest (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
    at async invokeRender (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\lib\router-server.js:174:21)
    at async handleRequest (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\lib\router-server.js:353:24)
    at async requestHandlerImpl (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\lib\router-server.js:377:13)
    at async Server.requestListener (C:\Users\seany\OneDrive\Documents\Coding Projects\sitegeist_ecosystem\Website Builder\node_modules\next\dist\server\lib\start-server.js:141:13)
 POST /api/build-site 500 in 32935ms