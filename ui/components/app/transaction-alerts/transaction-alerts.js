import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { PriorityLevels } from '../../../../shared/constants/gas';
import {
  submittedPendingTransactionsSelector,
  getKnownMethodData,
} from '../../../selectors';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { BannerAlert, ButtonLink, Text } from '../../component-library';
import SimulationErrorMessage from '../../ui/simulation-error-message';
import { SEVERITIES } from '../../../helpers/constants/design-system';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import { getMethodName } from '../../../helpers/utils/metrics';
import { TransactionType } from '../../../../shared/constants/transaction';

import { isSuspiciousResponse } from '../../../../shared/modules/security-provider.utils';
///: BEGIN:ONLY_INCLUDE_IN(blockaid)
import BlockaidBannerAlert from '../security-provider-banner-alert/blockaid-banner-alert/blockaid-banner-alert';
///: END:ONLY_INCLUDE_IN
import SecurityProviderBannerMessage from '../security-provider-banner-message/security-provider-banner-message';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
  MetaMetricsEventName,
  ///: END:ONLY_INCLUDE_IN
} from '../../../../shared/constants/metametrics';

const TransactionAlerts = ({
  userAcknowledgedGasMissing,
  setUserAcknowledgedGasMissing,
  txData,
}) => {
  const { estimateUsed, hasSimulationError, supportsEIP1559, isNetworkBusy } =
    useGasFeeContext();
  const pendingTransactions = useSelector(submittedPendingTransactionsSelector);
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);


  ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
  const onClickSupportLink = useCallback(() => {
    const { txParams = {} } = txData;
    const methodData = useSelector(
      (state) => getKnownMethodData(state, txParams.data) || {},
    );

    trackEvent({
      category: MetaMetricsEventCategory.Transactions,
      event: MetaMetricsEventName.ExternalLinkClicked,
      properties: {
        action: 'Confirm Screen',
        legacy_event: true,
        recipientKnown: null,
        functionType:
          'confirm' ||
          getMethodName(methodData.name) ||
          TransactionType.contractInteraction,
        origin: txData?.origin,
        external_link_clicked: true,
        security_alert_support_link: ZENDESK_URLS.SUPPORT_URL,
      },
    });
  }, []);
  ///: END:ONLY_INCLUDE_IN

  return (
    <div className="transaction-alerts">
      {
        ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
        <BlockaidBannerAlert
          onClickSupportLink={onClickSupportLink}
          securityAlertResponse={txData?.securityAlertResponse}
        />
        ///: END:ONLY_INCLUDE_IN
      }
      {isSuspiciousResponse(txData?.securityProviderResponse) && (
        <SecurityProviderBannerMessage
          securityProviderResponse={txData.securityProviderResponse}
        />
      )}

      {supportsEIP1559 && hasSimulationError && (
        <SimulationErrorMessage
          userAcknowledgedGasMissing={userAcknowledgedGasMissing}
          setUserAcknowledgedGasMissing={setUserAcknowledgedGasMissing}
        />
      )}
      {supportsEIP1559 && pendingTransactions?.length > 0 && (
        <BannerAlert severity={SEVERITIES.WARNING}>
          <Text as="p">
            <strong>
              {pendingTransactions?.length === 1
                ? t('pendingTransactionSingle', [pendingTransactions?.length])
                : t('pendingTransactionMultiple', [
                    pendingTransactions?.length,
                  ])}
            </strong>{' '}
            {t('pendingTransactionInfo')}
            {t('learnCancelSpeeedup', [
              <ButtonLink
                key="cancelSpeedUpInfo"
                href={ZENDESK_URLS.SPEEDUP_CANCEL}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('cancelSpeedUp')}
              </ButtonLink>,
            ])}
          </Text>
        </BannerAlert>
      )}
      {estimateUsed === PriorityLevels.low && (
        <BannerAlert
          data-testid="low-gas-fee-alert"
          severity={SEVERITIES.WARNING}
        >
          {t('lowPriorityMessage')}
        </BannerAlert>
      )}
      {supportsEIP1559 && isNetworkBusy ? (
        <BannerAlert severity={SEVERITIES.WARNING}>
          {t('networkIsBusy')}
        </BannerAlert>
      ) : null}
    </div>
  );
};

TransactionAlerts.propTypes = {
  userAcknowledgedGasMissing: PropTypes.bool,
  setUserAcknowledgedGasMissing: PropTypes.func,
  txData: PropTypes.object,
};

export default TransactionAlerts;
