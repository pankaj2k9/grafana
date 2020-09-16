import { Registry, RegistryItem } from '../utils/Registry';
import { FieldType } from '../types/dataFrame';

export enum ValueFilterID {
  regex = 'regex',
  isNull = 'isNull',
  isNotNull = 'isNotNull',
  greater = 'greater',
  greaterOrEqual = 'greaterOrEqual',
  lower = 'lower',
  lowerOrEqual = 'lowerOrEqual',
  equal = 'equal',
  notEqual = 'notEqual',
  range = 'range',
}

// The test function that will be called to see if the value matches or not
type ValueFilterTestFunction = (value: any) => boolean;

// The functino that will create and return the ValueFilterTestFunction built the filterOptions parameters
type ValueFilterInstanceCreator = (filterOptions: Record<string, any>) => ValueFilterInstance;

// The instance of the filter, with the test function and some validity info
export interface ValueFilterInstance {
  isValid: boolean;
  test: ValueFilterTestFunction;
  invalidArgs?: string[];
  expression1Invalid?: boolean;
  expression2Invalid?: boolean;
}

//
// Test functions
//

function testRegexCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let { filterArgs } = filterOptions;
  let regex = filterArgs?.regex ?? '';
  console.log('regex', regex);

  // The filter configuration
  const re = new RegExp(regex);

  return {
    isValid: true,
    test: value => {
      if (value === null) {
        return false;
      }
      return re.test(value);
    },
  };
}

function testIsNullCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  return {
    isValid: true,
    test: value => value === null,
  };
}

function testIsNotNullCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  return {
    isValid: true,
    test: value => value !== null,
  };
}

function testGreaterCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let { filterExpression, fieldType } = filterOptions;

  if (filterExpression === '' || filterExpression === null) {
    return { isValid: false, test: value => true };
  }

  let compare: any = null;

  // For a Number, compare as number
  if (fieldType === FieldType.number) {
    compare = Number(filterOptions.filterExpression);
    if (isNaN(compare)) {
      compare = null;
    }
  }

  return {
    isValid: compare !== null,
    test: value => value > compare,
  };
}

function testGreaterOrEqualCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let { filterExpression, fieldType } = filterOptions;

  if (filterExpression === '' || filterExpression === null) {
    return { isValid: false, test: value => true };
  }

  let compare: any = null;

  // For a Number, compare as number
  if (fieldType === FieldType.number) {
    compare = Number(filterOptions.filterExpression);
    if (isNaN(compare)) {
      compare = null;
    }
  }

  return {
    isValid: compare !== null,
    test: value => value >= compare,
  };
}

function testLowerCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let { filterExpression, fieldType } = filterOptions;

  if (filterExpression === '' || filterExpression === null) {
    return { isValid: false, test: value => true };
  }

  let compare: any = null;

  // For a Number, compare as number
  if (fieldType === FieldType.number) {
    compare = Number(filterOptions.filterExpression);
    if (isNaN(compare)) {
      compare = null;
    }
  }

  return {
    isValid: compare !== null,
    test: value => value < compare,
  };
}

function testLowerOrEqualCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let { filterExpression, fieldType } = filterOptions;

  if (filterExpression === '' || filterExpression === null) {
    return { isValid: false, test: value => true };
  }

  let compare: any = null;

  // For a Number, compare as number
  if (fieldType === FieldType.number) {
    compare = Number(filterOptions.filterExpression);
    if (isNaN(compare)) {
      compare = null;
    }
  }

  return {
    isValid: compare !== null,
    test: value => value <= compare,
  };
}

function testEqualCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let compare: any = filterOptions.filterExpression || '';
  return {
    isValid: compare !== null,
    // eslint-disable-next-line eqeqeq
    test: value => value == compare, // Loose equality so we don't need to bother about types
  };
}

function testNotEqualCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  let compare: any = filterOptions.filterExpression || '';
  return {
    isValid: compare !== null,
    // eslint-disable-next-line eqeqeq
    test: value => value != compare, // Loose equality so we don't need to bother about types
  };
}

function testRangeCreator(filterOptions: Record<string, any>): ValueFilterInstance {
  // We need a specific interval format : [min,max] or ]min,max[ (accepting spacing and +- before the values)
  const { filterExpression, filterExpression2 } = filterOptions;

  if (filterExpression === null || filterExpression2 === null || filterExpression === '' || filterExpression2 === '') {
    return {
      isValid: false,
      test: value => true,
    };
  }

  let min = Number(filterExpression);
  let max = Number(filterExpression2);
  if (isNaN(min) || isNaN(max)) {
    return {
      isValid: false,
      test: value => true,
      expression1Invalid: isNaN(min),
      expression2Invalid: isNaN(max),
    };
  }

  return {
    isValid: true,
    test: (value: any) => value >= min && value <= max,
  };
}

//
//	List of value filters (Registry)
//

// The type that fills the registry of available ValueFilters, with their id, definition, description, etc.
export interface ValueFilterInfo extends RegistryItem {
  // Inherited fom RegistryItem
  //   id: string; // Unique Key -- saved in configs
  //   name: string; // Display Name, can change without breaking configs
  //   description?: string;
  //   aliasIds?: string[]; // when the ID changes, we may want backwards compatibility ('current' => 'last')
  //   excludeFromPicker?: boolean; // Exclude from selector options

  placeholder?: string; // Place holder for filter expression input
  placeholder2?: string; // Second placeholder for 2 input fields
  getInstance: ValueFilterInstanceCreator;
  supportedFieldTypes?: FieldType[]; // If defined, support only those field types
}

export const valueFiltersRegistry = new Registry<ValueFilterInfo>(() => [
  {
    id: ValueFilterID.regex,
    name: 'Regex',
    getInstance: testRegexCreator,
    placeholder: 'Regular expression',
  },
  {
    id: ValueFilterID.isNull,
    name: 'Is Null',
    getInstance: testIsNullCreator,
  },
  {
    id: ValueFilterID.isNotNull,
    name: 'Is Not Null',
    getInstance: testIsNotNullCreator,
  },
  {
    id: ValueFilterID.greater,
    name: 'Greater',
    getInstance: testGreaterCreator,
    supportedFieldTypes: [FieldType.number],
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.greaterOrEqual,
    name: 'Greater or Equal',
    getInstance: testGreaterOrEqualCreator,
    supportedFieldTypes: [FieldType.number],
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.lower,
    name: 'Lower',
    getInstance: testLowerCreator,
    supportedFieldTypes: [FieldType.number],
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.lowerOrEqual,
    name: 'Lower or Equal',
    getInstance: testLowerOrEqualCreator,
    supportedFieldTypes: [FieldType.number],
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.equal,
    name: 'Equal',
    getInstance: testEqualCreator,
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.notEqual,
    name: 'Different',
    getInstance: testNotEqualCreator,
    placeholder: 'Value',
  },
  {
    id: ValueFilterID.range,
    name: 'Range',
    getInstance: testRangeCreator,
    placeholder: 'Min',
    placeholder2: 'Max',
  },
]);
