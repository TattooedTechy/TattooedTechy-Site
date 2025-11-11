import os
import requests
import sys
import json
from io import BytesIO

# --- Configuration ---
# Retrieve API keys from GitHub Secrets set as environment variables
PINATA_API_KEY = os.environ.get("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.environ.get("PINATA_SECRET_API_KEY")

# !!! IMPORTANT: Update this path if your build output is elsewhere (e.g., "./dist")
DIRECTORY_TO_UPLOAD = "./build" 
PIN_NAME = "GitHub Action Deployment"

# Pinata API endpoint
PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def upload_to_pinata(directory_path):
    """
    Uploads a directory recursively to Pinata IPFS using the pinFileToIPFS endpoint.
    """
    if not PINATA_API_KEY or not PINATA_SECRET_API_KEY:
        print("::error::Pinata API keys are not set in environment variables.")
        sys.exit(1)

    if not os.path.isdir(directory_path):
        print(f"::error::The directory '{directory_path}' does not exist. Please run a build step first.")
        sys.exit(1)
        
    print(f"📦 Starting deployment of '{directory_path}' to Pinata...")

    # The 'files' list will hold the multipart form data for the request.
    files = []
    file_streams = [] # To keep track of opened files for cleanup
    
    # Headers for Pinata authentication
    headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
    }

    # Recursively traverse the directory and prepare files for upload
    for root, _, filenames in os.walk(directory_path):
        for filename in filenames:
            file_path = os.path.join(root, filename)
            
            # Determine the relative path for the IPFS folder structure
            # Example: './build/index.html' -> 'index.html'
            # Example: './build/assets/image.png' -> 'assets/image.png'
            relative_path = os.path.relpath(file_path, directory_path)
            
            # Open the file and append it to the multipart request
            try:
                file_stream = open(file_path, 'rb')
                file_streams.append(file_stream)
                
                # Pinata expects the file parts to be named 'file' in the request,
                # with the second element of the tuple being (filename, stream, content_type)
                files.append(
                    ('file', (
                        relative_path, # This is used by Pinata to define the path inside the IPFS pin
                        file_stream, 
                        'application/octet-stream'
                    ))
                )
            except IOError as e:
                print(f"::warning::Skipping file {file_path}: {e}")

    # Add Pinata metadata (optional, but helpful for Pinata dashboard)
    metadata = {
        'keyvalues': {
            'github_workflow': os.environ.get("GITHUB_WORKFLOW", "N/A"),
            'github_run_id': os.environ.get("GITHUB_RUN_ID", "N/A"),
        },
        'name': PIN_NAME
    }

    # Pinata requires the pinataMetadata to be a JSON string as a separate form-data field
    metadata_json = json.dumps(metadata)
    files.append(('pinataMetadata', (None, BytesIO(metadata_json.encode('utf-8')), 'application/json')))

    try:
        # Perform the API request
        response = requests.post(PINATA_API_URL, files=files, headers=headers)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        
        result = response.json()
        
        ipfs_hash = result.get("IpfsHash")
        
        if ipfs_hash:
            print("-------------------------------------------------------")
            print("✅ Deployment Successful")
            print(f"🔗 New IPFS CID: {ipfs_hash}")
            print(f"🌐 Pinata Gateway URL: https://gateway.pinata.cloud/ipfs/{ipfs_hash}")
            print("-------------------------------------------------------")
            
            # This is critical: it makes the CID available as a GitHub Action output variable
            # for subsequent steps (though we aren't using them, it's a good practice)
            # print(f"::set-output name=ipfs_cid::{ipfs_hash}")
            # Note: The 'set-output' command is deprecated, but logging the CID is sufficient.
            
        else:
            print(f"::error::Upload failed. Pinata response was missing IPFS hash.")
            print(f"::debug::Response: {result}")
            sys.exit(1)

    except requests.exceptions.RequestException as e:
        print(f"::error::HTTP Request Failed: {e}")
        # Print response text for debugging if available
        if 'response' in locals():
            print(f"::debug::Response Text: {response.text}")
        sys.exit(1)
    except Exception as e:
        print(f"::error::An unexpected error occurred: {e}")
        sys.exit(1)

    finally:
        # Crucial: Close all opened file handles
        for f in file_streams:
            f.close()

if __name__ == "__main__":
    upload_to_pinata(DIRECTORY_TO_UPLOAD)