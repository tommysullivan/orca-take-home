/**
 * Mock HTML responses from Cheap Airport Parking API
 * These simulate the actual HTML structure returned by the real API
 * to test the parseHTMLResponse function
 */

export const mockHtmlResponses: Record<string, string> = {
  ORD: `
<!DOCTYPE html>
<html>
<body>
  <div class="listing">
    <div class="listing-left">
      <img src="/images/loews-ohare.jpg" alt="Loews O'Hare">
    </div>
    <div class="listing-right">
      <div class="lot-name">Loews O'Hare Hotel Budget Lot</div>
      <div class="park-type">Indoor Self Park with Shuttle</div>
      <div style="font-size: 16px">92% recommend</div>
      <a class="mylink">127 reviews</a>
      <div style="font-size: 14px">Complimentary shuttle service every 15-20 minutes</div>
      <div onclick="gotoMap('Loews O Hare Hotel Budget Lot', 123, 41.9738, -87.8626)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_ord_001">
        <input type="hidden" name="id_park" value="park_001">
        <div class="dayrate">$18.99 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/easy-parking.jpg" alt="Easy Parking">
    </div>
    <div class="listing-right">
      <div class="lot-name">Easy Parking ORD Economy</div>
      <div class="park-type">Outdoor Self Park</div>
      <div style="font-size: 16px">88% recommend</div>
      <a class="mylink">245 reviews</a>
      <div style="font-size: 14px">24-hour shuttle service</div>
      <div onclick="gotoMap('Easy Parking ORD Economy', 124, 41.9518, -87.8857)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_ord_002">
        <input type="hidden" name="id_park" value="park_002">
        <div class="dayrate">$13.95 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/river-road.jpg" alt="River Road">
    </div>
    <div class="listing-right">
      <div class="lot-name">River Road Budget Parking</div>
      <div class="park-type">Outdoor Self Park</div>
      <div style="font-size: 16px">85% recommend</div>
      <a class="mylink">89 reviews</a>
      <div style="font-size: 14px">Continuous shuttle</div>
      <div onclick="gotoMap('River Road Budget Parking', 125, 41.9751, -87.8741)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_ord_003">
        <input type="hidden" name="id_park" value="park_003">
        <div class="dayrate">$15.50 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/loews-garage.jpg" alt="Loews Garage">
    </div>
    <div class="listing-right">
      <div class="lot-name">Loews O'Hare Budget Garage</div>
      <div class="park-type">Indoor Covered Self Park</div>
      <div style="font-size: 16px">94% recommend</div>
      <a class="mylink">203 reviews</a>
      <div style="font-size: 14px">Free shuttle to terminals</div>
      <div onclick="gotoMap('Loews O Hare Budget Garage', 126, 41.9739, -87.8625)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_ord_004">
        <input type="hidden" name="id_park" value="park_004">
        <div class="dayrate">$19.99 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <!-- Example of unavailable listing -->
  <div class="listing">
    <div class="listing-left">
      <img src="/images/sold-out.jpg" alt="Sold Out">
    </div>
    <div class="listing-right">
      <div class="lot-name">Premium Parking ORD</div>
      <div class="park-type">Indoor Valet</div>
      <div style="font-size: 16px">96% recommend</div>
      <a class="mylink">412 reviews</a>
      <div onclick="gotoMap('Premium Parking ORD', 127, 41.9800, -87.8600)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_ord_005">
        <input type="hidden" name="id_park" value="park_005">
        <div>Not available for selected dates - Sold out</div>
      </form>
    </div>
  </div>
</body>
</html>
  `,

  LAX: `
<!DOCTYPE html>
<html>
<body>
  <div class="listing">
    <div class="listing-left">
      <img src="/images/quikpark.jpg" alt="QuikPark">
    </div>
    <div class="listing-right">
      <div class="lot-name">QuikPark LAX Budget</div>
      <div class="park-type">Outdoor Self Park with Shuttle</div>
      <div style="font-size: 16px">89% recommend</div>
      <a class="mylink">534 reviews</a>
      <div style="font-size: 14px">24/7 shuttle service to all terminals</div>
      <div onclick="gotoMap('QuikPark LAX Budget', 201, 33.9463, -118.3944)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_001">
        <input type="hidden" name="id_park" value="park_201">
        <div class="dayrate">$22.95 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/embassy-suites.jpg" alt="Embassy Suites">
    </div>
    <div class="listing-right">
      <div class="lot-name">Embassy Suites Economy LAX</div>
      <div class="park-type">Outdoor Self Park</div>
      <div style="font-size: 16px">91% recommend</div>
      <a class="mylink">678 reviews</a>
      <div style="font-size: 14px">Complimentary shuttle</div>
      <div onclick="gotoMap('Embassy Suites Economy LAX', 202, 33.9307, -118.4009)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_002">
        <input type="hidden" name="id_park" value="park_202">
        <div class="dayrate">$11.50 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/joes-parking.jpg" alt="Joe's Parking">
    </div>
    <div class="listing-right">
      <div class="lot-name">Joe's Budget Airport Parking</div>
      <div class="park-type">Outdoor Self Park</div>
      <div style="font-size: 16px">87% recommend</div>
      <a class="mylink">321 reviews</a>
      <div style="font-size: 14px">Shuttle every 10 minutes</div>
      <div onclick="gotoMap('Joes Budget Airport Parking', 203, 33.9456, -118.3926)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_003">
        <input type="hidden" name="id_park" value="park_203">
        <div class="dayrate">$16.99 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/sheraton.jpg" alt="Sheraton">
    </div>
    <div class="listing-right">
      <div class="lot-name">Sheraton Gateway Budget LAX</div>
      <div class="park-type">Outdoor Self Park</div>
      <div style="font-size: 16px">90% recommend</div>
      <a class="mylink">456 reviews</a>
      <div style="font-size: 14px">Free airport shuttle</div>
      <div onclick="gotoMap('Sheraton Gateway Budget LAX', 204, 33.9460, -118.3901)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_004">
        <input type="hidden" name="id_park" value="park_204">
        <div class="dayrate">$18.50 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/pacific-coast.jpg" alt="Pacific Coast">
    </div>
    <div class="listing-right">
      <div class="lot-name">Pacific Coast Budget Garage</div>
      <div class="park-type">Indoor Covered Self Park</div>
      <div style="font-size: 16px">93% recommend</div>
      <a class="mylink">789 reviews</a>
      <div style="font-size: 14px">Covered parking with shuttle</div>
      <div onclick="gotoMap('Pacific Coast Budget Garage', 205, 33.9301, -118.3965)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_005">
        <input type="hidden" name="id_park" value="park_205">
        <div class="dayrate">$8.95 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>

  <div class="listing">
    <div class="listing-left">
      <img src="/images/wallypark.jpg" alt="WallyPark">
    </div>
    <div class="listing-right">
      <div class="lot-name">WallyPark LAX Budget</div>
      <div class="park-type">Outdoor Self Park with Valet Option</div>
      <div style="font-size: 16px">95% recommend</div>
      <a class="mylink">1024 reviews</a>
      <div style="font-size: 14px">Premium shuttle service</div>
      <div onclick="gotoMap('WallyPark LAX Budget', 206, 33.9384, -118.4088)" style="cursor: pointer">
        View on Map
      </div>
      <form>
        <input type="hidden" name="id_lot" value="cap_lax_006">
        <input type="hidden" name="id_park" value="park_206">
        <div class="dayrate">$26.99 total</div>
        <button type="submit">Book Now</button>
      </form>
    </div>
  </div>
</body>
</html>
  `,

  INVALID: `
<!DOCTYPE html>
<html>
<body>
  <div class="no-results">No parking locations found for this airport.</div>
</body>
</html>
  `,
};

/**
 * Mock detail page HTML responses with address information
 * These simulate the detail pages that contain schema.org address markup
 */
export const mockDetailPageResponses: Record<string, string> = {
  // ORD locations
  park_001_cap_ord_001: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Loews O'Hare Hotel Budget Lot</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">5300 N. River Drive</span>,
      <span itemprop="addressLocality">Rosemont</span>,
      <span itemprop="addressRegion">IL</span>
      <span itemprop="postalCode">60018</span>
    </div>
  </div>
</body>
</html>
  `,
  park_002_cap_ord_002: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Easy Parking ORD Economy</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">1800 E Touhy Ave</span>,
      <span itemprop="addressLocality">Des Plaines</span>,
      <span itemprop="addressRegion">IL</span>
      <span itemprop="postalCode">60018</span>
    </div>
  </div>
</body>
</html>
  `,
  park_003_cap_ord_003: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>River Road Budget Parking</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">9700 W Bryn Mawr Ave</span>,
      <span itemprop="addressLocality">Rosemont</span>,
      <span itemprop="addressRegion">IL</span>
      <span itemprop="postalCode">60018</span>
    </div>
  </div>
</body>
</html>
  `,
  park_004_cap_ord_004: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Loews O'Hare Budget Garage</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">5300 N. River Drive</span>,
      <span itemprop="addressLocality">Rosemont</span>,
      <span itemprop="addressRegion">IL</span>
      <span itemprop="postalCode">60018</span>
    </div>
  </div>
</body>
</html>
  `,
  park_005_cap_ord_005: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Premium Parking ORD</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">10255 W Zemke Blvd</span>,
      <span itemprop="addressLocality">Chicago</span>,
      <span itemprop="addressRegion">IL</span>
      <span itemprop="postalCode">60666</span>
    </div>
  </div>
</body>
</html>
  `,
  // LAX locations
  park_201_cap_lax_001: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>QuikPark LAX Budget</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">5959 W Century Blvd</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
  park_202_cap_lax_002: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Embassy Suites Economy LAX</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">9801 Airport Blvd</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
  park_203_cap_lax_003: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Joe's Budget Airport Parking</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">6151 W Century Blvd</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
  park_204_cap_lax_004: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Sheraton Gateway Budget LAX</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">6101 W Century Blvd</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
  park_205_cap_lax_005: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>Pacific Coast Budget Garage</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">9750 Airport Blvd</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
  park_206_cap_lax_006: `
<!DOCTYPE html>
<html>
<body>
  <div itemscope itemtype="http://schema.org/LocalBusiness">
    <h1>WallyPark LAX Budget</h1>
    <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
      <span itemprop="streetAddress">9700 Bellanca Ave</span>,
      <span itemprop="addressLocality">Los Angeles</span>,
      <span itemprop="addressRegion">CA</span>
      <span itemprop="postalCode">90045</span>
    </div>
  </div>
</body>
</html>
  `,
};
