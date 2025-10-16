FROM node:18-bullseye

# Install git, bash, and Docker CLI
RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Add Docker's official GPG key and repository
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker CLI and PostgreSQL client
RUN apt-get update && apt-get install -y \
    docker-ce-cli \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /workspace

# Install global npm packages
RUN npm install -g typescript tsx nodemon

# Set default shell to bash
ENV SHELL=/bin/bash