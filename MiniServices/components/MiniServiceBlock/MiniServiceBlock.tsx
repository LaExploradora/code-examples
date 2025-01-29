import React from 'react';
import { Link } from 'gatsby';
import cn from 'classnames';

import { MiniServiceItem } from '@customTypes/product';
import { RubleSign } from '@components/Blocks/RubleSign';
import { event } from '@analytics/gtm';

import styles from './MiniServiceBlock.module.scss';

interface MiniServiceBlockProps {
  service: MiniServiceItem;
  mini: boolean;
  hasGoogleEvent?: boolean;
  eventPrefix?: string;
}

export function MiniServiceBlock({
  service,
  mini,
  hasGoogleEvent = false,
  eventPrefix,
}: MiniServiceBlockProps) {
  const { title, color, url, icon, subtitle, miniSubtitle, price } = service;

  const handleClick = () => {
    if (hasGoogleEvent) {
      const splittedUrl = url?.split('/');
      const lastPartOfUrl = splittedUrl[splittedUrl.length - 1];
      event(`event_mini_service_${eventPrefix}_to_${lastPartOfUrl}`);
    }
  };

  return (
    <Link
      to={url}
      className={cn({
        [styles.block]: true,
        [styles.miniBlock]: mini,
      })}
      style={{ background: color }}
      onClick={handleClick}
    >
      <img alt={title} className={styles.icon} src={icon.localFile.publicURL} />
      <div className={styles.metadata}>
        <div className={styles.info}>
          <h2 className={styles.title}>{title}</h2>
          {price && (
            <div className={styles.price}>
              {price}
              &nbsp;
              <RubleSign />
            </div>
          )}
        </div>
        <div
          className={styles.subtitle}
          dangerouslySetInnerHTML={{ __html: mini ? miniSubtitle : subtitle }}
        />
      </div>
    </Link>
  );
}
