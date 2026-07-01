const { spawn } = require('child_process');

const child = spawn('npx', ['-y', 'neonctl', 'projects', 'create', '--name', 'client-portal-db', '--output', 'json'], {
    env: { ...process.env, NEON_API_KEY: "napi_n2qchukdlwxw72qs3719vz9a9l4usrv3xsst56wr1exzom6noq11x0i7zjnb3ota" },
    shell: true
});

child.stdout.on('data', (data) => {
    console.log(data.toString());
});

child.stderr.on('data', (data) => {
    const text = data.toString();
    console.error('STDERR:', text);
    // If it asks a yes/no question, automatically answer No (for telemetry, etc.)
    if (text.includes('?') || text.toLowerCase().includes('telemetry')) {
        console.log('Detected prompt, sending "n"...');
        child.stdin.write('n\n');
    }
});

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
});
