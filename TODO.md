# Take-Home Challenge: Parking Location Quote Matching

# Background

Ocra aggregates parking availability and pricing information from multiple providers. Each
provider exposes its own API, but there are no shared identifiers for the same parking facilities
across providers. To make the data actionable, we need to match locations across providers.
For this challenge, you’ll fetch and process data from at least three airport parking providers.
These providers expose publicly accessible APIs, which can be discovered with some research.

# API Discovery / Recommendations

- Candidates should integrate data from at least three providers. We recommend:
  - Cheap Airport Parking
  - ParkWhiz
  - SpotHero
- Bonus points if you find and integrate additional providers.

# Task

1. Discover APIs

   - Using the network panel, available documentation, or any other means, identify APIs from the recommended providers (and optionally others).
   - Collect availability and pricing data for airport parking given a specific airport code and date/time range.

2. Fetch Data

   - Pick at least two airport codes and retrieve data from all providers for the same date/time window.
   - Normalize dates/times, prices, and location information.

3. Normalize & Store

   - Persist your data in any form that makes sense to you (DynamoDB, SQLite, Postgres, etc).
   - Parse the responses into a structured format (e.g., JSON schema, table).

4. Location Matching

   - Implement logic to identify facilities that are the same across providers.
   - Start with straightforward fields (address, name, geolocation), but account for variations in formatting, abbreviations, or missing fields.
   - Output a dataset showing matched facilities with their provider IDs.

5. Explainability & Edge Cases
   - Document how your matching logic works, including strengths and limitations.
   - Highlight edge cases and any assumptions you made.

# Deliverables

1. ~~Python~~ Typescript code + Instructions
   - Fully runnable solution with setup instructions.
2. Normalized Dataset / Storage Example
   - JSON, CSV, or database export showing normalized data.
3. Matching Output
   - List of matched facilities across providers, optionally with confidence scores or notes for uncertain matches.
4. README / Technical Write-Up
   - Approach to API discovery and integration.
   - Matching algorithm: design decisions, assumptions, and trade-offs.
   - Limitations or edge cases.
5. AI Usage Summary

   - If you use AI tools (ChatGPT, Copilot, etc.), include short highlights or snippets of those interactions.
   - Explain what you incorporated from AI suggestions versus what you implemented differently.

6. Optional / Bonus Deliverables
   - Unit or integration tests validating matching logic.
   - Visualizations of matched locations (map or table).

- Notes on scalability or performance considerations.
- Additional provider integrations beyond the recommended three.

# Evaluation Criteria

    - Problem-solving ability: Can you go from vague requirements to a workable solution?
    - Resourcefulness: Can you discover and leverage APIs effectively?
    - Code quality: Clear, maintainable code with reasonable structure.
    - Practical thinking: Consideration of edge cases, messy data, and scaling.
    - Tooling awareness: Thoughtful use of AI tools, balanced with human judgment.

# Suggested Timeframe

    - We don’t expect a production-ready system.
    - Please aim for 3–5 hours of effort. Focus on demonstrating your reasoning and approach rather than perfect polish.
