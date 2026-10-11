import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';

export default function PrivacyPolicy(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title='Privacy Policy'>
      <main className='privacy-policy'>
        <h2>Privacy Policy</h2>

        <section>
          <h3>1. Our commitment</h3>
          <p>
            Strive Journal knows that you take your privacy seriously. We do, too. We are transparent about what we do with your personal data and we give you control over it. We don’t sell your personal data, and we don’t use it for advertising. In this Privacy Policy we explain which personal data we process, why, where it is stored, who helps us process it, how long we keep it and what your rights are.
          </p>
          <p>
            This Privacy Policy was last modified on 11 October 2026.
          </p>
        </section>

        <section>
          <h3>2. Who we are</h3>
          <p>
            Strive Journal is the website <a href="https://strivejournal.com">https://strivejournal.com</a> (“Website”) and the mobile app Strive Journal (“App”). Both are run by Bamco IT, a sole proprietorship of Remco Simonides registered with the Dutch Chamber of Commerce (KvK) under number 72737581. Bamco IT is the controller of your personal data under the General Data Protection Regulation (GDPR).
          </p>
          <p>
            For any question about your personal data, contact us at <a href="mailto:support@strivejournal.com">support@strivejournal.com</a>.
          </p>
        </section>

        <section>
          <h3>3. Your data is stored in Europe</h3>
          <p>
            Strive Journal is hosted in the European Union. Your account, your goals, your exercises, your photos and videos and our back end all run on Google Cloud (Firebase) in Europe: the database in the EU multi-region (Belgium and the Netherlands), our servers in Belgium and the Netherlands, and files and backups in the EU multi-region. Our emails are sent from Ireland.
          </p>
          <p>
            A few services we use are run from outside the EU. They are listed in section 5, together with how your data is protected when it leaves the EU.
          </p>
        </section>

        <section>
          <h3>4. What we process and why</h3>

          <h4>4.1 Your account</h4>
          <p>
            To create an account we need your name or username, your email address and a password. You can also sign in with your Google or Apple account; we then receive your name and email address from them (Apple may give us a private relay address instead). You can add a profile picture. We process this data because it is necessary to provide Strive Journal to you.
          </p>

          <h4>4.2 Your goals</h4>
          <p>
            Depending on how you use Strive Journal, we process your goals and their roadmap, milestones, story, posts, photos and videos, comments and chat, an optional location, the people you follow and who follows you, and the people you support. We process this data because it is necessary to provide Strive Journal to you.
          </p>
          <p>
            For every goal you choose who can see it:
          </p>
          <ul>
            <li>Invited users only - only the people you invite can see the goal. An invite link contains a token that is valid for 24 hours.</li>
            <li>Everyone - anyone can see the goal, its roadmap and its story, and it can be found through search in Strive Journal.</li>
          </ul>
          <p>
            The chat of a goal can only be read by its admins, achievers and supporters, never by people without an account or by people who only follow the goal. See the <a href="https://blog.strivejournal.com/goal/team">team guide</a> for what each role can do. Think carefully about what you share and with whom.
          </p>

          <h4>4.3 Exercises</h4>
          <p>
            The exercises (such as Affirmations, Daily Gratitude, Dear Future Self, Self Reflect and Wheel of Life) can hold very personal information. They are private: no other user can see them. Their content is stored encrypted, with a key that is unique to your account. Our servers only decrypt it to deliver the exercise to you, for example to send you a letter from your past self, an affirmation or a summary of your reflection. We never read your exercises and we never share them with anyone.
          </p>

          <h4>4.4 AI coach and categories</h4>
          <p>
            Strive Journal uses OpenAI to help you with your goals. When you create a goal, its title, description and milestones are sent to OpenAI to give the goal categories. When you ask for a roadmap or chat with the AI coach, the goal and your messages are sent to OpenAI to write the answer. OpenAI does not use this data to train its models. Exercises are never sent to OpenAI. We process this data because it is part of the service you use.
          </p>

          <h4>4.5 Search</h4>
          <p>
            To let people find goals and other users, we keep a search index with Algolia. It contains the title, image, categories and location of goals that are visible to everyone, and the username and profile picture of every user. Goals that are not visible to everyone are never in it.
          </p>

          <h4>4.6 Notifications and email</h4>
          <p>
            We send push notifications through Firebase Cloud Messaging, for which we store a token for your device. You can turn push notifications off in the App or on your device.
          </p>
          <p>
            You receive emails that are necessary to provide Strive Journal, such as a password reset or a change to our legal documents. With your consent we also send you emails about activity on your goals and occasional updates. You can unsubscribe from those at any time with the link in each email or in your settings.
          </p>

          <h4>4.7 Connected services</h4>
          <p>
            You can connect Strava to log your activities on a goal. We then receive the activities you allow Strava to share, and we store what is needed to keep the connection working. You can disconnect Strava at any time.
          </p>
          <p>
            You can also create API keys or connect an AI assistant to Strive Journal (through our API or MCP server). That application can then read and change your goals on your behalf. You choose which applications you connect and you can revoke their access at any time in your settings. What those applications do with your data is covered by their own privacy policies.
          </p>

          <h4>4.8 Keeping Strive Journal working</h4>
          <p>
            We use Sentry to find and fix errors. When something goes wrong, or when a page or request is slow, Sentry receives technical information such as the error, the page or request, your device and browser type and the app version. We process this data based on our legitimate interest in a working and secure app.
          </p>
          <p>
            To understand how Strive Journal is used, we keep a nightly copy of goals, profiles and goal activity in Google BigQuery in the EU. Exercises, email addresses, device tokens and notifications are left out. Each night the copy is replaced by a new one.
          </p>
        </section>

        <section>
          <h3>5. Who helps us process your data</h3>
          <p>
            We use these service providers. Each of them only processes your data on our behalf and under a data processing agreement.
          </p>
          <ul>
            <li>Google Cloud and Firebase (Google) - hosting, database, file storage, sign-in and push notifications. Data stored in the EU.</li>
            <li>Amazon Web Services - sending email. Sent from Ireland (EU).</li>
            <li>OpenAI - AI coach and goal categories (section 4.4). United States.</li>
            <li>Algolia - search (section 4.5). United States.</li>
            <li>Sentry - error and performance monitoring (section 4.8). United States.</li>
          </ul>
          <p>
            When your data is processed in the United States, it is protected by the EU-U.S. Data Privacy Framework or by the Standard Contractual Clauses of the European Commission.
          </p>
          <p>
            Google and Apple (when you sign in with them) and Strava (when you connect it) are independent services you choose to use; their own privacy policies apply.
          </p>
        </section>

        <section>
          <h3>6. How long we keep your data</h3>
          <p>
            We keep your data for as long as you have an account. You can delete your goals, posts, comments and exercises at any time.
          </p>
          <p>
            You can delete your account in the App under Edit profile. We then delete your profile, your exercises, your notifications, your profile picture, your search entry and your sign-in account, and you leave all of your goals. A goal that has no members left is deleted, including its story, posts and media. Goals you share with others stay available to them. Comments you wrote on other people’s goals are not deleted automatically; delete them first, or ask us to.
          </p>
          <p>
            Copies of deleted data can remain in our nightly analytics copy and in backups for up to 7 days.
          </p>
        </section>

        <section>
          <h3>7. What rights do you have?</h3>
          <p>
            You have the right to access your data, to have it corrected or erased, to restrict or object to its processing and to receive it in a portable format. Where we rely on your consent, you can withdraw it at any time.
          </p>
          <p>
            To exercise these rights, contact us at <a href="mailto:support@strivejournal.com">support@strivejournal.com</a>. We answer within one month.
          </p>
          <p>
            If you are not satisfied with how we handle your data, you can file a complaint with the Dutch Data Protection Authority (<a href="https://autoriteitpersoonsgegevens.nl">Autoriteit Persoonsgegevens</a>) or the data protection authority in your own country.
          </p>
        </section>

        <section>
          <h3>8. Age</h3>
          <p>
            Strive Journal is meant for people aged 16 and over. If you are younger, please ask a parent or guardian before you create an account.
          </p>
        </section>

        <section>
          <h3>9. Changes to this policy</h3>
          <p>
            We may change this Privacy Policy when Strive Journal or the services we use change. We will tell you about important changes by email or in the App. The date at the top shows when it last changed.
          </p>
        </section>
      </main>
    </Layout>
  );
}