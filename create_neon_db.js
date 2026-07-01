const token = 'napi_n2qchukdlwxw72qs3719vz9a9l4usrv3xsst56wr1exzom6noq11x0i7zjnb3ota';

async function run() {
    try {
        console.log('Creating new Neon project...');
        const res = await fetch('https://console.neon.tech/api/v2/projects', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project: {
                    name: 'client-portal-db',
                    region_id: 'aws-us-east-2' // Standard region
                }
            })
        });
        const data = await res.json();
        
        if (data.project) {
            console.log('Created project:', data.project.id);
            // The connection string is usually returned in the response for creation under connection_uris
            if (data.connection_uris && data.connection_uris.length > 0) {
                console.log('DATABASE_URL:', data.connection_uris[0].connection_uri);
            } else {
                console.log('No connection URI returned directly. Getting role password...');
            }
        } else {
            console.error('Failed to create project', data);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
