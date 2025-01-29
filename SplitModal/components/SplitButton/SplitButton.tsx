import React from 'react';

import { currency } from '@utils/numbers';
import { RubleSign } from '@components/Blocks/RubleSign';

import SplitIcon from '@images/icons/split-icon.svg';
import SplitChevron from '@images/icons/split-chevron-right.svg';

import styles from './SplitButton.module.scss';

interface SplitButtonArgs {
  splitSum: number;
}

export function SplitButton({ splitSum }: SplitButtonArgs) {
  return (
    <button type="button" className={styles.splitButton}>
      <div className={styles.infoContainer}>
        <img src={SplitIcon} className={styles.splitIcon} alt="Долями" />4 платежа по{' '}
        {currency(splitSum)}&nbsp;
        <RubleSign />
      </div>
      <img src={SplitChevron} className={styles.splitChevron} alt="Узнать больше" />
    </button>
  );
}
