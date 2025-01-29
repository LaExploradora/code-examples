import React from 'react';
import cn from 'classnames';

import { Select as SelectField } from '@periodica-press/ui';

import {
  DELIVERY_DEFAULT_CITY,
  DELIVERY_OPTIONS,
  DELIVERY_OPTION_COURIER,
  DELIVERY_OPTION_PICKUP,
} from '@consts/deliveryConsts';
import { getDeliveryProviderImage } from '@utils/getDeliveryProviderImage';
import { DeliveryInfo } from '@components/Delivery';
import { CityType, DeliveryInfoArgs } from '@customTypes/delivery';
import { getDeliveryWidgetData } from '../../../periodicaApi/deliveryCalculator';
import { fetchCities } from '../../../periodicaApi/deliveryCities';

import Loader from '../Loader';
import { Switcher } from '../Switcher';

import styles from './DeliveryWidget.module.scss';

interface DeliveryWidgetArgs {
  productType: string;
  productSize: string;
}

export function DeliveryWidget({ productType, productSize }: DeliveryWidgetArgs) {
  const [cities, setCities] = React.useState([]);
  const [pickupCities, setPickupCities] = React.useState<CityType[]>([]);
  const [deliveryCities, setDeliveryCities] = React.useState<CityType[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<CityType>(DELIVERY_DEFAULT_CITY);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deliveryType, setDeliveryType] = React.useState(DELIVERY_OPTION_COURIER);
  const [deliveryInfo, setDeliveryInfo] = React.useState([]);
  const [deliveryProvider, setDeliveryProvider] = React.useState<DeliveryInfoArgs | null>(null);

  const isPickupDelivery = deliveryType === DELIVERY_OPTION_PICKUP;

  const handleFetchCities = async () => {
    setIsLoading(true);
    try {
      const citiesData = await fetchCities();
      const deliveryCitiesData = citiesData.filter((city) => city.courier);
      const pickupCitiesData = citiesData.filter((city) => city.pickup);
      setPickupCities(pickupCitiesData);
      setDeliveryCities(deliveryCitiesData);
      setCities(citiesData);
    } catch (err) {
      throw new Error(`Could not fetch cities list: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDeliveryType = (type: string) => {
    if (type === deliveryType) {
      return;
    }
    setDeliveryProvider(null);
    setDeliveryType(type);
  };

  const handleGetDeliveryInfo = React.useCallback(async () => {
    if (productSize) {
      setIsLoading(true);
      const deliveryData = await getDeliveryWidgetData({
        cityId: selectedCity.id,
        items: [{ type: productType, size: productSize, count: 1 }],
        isPickupDelivery: deliveryType === DELIVERY_OPTION_PICKUP,
      });

      setDeliveryInfo(deliveryData);
      setDeliveryProvider(deliveryData[0]);
      setIsLoading(false);
    }
  }, [selectedCity.id, productType, productSize, deliveryType]);

  const handleSetDeliveryProvider = (selectedDeliveryProvider: DeliveryInfoArgs) => {
    setDeliveryProvider(selectedDeliveryProvider);
  };

  const handleChangeCity = (selectedCityId: string) => {
    const cityToSelect = cities.find((city) => city.id === Number(selectedCityId));
    setSelectedCity(cityToSelect);
  };

  React.useEffect(() => {
    handleGetDeliveryInfo();
  }, [handleGetDeliveryInfo, selectedCity.id, deliveryType, productSize]);

  React.useEffect(() => {
    handleFetchCities();
  }, []);

  return (
    <div className={styles.wrapper}>
      <h5>Узнать стоимость и сроки доставки</h5>
      <Switcher
        activeOption={deliveryType}
        options={DELIVERY_OPTIONS}
        onSwitch={handleSetDeliveryType}
        customClassName={styles.switcher}
        disabled={!selectedCity.courier || !selectedCity.pickup}
      />
      <SelectField
        name="city"
        onChange={(value: string) => handleChangeCity(value)}
        values={isPickupDelivery ? pickupCities : deliveryCities}
        value={selectedCity.id}
        customClassName={styles.citySelector}
      />
      {isLoading ? (
        <div className={styles.loader}>
          <Loader />
        </div>
      ) : (
        <>
          <div className={styles.deliveryProvidersWrapper}>
            {deliveryInfo.map((item) => {
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={`provider_${item.delivery_provider}_${deliveryType}`}
                  className={cn({
                    [styles.deliveryProvider]: true,
                    [styles.active]:
                      !!deliveryProvider &&
                      item.delivery_provider === deliveryProvider.delivery_provider,
                  })}
                  onKeyDown={() => handleSetDeliveryProvider(item)}
                  onClick={() => handleSetDeliveryProvider(item)}
                >
                  <img
                    alt="Логотип курьерской службы"
                    className={styles.deliveryProviderLogo}
                    src={getDeliveryProviderImage(item.delivery_provider)}
                  />
                </div>
              );
            })}
          </div>
          {!!deliveryProvider && (
            <DeliveryInfo
              mode="exact"
              deliveryDate={deliveryProvider.date}
              deliveryPrice={deliveryProvider.sum}
              showFreeDeliveryInfo
            />
          )}
        </>
      )}
    </div>
  );
}
