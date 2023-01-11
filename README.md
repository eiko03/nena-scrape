
## _Pagination scrapping for National Emergency Number Association_


## Instruction

- `node index.js` will scrape all pages
- `node index.js {start} {end}` will scrape pages between `{start}` and `{end}`
- `node index.js {start} -` will only scrape {start} page
- `{start}` and `{end}` flags will only apply when they are numeric or `-`
- sql file will be created on root
- sql replaces data rather than insert to ignore duplicate data
