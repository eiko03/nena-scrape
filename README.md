
## _Pagination scrapping for National Emergency Number Association_


## Instruction

- `node index` will scrape all pages
- `node index {start} {end}` will scrape pages between `{start}` and `{end}`
- `node index {start}` will scrape pages from `{start}` to the end of all pages
- `node index {start} -` will only scrape `{start}` page
- `{start}` and `{end}` flags will only apply when they are numeric or `-` for `{end}`
- `NENACompanyParser.sql` file will be created on root
- sql replaces data rather than insert to ignore duplicate data
