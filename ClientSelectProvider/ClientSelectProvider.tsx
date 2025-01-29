import React from 'react';

import _ from 'lodash';

import { Nullable } from '@REDACTED/helper-types';

import { useAutocomplete, useLocalStorage } from 'src/shared/hooks';
import {
  LocalStorageKeys,
  SelectClientItemFragment,
  SelectClientsListQuery,
  SelectClientsListQueryVariables,
  useRootCompanyByIdLazyQuery,
} from 'src/shared/types';
import { CLIENTS_LIST_QUERY } from 'src/shared/types/graphql/client';

import { ClientSelectContext } from './ClientSelectContext';

export const ClientSelectProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedClient, setSelectedClient, purgeValue] = useLocalStorage<
    Nullable<SelectClientItemFragment>
  >(LocalStorageKeys.RootClient, null);
  const [getRootCompany] = useRootCompanyByIdLazyQuery({ fetchPolicy: 'network-only' });

  React.useEffect(() => {
    // Purge selectedClient if it's not on the server
    if (selectedClient) {
      getRootCompany({
        variables: {
          rootCompanyId: selectedClient.id || '',
        },
        onCompleted: data => {
          if (
            !data.company?.getRootCompanyById ||
            data.company?.getRootCompanyById?.id !== selectedClient.id
          ) {
            purgeValue();
          }
        },
      });
    }
  }, []);

  const { options, onSearchChange, loading, resetSearch, fetchMore } = useAutocomplete<
    SelectClientsListQuery,
    SelectClientsListQueryVariables,
    SelectClientItemFragment
  >(
    CLIENTS_LIST_QUERY,
    {
      variables: { limit: 10, offset: 0 },
    },
    {
      dataPath: 'company.available',
      searchQuery: searchString => ({ name: searchString }),
    },
  );

  const refetchClient = React.useCallback(
    (id: Nullable<string>) => {
      getRootCompany({
        variables: {
          rootCompanyId: id || '',
        },
        onCompleted: data => {
          if (!_.isNil(data.company?.getRootCompanyById)) {
            setSelectedClient(data.company?.getRootCompanyById as SelectClientItemFragment);
          }
        },
        // TODO: for some reason this func does not work
        // without specifing the nextFetchPolicy
        nextFetchPolicy: 'network-only',
      });
    },
    [setSelectedClient, getRootCompany],
  );

  const providerProps = React.useMemo(() => {
    if (!selectedClient && options.length) {
      setSelectedClient(options[0]);
    }

    return {
      clientsList: options,
      selectedClient,
      setSelectedClient,
      loading,
      resetSearch,
      fetchMore,
      onSearchChange,
      refetchClient,
    };
  }, [
    selectedClient,
    options,
    setSelectedClient,
    loading,
    resetSearch,
    fetchMore,
    onSearchChange,
    refetchClient,
  ]);

  return (
    <ClientSelectContext.Provider value={providerProps}>{children}</ClientSelectContext.Provider>
  );
};