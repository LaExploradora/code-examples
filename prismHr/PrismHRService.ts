import config from '../../config';
import { fetch } from '../../utils';
import { HttpStatus } from 'src/constants';

import {
  GetPrehireDetailsArgs,
  GetPrehireDetailsResponseType,
  UpdateEmployeeFieldsArgs,
  UpdateEmployeeFieldsResponseType,
} from './types';

const PRISMHR_API_URL =
  config.env.PRISMHR_API_URL || '<REDACTED>';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const EXPIRED_USER_SESSION_MESSAGE = 'this user session has expired';

interface GenericResponseType {
  errorCode?: string;
  errorMessage?: string;
  [key: string]: any;
}

export class PrismHRService {
  constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly peoId: string,
  ) {
    this.username = username;
    this.password = password;
    this.peoId = peoId;
  }

  private prismHrSessionId = '';

  /**
   * Check if we need to restart a session based on the
   * server response
   * @param errorCode Request error code
   * @param errorMessage Request error message
   * @returns {Boolean} Should we restart the session or not?
   */

  shouldRestartSession(errorCode?: string, errorMessage?: string): boolean {
    return (
      errorMessage === EXPIRED_USER_SESSION_MESSAGE && Number(errorCode) === HttpStatus.UNAUTHORIZED
    );
  }

  async withSessionManagement<T extends GenericResponseType>(
    operation: () => Promise<T>,
  ): Promise<T> {
    const response = await operation();

    // Let the callback itself decide if a session retry is needed inside it's own logic
    if (this.shouldRestartSession(response.errorCode, response.errorMessage)) {
      console.log('Session retry condition met, restarting the session and the operation');
      await this.startPeoSession();
      return await operation();
    }

    return response;
  }

  /**
   * Start a PrismHR PEO Session and get the ID
   * @returns {object} PrismHR PEO Session ID
   */

  async startPeoSession() {
    try {
      const payload = {
        username: this.username,
        password: this.password,
        peoId: this.peoId,
      };

      const { sessionId } = await fetch.urlencodedPost<{ sessionId: string }, typeof payload>(
        `${PRISMHR_API_URL}/login/v1/createPeoSession`,
        payload,
        {
          headers: {
            ...DEFAULT_HEADERS,
          },
        },
      );

      console.log('PrismHR Session ID: ', sessionId);

      this.prismHrSessionId = sessionId;

      return { sessionId };
    } catch (err) {
      console.error('Something went wrong while creating a PrismHR PEO session');
      throw err;
    }
  }

  /**
   * Send a PrismHR PEO Session keepalive request
   */

  async keepSessionAlive() {
    try {
      const payload = {};

      const { updateMessage } = await fetch.urlencodedPost<
        { updateMessage: string },
        typeof payload
      >(`${PRISMHR_API_URL}/login/v1/keepAlive`, payload, {
        headers: {
          ...DEFAULT_HEADERS,
          sessionId: this.prismHrSessionId,
        },
      });

      console.log(`Session updated: ${updateMessage}`);
    } catch (err) {
      console.error(`Something went wrong while keeping the PrismHR PEO session alive`);
      throw err;
    }
  }

  /**
   * Get PrismHR Prehire Details
   * @param {string} clientId - PrismHR Client ID
   * @param {string} prehireId - PrismHR Prehire ID
   * @returns
   */

  async getPrehireDetails({
    clientId,
    prehireId,
  }: GetPrehireDetailsArgs): Promise<GetPrehireDetailsResponseType> {
    return await this.withSessionManagement(async () => {
      try {
        const payload = { clientId, prehireId };

        const response = await fetch.urlencodedPost<GetPrehireDetailsResponseType, typeof payload>(
          `${PRISMHR_API_URL}/newHire/v1/getPrehireDetails`,
          payload,
          {
            headers: { ...DEFAULT_HEADERS, sessionId: this.prismHrSessionId },
          },
        );

        return response;
      } catch (err) {
        console.error('Error during getting Prism HR Prehire Details: ', err);
        throw err;
      }
    });
  }

  /**
   * Update PrismHR Employee fields
   * @param {string} clientId - PrismHR Client ID
   * @param {string} employeeId - PrismHR Employee ID
   * @param {boolean} taxCreditEmp - Is prehire a tax credit hire
   * @returns
   */

  async updateEmployeeFields({
    clientId,
    employeeId,
    taxCreditEmp,
  }: UpdateEmployeeFieldsArgs): Promise<UpdateEmployeeFieldsResponseType> {
    return await this.withSessionManagement(async () => {
      const payload = {
        clientId,
        employeeId,
        taxCreditEmp,
      };

      const response = await fetch.post<UpdateEmployeeFieldsResponseType>(
        `${PRISMHR_API_URL}/employee/v1/updateEmployeeFields`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            sessionId: this.prismHrSessionId,
          },
        },
      );

      return response;
    });
  }
}
