FROM node:18-bullseye

# Install git and bash
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL client for database operations
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /workspace

# Install global npm packages
RUN npm install -g typescript tsx nodemon

# Create a non-root user
RUN useradd -m -s /bin/bash vscode
USER vscode

# Set default shell to bash
ENV SHELL=/bin/bash