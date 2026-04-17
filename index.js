const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BUTTONS = {
  0x00000080: 'A',
  0x00000040: 'B',
  0x00000200: 'Select',
  0x00000100: 'Start',
  0x00000001: 'D-Pad Up',
  0x00000008: 'D-Pad Down',
  0x00000002: 'D-Pad Left',
  0x00000004: 'D-Pad Right',
  0x00000010: 'Right Trigger',
  0x00000020: 'Left Trigger',
  0x00000180: 'A + Start',
};

let lastPressed = null;

app.get('/', (req, res) => {
  const activeButton = req.query.active;
  
  const buttonsHtml = Object.entries(BUTTONS).map(([code, name]) => {
    const isActive = activeButton === name;
    return `<button type='submit' name='button' value='${code}' class='btn ${isActive ? 'active' : ''}'>${name}</button>`;
  }).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>3DS Button Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: #fff;
    }
    h1 { margin-bottom: 10px; font-size: 1.8em; }
    .subtitle { color: #888; margin-bottom: 30px; font-size: 0.9em; }
    .console {
      width: 380px;
      height: 240px;
      background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
      border-radius: 20px;
      position: relative;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .screen {
      width: 100%;
      height: 100%;
      background: #8bac0f;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .screen-inner {
      width: 95%;
      height: 90%;
      background: #9bbc0f;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .status {
      font-size: 24px;
      font-weight: bold;
      color: #0f380f;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .active-label {
      font-size: 12px;
      color: #306230;
      margin-top: 5px;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      width: 100%;
      max-width: 500px;
    }
    .dpad {
      width: 120px;
      height: 120px;
      position: relative;
    }
    .dpad-btn {
      position: absolute;
      width: 40px;
      height: 40px;
      background: #333;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      color: #fff;
      font-size: 12px;
      transition: all 0.1s;
    }
    .dpad-btn:hover { background: #555; }
    .dpad-btn.active { background: #e60012; box-shadow: 0 0 15px #e60012; }
    .dpad-up { top: 0; left: 50%; transform: translateX(-50%); }
    .dpad-down { bottom: 0; left: 50%; transform: translateX(-50%); }
    .dpad-left { left: 0; top: 50%; transform: translateY(-50%); }
    .dpad-right { right: 0; top: 50%; transform: translateY(-50%); }
    .dpad-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background: #222;
      border-radius: 50%;
    }
    .abxy {
      display: grid;
      grid-template-columns: repeat(3, 40px);
      grid-template-rows: repeat(3, 40px);
      gap: 5px;
      position: relative;
      width: 130px;
      height: 130px;
    }
    .abxy-btn {
      background: #4a4a4a;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.1s;
    }
    .abxy-btn:hover { background: #666; }
    .abxy-btn.active { background: #e60012; box-shadow: 0 0 15px #e60012; }
    .btn-a { grid-column: 3; grid-row: 2; }
    .btn-b { grid-column: 2; grid-row: 3; }
    .btn-x { grid-column: 2; grid-row: 1; }
    .btn-y { grid-column: 1; grid-row: 2; }
    .triggers {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 500px;
      margin-top: 20px;
    }
    .trigger-btn {
      padding: 10px 30px;
      background: #333;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      color: #fff;
      font-size: 14px;
      transition: all 0.1s;
    }
    .trigger-btn:hover { background: #555; }
    .trigger-btn.active { background: #e60012; box-shadow: 0 0 15px #e60012; }
    .start-select {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .ss-btn {
      padding: 8px 20px;
      background: #444;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      color: #fff;
      font-size: 12px;
      transition: all 0.1s;
    }
    .ss-btn:hover { background: #666; }
    .ss-btn.active { background: #e60012; box-shadow: 0 0 15px #e60012; }
    .legend {
      margin-top: 30px;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      max-width: 500px;
      width: 100%;
    }
    .legend h3 { margin-bottom: 15px; color: #aaa; }
    .legend-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
    .legend-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 5px;
      font-size: 13px;
    }
    .legend-code {
      color: #888;
      font-family: monospace;
    }
    .code-display {
      margin-top: 20px;
      padding: 15px;
      background: #0a0a0a;
      border-radius: 5px;
      font-family: monospace;
      font-size: 14px;
      text-align: center;
    }
    .code-display span { color: #e60012; }
  </style>
</head>
<body>
  <h1>3DS Button Demo</h1>
  <p class='subtitle'>Click buttons to see their 3DS Browser codes</p>

  <div class='console'>
    <div class='screen'>
      <div class='screen-inner'>
        <div class='status'>${lastPressed || 'Waiting...'}</div>
        <div class='active-label'>${lastPressed ? `Button Pressed` : 'Press a button'}</div>
      </div>
    </div>
  </div>

  <form method='post' action='/press' id='main-form' style='margin-top: 30px;'>
    <div class='controls'>
      <div class='dpad'>
        <button type='submit' name='button' value='0x00000001' class='dpad-btn dpad-up ${lastPressed === 'D-Pad Up' ? 'active' : ''}'>Up</button>
        <button type='submit' name='button' value='0x00000008' class='dpad-btn dpad-down ${lastPressed === 'D-Pad Down' ? 'active' : ''}'>Down</button>
        <button type='submit' name='button' value='0x00000002' class='dpad-btn dpad-left ${lastPressed === 'D-Pad Left' ? 'active' : ''}'>Left</button>
        <button type='submit' name='button' value='0x00000004' class='dpad-btn dpad-right ${lastPressed === 'D-Pad Right' ? 'active' : ''}'>Right</button>
        <div class='dpad-center'></div>
      </div>

      <div class='abxy'>
        <button type='submit' name='button' value='0x00000040' class='abxy-btn btn-x ${lastPressed === 'B' ? 'active' : ''}'>X</button>
        <button type='submit' name='button' value='0x00000080' class='abxy-btn btn-a ${lastPressed === 'A' ? 'active' : ''}'>A</button>
        <button type='submit' name='button' value='0x00000040' class='abxy-btn btn-b ${lastPressed === 'B' ? 'active' : ''}'>B</button>
        <button type='submit' name='button' value='0x00000040' class='abxy-btn btn-y ${lastPressed === 'B' ? 'active' : ''}'>Y</button>
      </div>
    </div>

    <div class='triggers'>
      <button type='submit' name='button' value='0x00000020' class='trigger-btn ${lastPressed === 'Left Trigger' ? 'active' : ''}'>Left Trigger (L)</button>
      <button type='submit' name='button' value='0x00000010' class='trigger-btn ${lastPressed === 'Right Trigger' ? 'active' : ''}'>Right Trigger (R)</button>
    </div>

    <div class='start-select'>
      <button type='submit' name='button' value='0x00000200' class='ss-btn ${lastPressed === 'Select' ? 'active' : ''}'>Select</button>
      <button type='submit' name='button' value='0x00000100' class='ss-btn ${lastPressed === 'Start' ? 'active' : ''}'>Start</button>
      <button type='submit' name='button' value='0x00000180' class='ss-btn ${lastPressed === 'A + Start' ? 'active' : ''}'>A + Start</button>
    </div>
  </form>

  <div class='code-display'>
    Last code: <span>${lastPressed ? Object.entries(BUTTONS).find(([k,v]) => v === lastPressed)?.[0] : '—'}</span>
  </div>

  <div class='legend'>
    <h3>3DS Button Codes (from skill)</h3>
    <div class='legend-grid'>
      ${Object.entries(BUTTONS).map(([code, name]) => `
        <div class='legend-item'>
          <span>${name}</span>
          <span class='legend-code'>${code}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    // Client-side form submission via fetch (no page reload)
    document.querySelectorAll('button[name=\"button\"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const form = document.getElementById('main-form');
        const fd = new FormData();
        fd.append('button', btn.value);
        
        await fetch('/press', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: 'button=' + encodeURIComponent(btn.value)
        });
        
        // Update active states locally for instant feedback
        document.querySelectorAll('.dpad-btn, .abxy-btn, .trigger-btn, .ss-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update display
        document.querySelector('.status').textContent = btn.textContent;
        document.querySelector('.active-label').textContent = 'Button Pressed';
      });
    });
  </script>
</body>
</html>`);
});

app.post('/press', (req, res) => {
  const buttonCode = parseInt(req.body.button, 16);
  lastPressed = BUTTONS[buttonCode] || null;
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`3DS Button Demo running at http://localhost:${PORT}`);
});