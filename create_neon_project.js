const token = 'napi_n2qchukdlwxw72qs3719vz9a9l4usrv3xsst56wr1exzom6noq11x0i7zjnb3ota';

async function run() {
    try {
        // 1. Get Organizations
        const orgRes = await fetch('https://console.neon.tech/api/v2/organizations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orgData = await orgRes.json();
        
        let orgId = undefined;
        if (orgData.organizations && orgData.organizations.length > 0) {
            orgId = orgData.organizations[0].id;
            console.log('Found Organization ID:', orgId);
        } else {
            console.log('No organizations found. Attempting to create project without org_id or user might not have set it up.');
            // Some personal accounts don't use orgs, but let's try
        }
        
        // 2. Create Project
        console.log('Creating new Neon project...');
        const bodyPayload = {
            project: {
                name: 'client-portal-db',
                region_id: 'aws-us-east-2'
            }
        };
        
        if (orgId) {
            bodyPayload.project.org_id = orgId;
        }

        const res = await fetch('https://console.neon.tech/api/v2/projects', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyPayload)
        });
        const data = await res.json();
        
        if (data.project) {
            console.log('Created project:', data.project.id);
            if (data.connection_uris && data.connection_uris.length > 0) {
                console.log('====================================');
                console.log('DATABASE_URL=' + data.connection_uris[0].connection_uri);
                console.log('====================================');
            } else {
                console.log('No connection URI returned directly.', data);
            }
        } else {
            console.error('Failed to create project:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
