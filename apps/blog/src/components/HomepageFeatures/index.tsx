import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: string;
  link: string;
  linkLabel: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Getting Started',
    icon: '🚀',
    description: 'New to Strive? Start here to learn the basics and set up your first goal.',
    link: '/intro',
    linkLabel: 'Get started',
  },
  {
    title: 'Guides',
    icon: '📖',
    description: 'Learn how to get the most out of every feature in Strive Journal.',
    link: '/category/goal',
    linkLabel: 'Browse guides',
  },
  {
    title: 'Blog',
    icon: '✍️',
    description: 'Read about goal setting strategies, new releases, and more.',
    link: '/blog',
    linkLabel: 'Read the blog',
  },
];

function Feature({title, icon, description, link, linkLabel}: FeatureItem) {
  return (
    <div className={styles.featureCol}>
      <Link to={link} className={styles.featureCard}>
        <span className={styles.featureIcon}>{icon}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
        <span className={styles.featureLink}>{linkLabel} →</span>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
