import mte from 'eslint-config-mte';
import { configs as litConfigs } from 'eslint-plugin-lit';
import { configs as wcConfigs } from 'eslint-plugin-wc';
import { config } from 'typescript-eslint';

export default config(
  wcConfigs['flat/best-practice'],
  litConfigs['flat/recommended'],
  {
    settings: {
      elementBaseClasses: ['LitElement', 'RealTimeElement', 'BaseElement'],
    },
    rules: {
      'wc/guard-super-call': 'off',
      'wc/no-method-prefixed-with-on': 'error',
      'wc/require-listener-teardown': 'off',

      'lit/attribute-names': ['error', { convention: 'kebab' }],
      'lit/lifecycle-super': 'error',
      'lit/no-legacy-imports': 'error',
      'lit/no-this-assign-in-render': 'error',
      'lit/no-useless-template-literals': 'error',
      'lit/no-value-attribute': 'error',
      'lit/prefer-nothing': 'error',
    },
  },
  ...mte,
);
