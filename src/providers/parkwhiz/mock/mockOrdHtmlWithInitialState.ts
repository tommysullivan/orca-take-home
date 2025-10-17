export const mockOrdHtmlWithInitialState = `
<!DOCTYPE html>
<html>
<head><title>ORD Airport Parking</title></head>
<body>
<script>
window.__INITIAL_STATE__={
  "locations": [
    {
      "location_id": "ord_001",
      "type": "offstreet",
      "distance": {
        "straight_line": {
          "feet": 3960,
          "meters": 1207
        }
      },
      "purchase_options": [{
        "id": "ord_purchase_001",
        "start_time": "2024-12-20T09:00:00.000-06:00",
        "end_time": "2024-12-21T19:00:00.000-06:00",
        "price": { "USD": "19.99" },
        "space_availability": { "status": "available" },
        "amenities": [
          {
            "name": "Shuttle",
            "key": "shuttle",
            "description": "Free Shuttle",
            "enabled": true,
            "visible": true
          }
        ]
      }],
      "_embedded": {
        "pw:location": {
          "id": "ord_001", 
          "name": "Chicago Airport Parking",
          "description": "Convenient ORD parking",
          "address1": "789 Mannheim Rd",
          "city": "Rosemont",
          "state": "IL",
          "postal_code": "60018", 
          "location_type": "garage",
          "entrances": [
            {
              "coordinates": [41.9786, -87.8824]
            }
          ]
        }
      }
    }
  ]
}
</script>
</body>
</html>
`;
