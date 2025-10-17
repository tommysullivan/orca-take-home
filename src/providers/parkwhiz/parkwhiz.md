# parkwhiz

1. has a daily static json feed but without pricing
2. other apis require oauth (which requires partner account)
3. so, reverse eng the public html to acquire the data

# Steps

Given a use case of ORD, LAX airport codes and a date range of **\_**, here is the process:

1. Call the autocomplete URL with the term=[airport code here] ideally with as few additional parameters as might be required to get the correct result:

`GET https://api.parkwhiz.com/internal/v1/autocomplete/?term=ORD&proximity=41.98056%2C-87.885705&routing_style=parkwhiz&results=6&country=us%2Cca&cohort=control`

2. This yields a json like the [autocomplete.json](./autocomplete.json) page in this folder

3. The "slug" of the first value should be assumed to be the right airport url

4. Make an additional http request to the domain with that slug and it will return an html file similar to [lookup.html](./lookup.html)

5. The json we need to do the lookup is in a script tag in the body, where it sets window.**INITIAL_STATE** to the desired json

6. From here we get the locations json.
