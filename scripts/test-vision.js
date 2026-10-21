const fs = require('fs')
const path = require('path')

async function main() {
  const imgPath =
    'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/rvs_plumbing_potchefstroom_klerksdorp/screenshots/judge/compressed/home-desktop.jpg'
  const b64 = fs.readFileSync(imgPath).toString('base64')
  console.log('image bytes:', fs.statSync(imgPath).size)

  const MIMO_API_URL = 'https://token-plan-sgp.xiaomimimo.com/v1/chat/completions'
  const MIMO_API_KEY = 'tp-s5mjmff9x4qh31pudzb4k45ipyprkgxvmgeyhidxqo28ljg3'

  const body = {
    model: 'mimo-v2.5',
    messages: [
      { role: 'system', content: 'You are a web design critic. Reply only with JSON.' },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Score the visual hierarchy of this website screenshot 1-10. JSON: {"visualHierarchy": <n>}' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 200,
  }

  const res = await fetch(MIMO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MIMO_API_KEY}`,
    },
    body: JSON.stringify(body),
  })
  console.log('status', res.status)
  const text = await res.text()
  console.log('response:', text.slice(0, 800))
}

main().catch((e) => console.error('FAIL', e.message))
