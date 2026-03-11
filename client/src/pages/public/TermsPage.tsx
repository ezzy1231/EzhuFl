export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1
        className="mb-6 text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Terms of Service
      </h1>
      <p
        className="mb-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Last updated: March 11, 2026
      </p>

      <div
        className="space-y-6 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using EzhuInfluence ("the Platform"), you agree to be
            bound by these Terms of Service. If you do not agree, please do not
            use the Platform.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            2. Description of Service
          </h2>
          <p>
            EzhuInfluence is a creator marketplace that connects brands with
            social media influencers for marketing collaborations. Businesses can
            create campaigns, and creators can participate by submitting content
            to earn rewards based on engagement metrics.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            3. User Accounts
          </h2>
          <p>
            You may sign up using email/password, Google, or TikTok. You are
            responsible for maintaining the security of your account credentials.
            You must provide accurate and complete information during
            registration.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            4. User Roles
          </h2>
          <p>
            <strong>Creators/Influencers:</strong> May browse campaigns, join
            them, submit content, and earn rewards based on content performance.
          </p>
          <p className="mt-2">
            <strong>Businesses:</strong> May create and manage campaigns, set
            budgets, and review influencer submissions. Business accounts require
            verification before creating campaigns.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            5. Content Guidelines
          </h2>
          <p>
            All content submitted must comply with the respective social media
            platform's community guidelines. Content must not be illegal,
            harmful, threatening, abusive, defamatory, or otherwise
            objectionable.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            6. Payments and Earnings
          </h2>
          <p>
            Earnings are calculated based on content engagement metrics (views,
            likes, comments) as defined by each campaign. The Platform facilitates
            payment distribution but is not responsible for delays caused by third
            parties.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            7. Third-Party Services
          </h2>
          <p>
            The Platform integrates with third-party services including TikTok,
            Google, and Supabase for authentication and data. Your use of these
            services is subject to their respective terms and privacy policies.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            8. Limitation of Liability
          </h2>
          <p>
            The Platform is provided "as is" without warranties of any kind. We
            shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms. You may delete your account at any time by contacting
            support.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            10. Changes to Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Platform after changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            11. Contact
          </h2>
          <p>
            If you have questions about these Terms, please contact us through the
            Platform.
          </p>
        </section>
      </div>
    </div>
  );
}
