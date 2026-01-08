import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function PrivacyPolicyPage({ params }: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  // Obtener datos de contacto
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <article className="py-16 md:py-24 bg-background">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                imSoft, Inc. (hereinafter, "the Company", "we", "our" or "us") is committed to protecting your privacy and personal data. This Privacy Notice describes how we collect, use, store, protect, and share your personal information when you use our website and services. By using our services, you agree to the practices described in this notice. We recommend that you read this document carefully to understand our privacy practices.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Data Controller</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The controller of your personal data is imSoft, Inc., with address in Mexico. For any matter related to the processing of your personal data, you can contact us through our contact page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect different types of personal and non-personal information:
                </p>
                
                <h3 className="text-xl font-semibold mb-3 mt-4">2.1. Information You Provide Directly to Us</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Identification data: full name, email address, phone number, postal address.</li>
                  <li>Account information: username, password (encrypted), account preferences.</li>
                  <li>Contact information: when you communicate with us through forms, email, or chat.</li>
                  <li>Payment information: billing data, credit card information (processed securely through certified payment providers), transaction history.</li>
                  <li>Project information: details about requested projects, requirements, technical specifications.</li>
                  <li>Provided content: any information, files, documents, or content that you submit or upload through our services.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-4">2.2. Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Usage data: pages visited, time spent, links clicked, browsing patterns.</li>
                  <li>Device information: device type, operating system, browser, IP address, unique device identifiers.</li>
                  <li>Location information: approximate geographic location based on your IP address (we do not collect precise GPS location without your explicit consent).</li>
                  <li>Cookies and similar technologies: we use cookies, web beacons, tracking pixels, and similar technologies to collect information about your interaction with our website.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-4">2.3. Third-Party Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may receive information about you from third parties, such as payment service providers, social media platforms (if you connect through them), authentication services, and other service providers we use to operate our business.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Purposes of Personal Data Processing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Service provision:</strong>{' '}
                    Provide, maintain, improve, and personalize our services, process your requests, manage your account, and fulfill our contractual obligations.
                  </li>
                  <li>
                    <strong className="text-foreground">Communication:</strong>{' '}
                    Respond to your inquiries, send you information about our services, important notifications, updates, and service-related communications.
                  </li>
                  <li>
                    <strong className="text-foreground">Payment processing:</strong>{' '}
                    Process payments, manage invoices, prevent fraud, and comply with tax and legal obligations related to transactions.
                  </li>
                  <li>
                    <strong className="text-foreground">Service improvement:</strong>{' '}
                    Analyze the use of our services, conduct research, develop new features, and improve user experience.
                  </li>
                  <li>
                    <strong className="text-foreground">Security:</strong>{' '}
                    Protect our services, detect and prevent fraud, abuse, illegal activities, and ensure the security of our systems and users.
                  </li>
                  <li>
                    <strong className="text-foreground">Legal compliance:</strong>{' '}
                    Comply with legal obligations, respond to government requests, enforce our terms and conditions, and protect our legal rights.
                  </li>
                  <li>
                    <strong className="text-foreground">Marketing (with your consent):</strong>{' '}
                    Send you marketing communications, promotions, special offers, and newsletters, only if you have given your explicit consent.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We process your personal information based on the following legal bases:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Contract performance: when necessary to fulfill a contract you have with us or to take steps before entering into a contract.</li>
                  <li>Consent: when you have given your explicit consent for the processing of your personal data for specific purposes.</li>
                  <li>Legal obligation: when processing is necessary to comply with a legal obligation to which we are subject.</li>
                  <li>Legitimate interest: when processing is necessary for our legitimate interests or those of a third party, provided that your interests or fundamental rights are not overridden.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Sharing and Disclosure of Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, rent, or market your personal information to third parties. However, we may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Service providers:</strong>{' '}
                    We share information with trusted service providers who help us operate our business, such as hosting providers, payment services, analytics services, email services, and other technical providers. These providers are contractually obligated to maintain the confidentiality and security of your information.
                  </li>
                  <li>
                    <strong className="text-foreground">Legal compliance:</strong>{' '}
                    We may disclose information if required by law, court order, legal process, or government request, or to protect our rights, property, or safety, or that of our users or third parties.
                  </li>
                  <li>
                    <strong className="text-foreground">Business transfers:</strong>{' '}
                    In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction.
                  </li>
                  <li>
                    <strong className="text-foreground">With your consent:</strong>{' '}
                    We may share your information with third parties when you have given us your explicit consent to do so.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your personal data may be transferred and stored on servers located outside your country of residence, including countries that may have different data protection laws. By using our services, you consent to the transfer of your information to these countries. We implement appropriate safeguards, including standard contractual clauses and other security measures, to protect your personal information during these transfers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement appropriate technical, administrative, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, loss, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Data encryption in transit and at rest using industry-standard encryption technologies.</li>
                  <li>Strict access controls and multi-factor authentication for systems containing sensitive information.</li>
                  <li>Regular monitoring of our systems to detect and prevent unauthorized activities.</li>
                  <li>Regular training of our staff on data security and privacy practices.</li>
                  <li>Regular backups and disaster recovery plans.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  However, no method of transmission over the Internet or method of electronic storage is 100% secure. Although we strive to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes described in this notice, unless the law requires or permits a longer retention period. The criteria we use to determine retention periods include: (a) the time necessary to provide our services; (b) whether there is a legal obligation requiring us to retain the data; (c) whether there is a legitimate business need to retain the data; and (d) whether there is a risk of litigation or investigation. When we no longer need your personal information, we will securely delete or anonymize it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Your Data Protection Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Right of access:</strong>{' '}
                    You have the right to request a copy of the personal information we have about you.
                  </li>
                  <li>
                    <strong className="text-foreground">Right of rectification:</strong>{' '}
                    You have the right to request the correction of inaccurate or incomplete information.
                  </li>
                  <li>
                    <strong className="text-foreground">Right of erasure:</strong>{' '}
                    You have the right to request the deletion of your personal information in certain circumstances, subject to our legal retention obligations.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to object:</strong>{' '}
                    You have the right to object to the processing of your personal data for certain purposes, such as direct marketing.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to restriction of processing:</strong>{' '}
                    You have the right to request the restriction of processing of your personal data in certain circumstances.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to data portability:</strong>{' '}
                    You have the right to receive your personal data in a structured and commonly used format, and to transmit it to another data controller.
                  </li>
                  <li>
                    <strong className="text-foreground">Right to withdraw consent:</strong>{' '}
                    When processing is based on your consent, you have the right to withdraw it at any time, without affecting the lawfulness of processing based on consent before its withdrawal.
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise any of these rights, you can contact us through our contact page. We will respond to your request within a reasonable time and in accordance with applicable law. We may request additional information from you to verify your identity before processing your request.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies, web beacons, tracking pixels, and similar technologies to collect information about your use of our website. Cookies are small text files that are stored on your device when you visit our website. We use the following types of cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Essential cookies:</strong>{' '}
                    Necessary for the basic functioning of the website and cannot be disabled.
                  </li>
                  <li>
                    <strong className="text-foreground">Functionality cookies:</strong>{' '}
                    Allow the website to remember your preferences and provide enhanced functionality.
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics cookies:</strong>{' '}
                    Help us understand how visitors interact with our website by collecting information anonymously.
                  </li>
                  <li>
                    <strong className="text-foreground">Marketing cookies:</strong>{' '}
                    Used to track visitors across websites with the intention of displaying relevant ads (only with your consent).
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can set your browser to refuse cookies or to alert you when cookies are being sent. However, if you refuse cookies, some parts of our website may not function properly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected personal information from a child without verifiable parental consent, we will take steps to delete that information from our servers. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Links to Third-Party Websites</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites that are not operated by us. We have no control over the content, privacy policies, or practices of these third-party websites. We strongly recommend that you review the privacy policies of any third-party websites you visit. We are not responsible for the privacy practices or content of third-party websites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Changes to this Privacy Notice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Notice occasionally to reflect changes in our practices, services, or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Notice on this page and updating the "Last updated" date at the top. In case of material changes, we may also notify you by email or through a prominent notice on our website. We recommend that you periodically review this notice to be informed about how we protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Supervisory Authority</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you believe that the processing of your personal data violates applicable data protection law, you have the right to file a complaint with the data protection supervisory authority in your country of residence. However, we recommend that you first contact us to try to resolve any concerns you may have.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions, comments, concerns, or requests related to this Privacy Notice or our privacy practices, you can contact us through our contact page. We are committed to responding to your inquiries in a timely manner and working with you to resolve any concerns you may have about the processing of your personal data.
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Last updated: January 2026. By using our services, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Notice.
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  );
}
