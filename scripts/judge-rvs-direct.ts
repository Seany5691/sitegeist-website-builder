import { judgeWebsite } from '../lib/llm-judge'

async function main() {
  console.log('Running judge directly on RVS Plumbing...')
  const result = await judgeWebsite({
    projectDir:
      'C:/Users/seany/OneDrive/Documents/Coding Projects/sitegeist_ecosystem/Websites/rvs_plumbing_potchefstroom_klerksdorp',
    businessName: 'RVS Plumbing Potchefstroom / Klerksdorp',
    archetype: 'Plumbing Companies',
    brandPersonality: 'professional',
  })

  console.log('\n========== RESULT ==========')
  console.log('score:', result.score, '| raw:', result.rawScore, '| rec:', result.recommendation)
  console.log('breakdown:', JSON.stringify(result.breakdown, null, 2))
  console.log('fixes:', result.priorityFixes.length)
  result.priorityFixes.slice(0, 6).forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.impact}] ${f.file}`)
    console.log(`     ${f.issue}`)
    console.log(`     -> ${f.change}`)
  })
  console.log('uniqueness:')
  result.uniquenessSuggestions.slice(0, 4).forEach((s) => console.log('  -', s))
  console.log('stock:', result.stockImageNotes.slice(0, 3))
  console.log('feedback:', (result.feedback || '').slice(0, 500))
}

main().catch((e) => {
  console.error('FAIL', e)
  process.exit(1)
})
