const axios = require('axios');
const jwt = process.env.PINATA_JWT_TOKEN;
const ipnsHash = process.env.IPNS_HASH;
const newCid = process.env.NEW_CID;

const publishToIPNS = async () => {
  if (!jwt || !ipnsHash || !newCid) {
    console.error("Missing required environment variables (JWT, IPNS_HASH, or NEW_CID). Cannot publish.");
    process.exit(1);
  }

  const url = 'https://api.pinata.cloud/pinning/hashToIPFS'; // This endpoint handles publishing/repinning

  try {
    const response = await axios.post(url, {
        hashToPin: newCid,
        pinataOptions: {
            cidVersion: 1
        },
        pinataMetadata: {
            keyvalues: {
                // Pinata often uses the 'name' metadata field for IPNS publishing context
                ipns_name: ipnsHash
            }
        }
    }, {
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 200) {
      console.log('✅ IPNS Publishing Request Successful!');
      console.log(`New CID ${newCid} is now being published to IPNS alias.`);
      console.log('Check Pinata IPNS section for final confirmation.');
    } else {
      console.error(`IPNS Publishing Failed. Status: ${response.status}`);
      console.error('Response:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred during IPNS API call:', error.message);
    process.exit(1);
  }
};

publishToIPNS();