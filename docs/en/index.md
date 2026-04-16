---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'DaData SDK'
  text: 'Unofficial toolkit for Dadata.ru API'
  tagline: Full API contract in TypeScript and JSON-schema, full-featured "suggestions" component for Vue, playground to test "suggestions" API, and more.
  actions:
    - theme: brand
      text: Playground
      link: /en/demo
    - theme: alt
      text: All Dadata API endpoints
      link: /en/api/
    - theme: alt
      text: In Russian
      link: /ru

features:
  - title: Attention!
    details: |
      This documentation was developed in 2025, at a time when the official OpenAPI specification had not yet been published.
      Since then (as of March 2026), much has changed, and although this unofficial documentation is still useful, it needs to be updated for compatibility with the official specification. If you want to help, join us <a href="https://github.com/alexchexes/dadata-sdk">on GitHub</a>.
      </br></br>

      Official OpenAPI schemas:</br>
      1. <a href="https://dadata.ru/files/openapi/cleaner.yml">cleaner.yml</a> — “Standardization”. Methods such as clean/address, clean/phone and similar. </br>
      2. <a href="https://dadata.ru/files/openapi/suggestions.yml">suggestions.yml</a> — “Suggestions” and search. Methods like suggest, findById, geolocate, and others. </br>
      3. <a href="https://dadata.ru/files/openapi/profile.yml">profile.yml</a> — personal account. Balance, statistics, versions. </br>

      </br>

      The documentation is in the early stages of development. The site may change frequently, but we strive to make it as user-friendly as possible.
      <br>
      <a href="https://github.com/alexchexes/dadata-sdk">Click here</a> to go to GitHub if you want to help.
---
