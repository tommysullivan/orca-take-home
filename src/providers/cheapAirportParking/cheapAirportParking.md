Cheap Airport Parking
=====================

1. Call this url with airportcode:

https://www.cheapairportparking.org/parking/find.php?airport=ORD&FromDate=10%2F17%2F2025&from_time=11&ToDate=10%2F17%2F2025&to_time=16

Here is an example fetch generated from chrome dev tools that may shed light on what request headers are required:

```js
fetch("https://www.cheapairportparking.org/parking/find.php?airport=ORD&FromDate=10%2F17%2F2025&from_time=11&ToDate=10%2F17%2F2025&to_time=16", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "src=b-ad; id_visit=336144; _gcl_gs=2.1.k1$i1760724711$u196231934; _gcl_au=1.1.830603908.1760724712; _ga=GA1.1.1534312281.1760724713; airport=ORD; _from=10-17-2025_11; _to=10-17-2025_16; _gcl_aw=GCL.1760724737.CjwKCAjw0sfHBhB6EiwAQtv5qROMDwpVndDhAl8WL_xHaWnZArxiimi29opbnJhgdCy12EFJ-A3coxoCXjsQAvD_BwE; __stripe_mid=c4c559b3-d0d8-43cd-a42c-98d81139684f105db4; __stripe_sid=e3a7da69-110c-4968-b8b9-340972a0a557185c8d; find=3; n_pages=6; _ga_ZPRNV66112=GS2.1.s1760724712$o1$g1$t1760724889$j60$l0$h0"
  },
  "body": null,
  "method": "GET"
});
```

2. An html response comes back (see cheapAirportParking/fixtures/response.html)