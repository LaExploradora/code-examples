import React, { useMemo } from 'react';
import { addDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { RubleSign } from '@components/Blocks/RubleSign';
import { currency } from '@utils/numbers';

import styles from './SplitModalContent.module.scss';

interface SplitModalContentArgs {
  splitSum: number;
}

export function SplitModalContent({ splitSum }: SplitModalContentArgs) {
  const splitDates = useMemo(() => {
    const dates: string[] = ['Сегодня'];
    for (let i = 1; i < 4; i += 1) {
      const currentDate = new Date();
      const date = addDays(currentDate, 14 * i);
      const formattedDate = format(date, 'd MMM', { locale: ru }).replace('.', '');
      dates.push(formattedDate);
    }

    return dates;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitSum]);

  return (
    <>
      <div className={styles.splitGraph}>
        {splitDates.map((splitDate) => (
          <div className={styles.splitGraphItem} key={splitDate}>
            <p className={styles.splitGraphItemTitle}>{splitDate}</p>
            <p className={styles.splitGraphItemPrice}>
              {currency(splitSum)}&nbsp;
              <RubleSign />
            </p>
          </div>
        ))}
      </div>
      <div className={styles.info}>
        Подробнее о сервисе можно узнать на{' '}
        <a
          href="https://dolyame.ru"
          target="_blank"
          rel="noreferrer"
          className={styles.infoLink}
          tabIndex={-1}
        >
          dolyame.ru
        </a>
      </div>
    </>
  );
}
