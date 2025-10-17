import { writeFileSync } from "fs";
import nodeFetch from "node-fetch";

async function testFetch() {
  const params = {
    airport_code: "ORD",
    start_time: "2025-10-18T12:00:00",
    end_time: "2025-10-22T12:00:00",
  };

  const startDate = new Date(params.start_time);
  const endDate = new Date(params.end_time);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}%2F${day}%2F${year}`;
  };

  const formatCookieDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const fromDate = formatDate(startDate);
  const fromTime = String(startDate.getHours());
  const toDate = formatDate(endDate);
  const toTime = String(endDate.getHours());

  const url = `https://www.cheapairportparking.org/parking/find.php?airport=${params.airport_code}&FromDate=${fromDate}&from_time=${fromTime}&ToDate=${toDate}&to_time=${toTime}`;

  const cookies = [
    `airport=${params.airport_code}`,
    `_from=${formatCookieDate(startDate)}_${startDate.getHours()}`,
    `_to=${formatCookieDate(endDate)}_${endDate.getHours()}`,
    `id_visit=${Date.now()}`,
    `find=1`,
  ].join("; ");

  console.log("URL:", url);
  console.log("Cookies:", cookies);
  console.log("");

  const response = await nodeFetch(url, {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      Cookie: cookies,
    },
    redirect: "follow",
  });

  const html = await response.text();
  console.log("Response status:", response.status);
  console.log("HTML length:", html.length);
  console.log("Contains listings:", html.includes('class="listing"'));

  const outputPath = "/tmp/response_with_cookies.html";
  writeFileSync(outputPath, html);
  console.log("Saved to:", outputPath);

  // Show part of response
  console.log("\nFirst 1000 chars:");
  console.log(html.substring(0, 1000));

  // Count listings if present
  const listingMatches = html.match(/class="listing"/g);
  if (listingMatches) {
    console.log("\nNumber of listing elements:", listingMatches.length);
  }
}

testFetch().catch(console.error);
