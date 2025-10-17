# parkwhiz

1. has a daily static json feed but without pricing
2. other apis require oauth (which requires partner account)
3. so, reverse eng the public html to acquire the data

# Steps

Given a use case of ORD, LAX airport codes and a date range of **\_**, here is the process:

0. Obtain the bearer token for the public (not logged in) website by first visiting parkwhiz.com and then inspecting it to find the token. An example of the response is in [parkwhiz.html](./parkwhiz.html), inside of a script tag, there is a json with some nesting, and inside eventually u find user.token and user.isLoggedIn - need to grab that user.token value.

1. Call the autocomplete URL with the term=[airport code here] ideally with as few additional parameters as might be required to get the correct result (see hint below on what params to send in request besides the below url):

`GET https://api.parkwhiz.com/internal/v1/autocomplete/?term=ORD&proximity=41.98056%2C-87.885705&routing_style=parkwhiz&results=6&country=us%2Cca&cohort=control`

2. This yields a json like the [autocomplete.json](./autocomplete.json) page in this folder

3. The "slug" of the first value should be assumed to be the right airport url

4. Make an additional http request to the domain with that slug and it will return an html file similar to [lookup.html](./lookup.html)

5. The json we need to do the lookup is in a script tag in the body, where it sets window.**INITIAL_STATE** to the desired json

6. From here we get the locations json.

# Hints

The api.parkwhiz.com call may fail with 401 if called simply, but the website, even with unauthenticated user, is able to invoke it.

here is the chrome-generated fetch that should hopefully work:

```ts
fetch(
  "https://api.parkwhiz.com/internal/v1/autocomplete/?term=ORD&proximity=41.98056%2C-87.885705&routing_style=parkwhiz&results=6&country=us%2Cca&cohort=control",
  {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      authorization: "Bearer [TOKEN FROM STEP 0 HERE!!!]",
      priority: "u=1, i",
      "sec-ch-ua":
        '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-language-locale": "en-us",
      Referer: "https://www.parkwhiz.com/",
    },
    body: null,
    method: "GET",
  }
);
```
