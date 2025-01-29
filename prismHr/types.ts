export interface GetPrehireDetailsArgs {
  clientId: string;
  prehireId: string;
}

export type PrehireType = {
  eeFirstName: string;
  eeMiddleName: string;
  eeLastName: string;
  eeBirthDate: string;
  eeSSN: string;
  eeAddressOne: string;
  eeAddressTwo: string;
  eeCity: string;
  eeState: string;
  eeZipcode: string;
  eeCellPhone: string;
  eePersonalEmail: string;
  ecEmployeeId: string;
};

export type GetPrehireDetailsResponseType = {
  errorCode: string;
  errorMessage: string;
  extension: {
    any: object;
  };
  prehires: PrehireType[];
};

export type UpdateEmployeeFieldsResponseType = {
  updateMessage: string;
};

export interface UpdateEmployeeFieldsArgs {
  clientId: string;
  employeeId: string;
  taxCreditEmp: boolean;
}
