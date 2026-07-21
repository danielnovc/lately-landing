import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Lately handles your memories, photos, speech, purchases and optional AI recaps." };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your memories, explained clearly" title="Privacy Policy" updated="July 20, 2026">
    <p className="legal-lede">Lately is a personal journaling app operated by Daniel Nosevic (“Lately,” “we,” “us,” or “our”). This policy explains what information Lately processes, why it is processed, and the choices available to you.</p>
    <aside><strong>The short version:</strong> your journal starts on your device. iCloud sync is optional. AI recaps are optional and require sending the memories you select to Google Gemini. We do not sell your personal information.</aside>

    <h2>1. Information you provide</h2>
    <h3>Journal content</h3><p>Lately stores the notes, prompts, dates, doodles and other journal details you create in a local SQLite database on your device.</p>
    <h3>Photos</h3><p>If you choose photos from your library, Lately copies the selected images into the app’s storage and associates them with the relevant memory. Lately does not scan or upload your full photo library.</p>
    <h3>Voice and speech transcription</h3><p>When you choose voice entry, Lately requests microphone access and uses Apple’s speech-recognition services to turn speech into text. Depending on device support and Apple’s availability, recognition may happen on-device or through Apple’s network service. Lately stores the resulting text as a memory; it does not intentionally retain an audio recording after transcription.</p>

    <h2>2. iCloud sync</h2><p>If iCloud is available and enabled, Lately synchronizes your journal database and referenced images through the private iCloud container associated with your Apple ID. Apple operates iCloud and controls its infrastructure. You can manage or delete Lately’s iCloud data through your Apple device settings. If iCloud is unavailable, your memories remain only on the device and may be lost when the app is deleted.</p>

    <h2>3. Optional AI recaps</h2><p>Lately can create month and year recaps using Google Gemini. This feature runs only when you request a recap. To provide it, Lately sends the journal text, prompts and selected photos needed for that recap to Google’s Gemini API. Google processes that content to return generated text. Do not include information you do not want processed by an AI provider. AI output can be inaccurate and should not be treated as professional advice.</p>

    <h2>4. Purchases and subscriptions</h2><p>Purchases are processed by Apple through the App Store. Lately uses RevenueCat to retrieve offerings, confirm entitlement status, restore purchases and support subscription management. RevenueCat may process an anonymous app-user identifier, product and purchase information, entitlement status, device/platform information and limited diagnostics. Lately does not receive your full payment-card details.</p>

    <h2>5. Notifications</h2><p>If you grant permission, Lately schedules journaling reminders using Apple notification services. You can disable notifications at any time in iOS Settings. Lately does not require notification permission to use the journal.</p>

    <h2>6. How we use information</h2><ul><li>Provide, maintain and synchronize the journal.</li><li>Transcribe speech and generate recaps you request.</li><li>Confirm paid access and restore purchases.</li><li>Respond to support requests and diagnose failures.</li><li>Protect the service and comply with legal obligations.</li></ul>

    <h2>7. Service providers</h2><p>Information is shared only as necessary with Apple (App Store, speech recognition, notifications and iCloud), Google (Gemini API for requested recaps), and RevenueCat (purchase and entitlement management). Their processing is governed by their own terms and privacy policies.</p>

    <h2>8. Retention and deletion</h2><p>Local journal content remains until you delete the memory, clear app data or remove the app. iCloud copies remain according to your iCloud settings and Lately’s bounded synchronization process. Purchase records may be retained by Apple and RevenueCat as required for transaction, fraud-prevention and legal purposes. To request deletion of support information held directly by us, contact us at the address below.</p>

    <h2>9. Security</h2><p>We use platform protections and minimize the information sent to service providers. No storage or transmission method is completely secure, so we cannot guarantee absolute security. Protect your device passcode and Apple ID.</p>

    <h2>10. Your rights and choices</h2><p>Depending on where you live, you may have rights to access, correct, delete, restrict or object to processing, and to receive a portable copy of personal data. Much of your journal is controlled directly through the app and your iCloud account. You may also withdraw optional permissions in iOS Settings and stop using AI recaps. EEA and UK users may complain to their local data-protection authority.</p>

    <h2>11. International processing</h2><p>Apple, Google and RevenueCat may process information in countries outside your own. Where required, service providers use recognized transfer safeguards.</p>
    <h2>12. Children</h2><p>Lately is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information to us, contact us.</p>
    <h2>13. Changes</h2><p>We may update this policy as Lately changes. We will update the date above and provide additional notice when required by law.</p>
    <h2>14. Contact</h2><p>For privacy questions or requests, email <a href="mailto:support@latelyapp.app">support@latelyapp.app</a>. Lately is operated from Lithuania.</p>
  </LegalPage>;
}
