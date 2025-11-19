// Vitest + RTL: include jest-dom with Vitest-specific type augmentations
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto cleanup between tests to avoid DOM leakage across cases
afterEach(() => {
  cleanup();
});
