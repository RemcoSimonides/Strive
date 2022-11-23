// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strive Blog',
  tagline: 'Everything you need to know to increase your chance of reaching your goal',
  url: 'https://blog.strivejournal.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'strive', // Usually your GitHub org/user name.
  // projectName: 'blog', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/remcosimonides/strive/apps/blog/src',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/remcosimonides/strive/apps/blog/src',
          blogTitle: 'Strive Journal Blog',
          blogDescription: 'Everything you need to know to increase your chance of achieving your long-term goals',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Strive Blog',
        logo: {
          alt: 'Strive Flag',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Guides',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'right'
          },
          // {
          //   href: 'https://github.com/remcosimonides/strive/apps/blog/src',
          //   label: 'GitHub',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guides',
            items: [
              {
                label: 'Goal',
                to: '/category/goal',
              },
              {
                label: 'Support',
                to: '/category/support',
              },
              {
                label: 'Exercises',
                to: '/category/exercises',
              },
              {
                label: 'Profile',
                to: '/category/profile',
              },
              {
                label: 'Create the Perfect Goal',
                to: '/category/create-the-perfect-goal',
              }
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/strive-journal',
              },
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/strivejournal/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/journalstrive',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Strive Journal, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
