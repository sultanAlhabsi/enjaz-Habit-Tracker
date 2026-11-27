import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';

jest.mock('@expo/vector-icons', () => {
  const ReactActual = require('react');
  const { Text: RNText } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => ReactActual.createElement(RNText, null, name),
  };
});

describe('Common UI Components', () => {
  test('Button renders title and invokes onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="حفظ العادة" onPress={onPress} />);

    fireEvent.press(getByText('حفظ العادة'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('Button does not invoke onPress while loading or disabled', () => {
    const onPress = jest.fn();
    const { getByRole, rerender } = render(<Button title="حفظ" onPress={onPress} disabled />);

    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();

    rerender(<Button title="حفظ" onPress={onPress} loading />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('EmptyState displays title, description, and optional action button', () => {
    const onActionPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon="leaf-outline"
        title="لا توجد عادات بعد"
        description="ابدأ بإضافة أول عادة يومية لك"
        actionTitle="إضافة عادة"
        onActionPress={onActionPress}
      />
    );

    expect(getByText('لا توجد عادات بعد')).toBeTruthy();
    expect(getByText('ابدأ بإضافة أول عادة يومية لك')).toBeTruthy();

    fireEvent.press(getByText('إضافة عادة'));
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  test('ErrorBoundary catches render errors and recovers on retry', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;

    const UnstableChild: React.FC = () => {
      if (shouldThrow) {
        throw new Error('Test crash');
      }
      return <Text>تمت الاستعادة بنجاح</Text>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <UnstableChild />
      </ErrorBoundary>
    );

    expect(getByText('حدث خطأ غير متوقع')).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByText('إعادة المحاولة الآن'));

    expect(getByText('تمت الاستعادة بنجاح')).toBeTruthy();
    consoleErrorSpy.mockRestore();
  });
});
