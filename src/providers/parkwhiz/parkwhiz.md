# parkwhiz

1. has a daily static json feed but without pricing
2. other apis require oauth (which requires partner account)
3. so, reverse eng the public html to acquire the data

# Steps

Given a use case of ORD, LAX airport codes and a date range of **\_**, here is the process:

1. Convert the airport code to a retrievable page with parking and pricing data

GET https://api.parkwhiz.com/internal/v1/autocomplete/?term=ORD&proximity=41.98056%2C-87.885705&routing_style=parkwhiz&results=6&country=us%2Cca&cohort=control

```json
{
  "autocomplete": [
    {
      "id": "5",
      "result_type": "venue",
      "full_name": "O'Hare Airport",
      "short_name": "O'Hare Airport",
      "coordinates": [41.98056, -87.885705],
      "slug": "/o-hare-airport-parking/",
      "slugs": {
        "bestparking": "/chicago-il-parking/destinations/o-hare-airport-parking/",
        "parkwhiz": "/o-hare-airport-parking/"
      },
      "city": "Chicago",
      "state": "IL",
      "country": "US",
      "timezone": "America/Chicago",
      "place_id": "",
      "must_resolve": false,
      "score": 0.1
    },
  ]
}
```
