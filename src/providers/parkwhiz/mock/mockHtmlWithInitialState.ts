export const mockHtmlWithInitialState = `
<!DOCTYPE html>
<html>
<head><title>LAX Airport Parking</title></head>
<body>
<script>
window.__INITIAL_STATE__={
  "locations": [
    {
      "location_id": "12345",
      "type": "offstreet", 
      "distance": {
        "straight_line": {
          "feet": 5280,
          "meters": 1609
        }
      },
      "purchase_options": [{
        "id": "purchase_001",
        "start_time": "2024-12-20T08:00:00.000-08:00",
        "end_time": "2024-12-21T20:00:00.000-08:00",
        "price": { "USD": "24.00" },
        "space_availability": { "status": "available" },
        "amenities": [
          {
            "name": "Shuttle",
            "key": "shuttle",
            "description": "Free Shuttle",
            "enabled": true,
            "visible": true
          },
          {
            "name": "Covered",
            "key": "indoor", 
            "description": "Covered",
            "enabled": true,
            "visible": true
          }
        ]
      }],
      "_embedded": {
        "pw:location": {
          "id": "12345",
          "name": "QuikPark LAX Garage",
          "description": "Covered garage near LAX",
          "address1": "123 Airport Blvd",
          "city": "Los Angeles", 
          "state": "CA",
          "postal_code": "90045",
          "location_type": "garage",
          "entrances": [
            {
              "coordinates": [33.9425, -118.4081]
            }
          ]
        }
      }
    },
    {
      "location_id": "67890",
      "type": "offstreet",
      "distance": {
        "straight_line": {
          "feet": 7920,
          "meters": 2414
        }
      },
      "purchase_options": [{
        "id": "purchase_002", 
        "start_time": "2024-12-20T08:00:00.000-08:00",
        "end_time": "2024-12-21T20:00:00.000-08:00",
        "price": { "USD": "18.50" },
        "space_availability": { "status": "available" },
        "amenities": [
          {
            "name": "Shuttle",
            "key": "shuttle",
            "description": "Free Shuttle",
            "enabled": true,
            "visible": true
          },
          {
            "name": "Valet",
            "key": "valet",
            "description": "Valet",
            "enabled": true,
            "visible": true
          }
        ]
      }],
      "_embedded": {
        "pw:location": {
          "id": "67890",
          "name": "Embassy Suites LAX",
          "description": "Hotel parking near airport",
          "address1": "456 Century Blvd",
          "city": "Los Angeles",
          "state": "CA", 
          "postal_code": "90045",
          "location_type": "lot",
          "entrances": [
            {
              "coordinates": [33.9401, -118.4065]
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
