import React from 'react';

import { Modal } from '@components/Blocks/Modal';
import { SplitButton, SplitModalContent } from './components';

interface SplitModalArgs {
  splitPrice: number;
}

export function SplitModal({ splitPrice }: SplitModalArgs) {
  return (
    <Modal
      title="Оплатите 25% от стоимости покупки"
      description="Оставшиеся 3 части спишутся автоматически с шагом в две недели"
      trigger={<SplitButton splitSum={splitPrice} />}
      content={<SplitModalContent splitSum={splitPrice} />}
    />
  );
}
