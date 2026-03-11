export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1
        className="mb-6 text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Privacy Policy
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
            1. Information We Collect
          </h2>
          <p>
            <strong>Account Information:</strong> When you sign up, we collect
            your name, email address, and role (Creator or Business). If you sign
            in with Google or TikTok, we receive your profile information
            (display name, avatar, and username) from those services.
          </p>
          <p className="mt-2">
            <strong>Profile Information:</strong> Depending on your role, you may
            provide additional information such as phone number, city, bio,
            social media handles, business license details, and profile photos.
          </p>
          <p className="mt-2">
            <strong>Content Data:</strong> When you submit content to campaigns,
            we collect video URLs and engagement metrics (views, likes, comments)
            from supported social media platforms.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            2. How We Use Your Information
          </h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>To create and manage your account</li>
            <li>To connect creators with business campaigns</li>
            <li>To calculate engagement scores and earnings</li>
            <li>To verify business and influencer accounts</li>
            <li>To display leaderboards and campaign results</li>
            <li>To improve and maintain the Platform</li>
          </ul>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            3. TikTok Data
          </h2>
          <p>
            When you log in with TikTok, we access your basic profile information
            including your display name, username, avatar, and bio. This data is
            used to pre-fill your creator profile and facilitate campaign
            participation. We do not post content to your TikTok account.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            4. Data Sharing
          </h2>
          <p>
            We do not sell your personal information. Your profile information may
            be visible to other users of the Platform (e.g., businesses can see
            creator profiles on leaderboards). We use the following third-party
            services:
          </p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>
              <strong>Supabase:</strong> Authentication and database hosting
            </li>
            <li>
              <strong>Google OAuth:</strong> Optional sign-in method
            </li>
            <li>
              <strong>TikTok Login Kit:</strong> Optional sign-in method and
              profile data
            </li>
            <li>
              <strong>Vercel:</strong> Application hosting
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            5. Data Security
          </h2>
          <p>
            We implement appropriate security measures to protect your
            information. Authentication tokens are securely managed through
            Supabase. However, no method of transmission over the internet is
            100% secure.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            6. Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active. You
            may request account deletion by contacting us, after which your data
            will be removed within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            7. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Export your data in a portable format</li>
          </ul>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            8. Cookies
          </h2>
          <p>
            We use essential cookies and local storage to maintain your
            authentication session. We do not use tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            9. Children's Privacy
          </h2>
          <p>
            The Platform is not intended for users under the age of 13. We do not
            knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            users of significant changes through the Platform.
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
            If you have questions about this Privacy Policy or your data, please
            contact us through the Platform.
          </p>
        </section>
      </div>
    </div>
  );
}
