const token = 'napi_n2qchukdlwxw72qs3719vz9a9l4usrv3xsst56wr1exzom6noq11x0i7zjnb3ota';

async function run() {
    try {
        const res = await fetch('https://console.neon.tech/api/v2/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
            console.log('Found project:', data.projects[0].name);
            const projectId = data.projects[0].id;
            
            // Get connection string
            const endpointsRes = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/endpoints`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const endpointsData = await endpointsRes.json();
            if (endpointsData.endpoints && endpointsData.endpoints.length > 0) {
                const endpointId = endpointsData.endpoints[0].id;
                console.log('Endpoint host:', endpointsData.endpoints[0].host);
            } else {
                console.log('No endpoints found in project');
            }
        } else {
            console.log('No projects found. Need to create one.');
        }
    } catch (e) {
        console.error(e);
    }
}
run();
