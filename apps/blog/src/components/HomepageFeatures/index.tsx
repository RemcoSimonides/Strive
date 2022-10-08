import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Getting Started',
    Svg: require('@site/static/img/theo-superman-square.svg').default,
    description: (
      <>
        This is where it all starts
      </>
    ),
  },
  {
    title: 'Guides',
    Svg: require('@site/static/img/theo-crossroad-square.svg').default,
    description: (
      <>
        Get the most out of Strive Journal and read about how to set goals but also every possible feature available.
      </>
    ),
  },
  {
    title: 'Blog',
    Svg: require('@site/static/img/theo-contract-square.svg').default,
    description: (
      <>
        Information about goal setting, new releases, mentions in the media and much more...
      </>
    ),
  }
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
