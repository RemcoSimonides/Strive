// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Strive Blog',
  tagline: 'Everything you need to know to increase your chance of reaching your goal',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://blog.strivejournal.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/remcosimonides/strive/apps/blog/src',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/remcosimonides/strive/apps/blog/src',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Strive Blog',
        logo: {
          alt: 'Strive Flag',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'right',
            label: 'Guides',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'right'
          }
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
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
              {
                label: 'GitHub',
                href: 'https://github.com/remcosimonides/strive',
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
                label: 'Privacy Policy',
                to: '/privacy-policy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Strive Journal, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
