const express = require('express');
const geoip = require('geoip-lite');
const app = express();
const port = 5173;

app.use(express.json());

app.post('/api/getInfo', (req, res) => {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    clientIp = clientIp.split(',')[0].trim(); // Handle proxy cases

    const geo = geoip.lookup(clientIp);
    let location = 'Location not found';
    if (geo) {
        location = `${geo.city}, ${geo.country}`;
    }

    const visitorName = req.body.visitor_name || 'Guest';
    const userLocation = req.body.location || location;

    res.json({
        ip: clientIp,
        name: visitorName,
        location: userLocation
    });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the HNG11 Server</h1>
        <button onclick="getUserInfo()">Enter your info</button>
        <div id="result"></div>
        <script>
            function getUserInfo() {
                const name = prompt('Enter your name:');
                const location = prompt('Enter your location:');
                
                fetch('/api/getInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ visitor_name: name, location: location })
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById('result').innerHTML = \`
                        <p>Client IP: \${data.ip}</p>
                        <p>Name: \${data.name}</p>
                        <p>Location: \${data.location}</p>
                    \`;
                });
            }
        </script>
    `);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
