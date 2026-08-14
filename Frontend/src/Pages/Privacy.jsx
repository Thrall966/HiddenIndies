// privacy policy page
function Privacy() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-[#2b2b2b]">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-xs text-[#9a9a90] mb-6">Last updated: 14/08/2026</p>

      <h2 className="font-semibold mt-5 mb-1">1. Introduction</h2>
      <p className="text-sm text-[#4a4a44]">This Privacy Policy explains what personal data HiddenIndies collects, how it is used, and the rights you have over it. It is written to align with the principles of the UK General Data Protection Regulation (UK GDPR).</p>

      <h2 className="font-semibold mt-5 mb-1">2. What we collect</h2>
      <p className="text-sm text-[#4a4a44]">When you register and use HiddenIndies, we collect your username and email address, your password (stored only in a securely hashed form and never as plain text), and the reviews, ratings, and wishlist entries you create. We do not collect payment information, and we do not use third-party advertising or analytics tracking.</p>

      <h2 className="font-semibold mt-5 mb-1">3. How we use your data</h2>
      <p className="text-sm text-[#4a4a44]">Your data is used only to operate the platform: to authenticate you when you log in, to display your reviews and ratings, to maintain your wishlist, and to power the discovery features. We do not sell or share your personal data with third parties.</p>

      <h2 className="font-semibold mt-5 mb-1">4. Storage</h2>
      <p className="text-sm text-[#4a4a44]">Your data is stored in the platform's own database. Passwords are hashed using the bcrypt algorithm and are never returned in any response or displayed.</p>

      <h2 className="font-semibold mt-5 mb-1">5. Your rights</h2>
      <p className="text-sm text-[#4a4a44]">Under the UK GDPR, you have the right to access your personal data and to have it erased. In line with the right to erasure under Article 17, you may delete your account at any time from your profile page, at which point your personal data is removed from the platform.

When you choose to delete your account, you are presented with two options.

The first option anonymises your account. Your personal information, including your username and email address, is removed so that it can no longer be linked to you, while the ratings you contributed are kept in an anonymised form that can no longer be associated with an identifiable individual. Choosing this option helps preserve the integrity of the community rating data and the discovery algorithm that depends on it, so that your past contributions continue to benefit other users even after you leave.

The second option is a complete deletion, which removes your personal information together with all of your ratings and reviews from the platform entirely.</p>

      <h2 className="font-semibold mt-5 mb-1">6. Cookies and local storage</h2>
      <p className="text-sm text-[#4a4a44]">HiddenIndies does not use tracking cookies. A login token is stored in your browser's local storage to keep you signed in, and it is removed when you log out.</p>

      <h2 className="font-semibold mt-5 mb-1">7. Contact</h2>
      <p className="text-sm text-[#4a4a44]">As this is an academic project, questions about this policy can be directed to the project author.</p>

      <h2 className="font-semibold mt-5 mb-1">8. Changes</h2>
      <p className="text-sm text-[#4a4a44]">This policy may be updated from time to time, and the date at the top reflects the latest version.</p>
    </div>
  );
}

export default Privacy;