FROM postgres:15

# Install PostGIS for geolocation capabilities
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-15-postgis-3 \
        postgresql-15-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

# Copy initialization script
COPY init-postgis.sql /docker-entrypoint-initdb.d/

# Add healthcheck to ensure postgres is ready to accept connections
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
    CMD pg_isready -U postgres -d ocra_dev || exit 1