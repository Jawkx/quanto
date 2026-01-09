import { useState, useMemo } from 'react';

const MAX_DIGITS = 12;

export type Operator = '÷' | '×' | '+' | '−';

export type HistoryRow = {
  left: number;
  op: Operator;
  right: number;
  result: number;
};

function calculate(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : 0;
  }
}

export function useCalculator() {
  const [input, setInput] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);

  const currentValue = useMemo(() => Number(input || '0'), [input]);
  const isCalculating = operator !== null && firstOperand !== null;
  const operatorsEnabled = input !== '0' || firstOperand !== null;

  const result = useMemo(() => {
    if (!isCalculating) return currentValue;
    return calculate(firstOperand, currentValue, operator);
  }, [isCalculating, firstOperand, currentValue, operator]);

  const handleKeyPress = (value: string) => {
    if (value === 'C') {
      setInput('0');
      setFirstOperand(null);
      setOperator(null);
      setHistoryRows([]);
      return;
    }

    if (value === '⌫') {
      setInput((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    setInput((prev) => {
      if (prev === '0') return value;
      if (prev.length >= MAX_DIGITS) return prev;
      return prev + value;
    });
  };

  const handleOperatorPress = (op: Operator) => {
    if (!operatorsEnabled) return;

    if (isCalculating) {
      const newFirst = calculate(firstOperand, currentValue, operator);
      setHistoryRows((prev) => ([
        ...prev,
        { left: firstOperand, op: operator, right: currentValue, result: newFirst },
      ]));
      setFirstOperand(newFirst);
      setOperator(op);
      setInput('0');
    } else {
      setHistoryRows([]);
      setFirstOperand(currentValue);
      setOperator(op);
      setInput('0');
    }
  };

  const handleEquals = () => {
    if (!isCalculating) return;
    const finalResult = calculate(firstOperand, currentValue, operator);
    setHistoryRows((prev) => ([
      ...prev,
      { left: firstOperand, op: operator, right: currentValue, result: finalResult },
    ]));
    setInput(String(Math.round(finalResult)));
    setFirstOperand(null);
    setOperator(null);
  };

  return {
    input,
    currentValue,
    firstOperand,
    operator,
    historyRows,
    isCalculating,
    operatorsEnabled,
    result,
    handleKeyPress,
    handleOperatorPress,
    handleEquals,
  };
}
