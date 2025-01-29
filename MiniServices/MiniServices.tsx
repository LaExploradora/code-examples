import React from 'react';
import cn from 'classnames';

import { useMiniServices } from '@hooks/useMiniServices';
import { MiniServiceItem } from '@customTypes/product';

import { MiniServiceBlock } from './components';

import styles from './MiniServices.module.scss';

interface MiniServicesProps {
  customServices?: MiniServiceItem[];
  header?: string;
  mini?: boolean;
  hasGoogleEvent?: boolean;
  eventPrefix?: string;
}

export function MiniServices({
  customServices,
  header,
  mini,
  hasGoogleEvent,
  eventPrefix,
}: MiniServicesProps) {
  const services = useMiniServices();
  return (
    <div
      className={cn({
        [styles.wrapper]: true,
        [styles.mini]: mini,
      })}
    >
      {header && <h2 className={styles.servicesTitle}>{header}</h2>}
      <div className={styles.services}>
        {(customServices || services).map((s: MiniServiceItem) => (
          <MiniServiceBlock
            service={s}
            key={s.url}
            mini={mini}
            hasGoogleEvent={hasGoogleEvent}
            eventPrefix={eventPrefix}
          />
        ))}
      </div>
    </div>
  );
}
