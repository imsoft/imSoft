import { FooterSection } from "@/components/blocks/footer-section";
import { HeroHeader } from "@/components/blocks/hero-section";
import { getDictionary, hasLocale } from '../dictionaries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function TermsAndConditionsPage({ params }: {
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
              Terms and Conditions
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-8 leading-relaxed">
                These Terms and Conditions govern the use of the website and services provided by imSoft, Inc. (hereinafter, "the Company", "we", "our" or "us"). By accessing, browsing, or using this website and our services, you (hereinafter, "the User", "you" or "your") agree to be bound by these terms. If you do not agree with any part of these terms, you must immediately cease using our services.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Services:</strong>{' '}
                    Refers to all services, products, software, applications, and content provided by imSoft, Inc., including but not limited to web development, mobile applications, technology consulting, and related services.
                  </li>
                  <li>
                    <strong className="text-foreground">Content:</strong>{' '}
                    Includes all material present on the website, including text, graphics, logos, icons, images, audio, video, software, source code, and any other information or material.
                  </li>
                  <li>
                    <strong className="text-foreground">User:</strong>{' '}
                    Any person who accesses, browses, or uses the website or our services, whether as a visitor, client, or in any other capacity.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By accessing and using this website or our services, you declare and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>You have the legal capacity to enter into binding contracts.</li>
                  <li>You have read, understood, and agree to be bound by these terms and conditions.</li>
                  <li>You will comply with all applicable laws and regulations in your jurisdiction.</li>
                  <li>All information provided is truthful, accurate, and up-to-date.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Description of Services</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  imSoft, Inc. provides software development, web and mobile applications, technology consulting, and related services. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Modify, suspend, or discontinue any aspect of our services at any time without prior notice.</li>
                  <li>Refuse, limit, or cancel access to our services to any user, for any reason, at our sole discretion.</li>
                  <li>Establish limits on the use of our services, including but not limited to storage limits, bandwidth, or number of requests.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to use our services only for lawful purposes and in accordance with these terms. It is strictly prohibited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Use our services for any illegal, fraudulent activity or that violates third-party rights.</li>
                  <li>Attempt unauthorized access to our systems, other users' accounts, or confidential information.</li>
                  <li>Transmit viruses, malware, malicious code, or any other harmful element.</li>
                  <li>Interfere with, disrupt, or overload our services, servers, or networks.</li>
                  <li>Reverse engineer, decompile, or disassemble any software provided by us.</li>
                  <li>Use robots, scrapers, or any automated method to access our services without authorization.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All content on the website, including but not limited to text, graphics, logos, icons, images, photographs, audio, video, software, source code, data compilations, site design and layout, is the exclusive property of imSoft, Inc. or its licensors and is protected by copyright, trademark, patent, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the website solely for personal and non-commercial purposes. This license does not include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>The right to reproduce, distribute, modify, create derivative works, publicly display, or commercially use any content.</li>
                  <li>The use of any trademark, logo, or trade name without our prior written consent.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Contracts and Payments</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you contract our services:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Specific project terms, including scope, deadlines, prices, and payment conditions, will be established in a separate written contract.</li>
                  <li>All prices are subject to change without prior notice until a formal contract is signed.</li>
                  <li>Payments must be made according to the terms agreed in the contract. Failure to pay may result in suspension or termination of services.</li>
                  <li>All prices are expressed in the currency specified in the contract and may be subject to applicable taxes.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Cancellations and Refunds</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cancellation and refund policies will be established in the specific contract for each project. In general:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Cancellations must be notified in writing with the advance notice specified in the contract.</li>
                  <li>Refunds, if applicable, will be calculated based on completed work and costs incurred up to the cancellation date.</li>
                  <li>No refunds will be made for services already delivered and accepted by the client.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Warranties and Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our services are provided "as is" and "as available". To the maximum extent permitted by applicable law:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, and security.</li>
                  <li>WE SHALL NOT BE LIABLE for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from the use or inability to use our services.</li>
                  <li>Our total liability to you for any claim related to our services shall not exceed the total amount paid by you to us in the twelve (12) months preceding the event giving rise to the claim.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless imSoft, Inc., its affiliates, directors, employees, agents, and licensors from and against any claim, demand, loss, liability, and expense (including reasonable legal fees) arising from or related to: (a) your use of our services; (b) your violation of these terms; (c) your violation of any third-party rights; or (d) any content that you provide or transmit through our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Privacy and Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The use of our services is also subject to our Privacy Policy, which is an integral part of these terms. By using our services, you agree to the practices described in our Privacy Policy. We recommend that you carefully read our Privacy Policy to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right to terminate or suspend your access to our services, without prior notice, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Violation of these terms and conditions.</li>
                  <li>Fraudulent, illegal, or unauthorized use of our services.</li>
                  <li>Failure to pay for contracted services.</li>
                  <li>Any activity that, in our sole discretion, may harm our reputation or that of our users.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms and conditions at any time. Modifications will take effect immediately after being posted on this website. Your continued use of our services after the posting of modifications constitutes your acceptance of the modified terms. If you do not agree with the modifications, you must cease using our services immediately. We recommend that you periodically review these terms to be informed of any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Applicable Law and Jurisdiction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions shall be governed by and construed in accordance with the laws of Mexico, without giving effect to its conflict of law provisions. Any dispute arising from or related to these terms or our services shall be submitted to the exclusive jurisdiction of the competent courts of Mexico. If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. General Provisions</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>These terms constitute the entire agreement between you and imSoft, Inc. regarding the use of our services and supersede all prior agreements.</li>
                  <li>Our failure to exercise or enforce any right or provision of these terms shall not constitute a waiver of such right or provision.</li>
                  <li>You may not transfer or assign these terms or your rights or obligations under these terms without our prior written consent.</li>
                  <li>If any provision of these terms is found to be invalid, illegal, or unenforceable, the remaining provisions will continue in full force and effect.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions, comments, or concerns about these terms and conditions, you can contact us through our contact page or by email. We are committed to responding to your inquiries within a reasonable time.
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Last updated: January 2026. By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
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
