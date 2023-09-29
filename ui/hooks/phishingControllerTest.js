import { useState } from 'react';
import { PhishingController } from '@metamask/phishing-controller';

/**
 * React hook exposing the functionalities of PhishingController.
 * This allows usage of PhishingController from components.
 *
 * @returns Object with checkPhishing function that accepts a website as an argument.
 */
export function usePhishingController() {
  const [phishingController] = useState(new PhishingController());

  const checkPhishing = async (website) => {
    await phishingController.maybeUpdateState();
    return phishingController.test(website);
  };

  return {
    checkPhishing,
  };
}
