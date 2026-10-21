import { sendBuildReadyEmail } from '../lib/build-notify-email.ts'

const payload = {
  businessName: 'Mamma & Mia Cakes And Catering',
  ownerName: 'Lety Gibbon',
  websiteUrl: 'https://mamma-mia.sitespire.co.za',
  vercelUrl: 'https://mammamiacakesandcatering.vercel.app',
  dashboardUrl: 'https://mamma-mia.sitespire.co.za/dashboard',
  username: 'Mamma',
  password: 'Mamma2026!',
  contactId: 'test-contact-id-demo',
  trialWebsiteId: 'test-trial-demo',
  llmJudgeScore: 7.8,
  llmJudgeRecommendation: 'Strong — ready for client review',
}

console.log('Sending test build-ready email to', process.env.BUILD_NOTIFY_EMAIL || 'sean@sitespire.co.za')
const result = await sendBuildReadyEmail(payload)
console.log('Result:', JSON.stringify(result))
if (!result.success) process.exit(1)
