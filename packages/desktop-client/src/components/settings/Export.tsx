// @ts-strict-ignore
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { format } from 'date-fns';

import { type State } from 'loot-core/client/state-types';
import { type PrefsState } from 'loot-core/client/state-types/prefs';
import { send } from 'loot-core/src/platform/client/fetch';

import { theme } from '../../style';
import { Block } from '../common/Block';
import { ButtonWithLoading } from '../common/Button';
import { Text } from '../common/Text';

import { Setting } from './UI';

export function ExportBudget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const budgetId = useSelector<State, PrefsState['local']['id']>(
    state => state.prefs.local.id,
  );
  const encryptKeyId = useSelector<State, PrefsState['local']['encryptKeyId']>(
    state => state.prefs.local.encryptKeyId,
  );

  async function onExport() {
    setIsLoading(true);
    setError(null);

    const response = await send('export-budget');

    if ('error' in response) {
      setError(response.error);
      setIsLoading(false);
      console.log('Export error code:', response.error);
      return;
    }

    window.Actual.saveFile(
      response.data,
      `${format(new Date(), 'yyyy-MM-dd')}-${budgetId}.zip`,
      'Export budget',
    );
    setIsLoading(false);
  }

  return (
    <Setting
      primaryAction={
        <>
          <ButtonWithLoading onClick={onExport} loading={isLoading}>
            Export data
          </ButtonWithLoading>
          {error && (
            <Block style={{ color: theme.errorText, marginTop: 15 }}>
              An unknown error occurred while exporting. Please report this as a
              new issue on Github.
            </Block>
          )}
        </>
      }
    >
      <Text>
        <strong>Export</strong> your data as a zip file containing{' '}
        <code>db.sqlite</code> and <code>metadata.json</code> files. It can be
        imported into another Actual instance by closing an open file (if any),
        then clicking the “Import file” button, then choosing “Actual.”
      </Text>
      {encryptKeyId ? (
        <Text>
          Even though encryption is enabled, the exported zip file will not have
          any encryption.
        </Text>
      ) : null}
    </Setting>
  );
}
