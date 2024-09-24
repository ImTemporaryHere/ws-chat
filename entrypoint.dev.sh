#!/bin/sh

# Define path to the checksum file
HASH_FILE="/app/dev-files/package.hash"

# Compute the current checksum of package.json
CURRENT_HASH=$(md5sum /app/package.json | awk '{ print $1 }')

# Check if the checksum file exists and read the stored checksum
if [ -f "$HASH_FILE" ]; then
    STORED_HASH=$(cat "$HASH_FILE")
else
    # If the file does not exist, assume no previous hash
    STORED_HASH=""
fi

# Check if the hashes match
if [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
    echo "package.json has changed. Running entrypoint.sh..."

    # Update the stored checksum with the current hash
    echo "$CURRENT_HASH" > "$HASH_FILE"

    # Run commands if package.json changed
    npm ci
else
    echo "No changes in package.json. Skipping entrypoint.sh."
fi

# Execute the command passed as arguments
exec "$@"
