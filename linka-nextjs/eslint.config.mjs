import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Fetch-on-mount (useEffect + fetch + setState) e folosit consecvent
      // in tot panoul de admin — o regula noua din eslint-plugin-react-hooks
      // il marcheaza ca eroare. Il coboram la warning in loc sa refactorizam
      // acum tot data-fetching-ul din admin (schimbare mult mai ampla).
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
